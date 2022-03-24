/**
 * A class for calling corpus.DocumentEntities and displaying the progress of that call.
 * This is usually a preliminary call before making use of the entities, e.g. corpus.EntityCollocationsGraph
 */
Ext.define('Voyant.data.util.DocumentEntities', {
	extend: 'Ext.Base',
	mixins: ['Voyant.util.Localization'],
	statics: {
		i18n: {
			identifyingDocEnts: 'Identifying Document Entities'
		}
	},

	config: {
		progressWindow: undefined,
		updateDelay: 5000,
		timeoutId: undefined
	},
	
	constructor: function(params) {
		this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);
		this.initConfig();
		this.callParent();

		return this.load(params);
	},

	/**
	 * Load the entities
	 * @param {Object} params Additional params
	 * @param {String} params.annotator Annotator can be: 'stanford' (default) or 'nssi'
	 * @returns {Promise}
	 */
	load: function(params) {
		var dfd = new Ext.Deferred();

		params = Ext.apply({
			tool: 'corpus.DocumentEntities',
			corpus: Voyant.application.getCorpus().getId(),
			noCache: true
		}, params || {});

		this.doLoad(params, dfd);

		return dfd.promise;
	},

	doLoad: function(params, dfd) {
		var me = this;
		Ext.Ajax.request({
			url: Voyant.application.getTromboneUrl(),
			params: params
		}).then(function(response) {
			var data = Ext.decode(response.responseText).documentEntities;
			var isDone = me.updateProgress(data.status);
			if (isDone) {
				me.getProgressWindow().close();
				dfd.resolve(data.entities);
			} else {
				me.setTimeoutId(Ext.defer(me.doLoad, me.getUpdateDelay(), me, [params, dfd]));
			}
		}, function(err) {
			console.warn(err);
			dfd.reject(err);
		});
	},

	updateProgress: function(statusArray) {
		var total = statusArray.length;
		var numDone = 0;
		statusArray.forEach(function(item) {
			if (item[1] === 'done' || item[1] === 'failed') numDone++;
		});

		if (this.getProgressWindow() === undefined) {
			this.setProgressWindow(Ext.create('Ext.window.Window', {
				title: this.localize('identifyingDocEnts'),
				width: 400,
				height: 150,
				minimizable: true,
				closeAction: 'destroy',
				layout: {
					type: 'vbox',
					align: 'middle',
					pack: 'center'
				},
				items: [{
					xtype: 'container',
					html: '<div class="x-mask-msg-text">'+this.localize('identifyingDocEnts')+'</div>',
					margin: '0 0 10 0'
				},{
					itemId: 'progress',
					xtype: 'progressbar',
					width: 300
				}],
				tools: [{
					type: 'restore',
					itemId: 'restoreButton',
					hidden: true,
					handler: function(evt, el, owner, tool) {
						var win = owner.up('window');
						win.expand();
						win.anchorTo(Ext.getBody(), 'c-c', [0, -win.getBox().height], {duration: 250});
						tool.hide();
					}
				}],
				listeners: {
					minimize: function(win) {
						win.collapse(Ext.Component.DIRECTION_BOTTOM, false);
						win.anchorTo(Ext.getBody(), 'br-br', [0,0], {duration: 250});
						win.down('#restoreButton').show();
					},
					destroy: function(win) {
						clearTimeout(this.getTimeoutId());
						this.setProgressWindow(undefined);
					},
					scope: this
				}
			}));
		}

		var win = this.getProgressWindow();
		
		win.down('#progress').updateProgress(numDone/total, numDone+' / '+total);
		win.setTitle(this.localize('identifyingDocEnts')+' '+numDone+' / '+total);

		win.show();

		return numDone === total;
	}


});