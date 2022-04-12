/**
 * A class for calling corpus.DocumentEntities and displaying the progress of that call.
 * This is usually a preliminary call before making use of the entities, e.g. corpus.EntityCollocationsGraph
 */
Ext.define('Voyant.data.util.DocumentEntities', {
	extend: 'Ext.Base',
	mixins: ['Voyant.util.Localization'],
	statics: {
		i18n: {
			identifyingDocEnts: 'Identifying Document Entities',
			error: 'Error Identifying Document Entities',
			retry: 'Retry Failed Documents',
			done: 'Done'
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
			var hasFailures = false;
			for (var i = 0; i < data.status.length; i++) {
				if (data.status[i][1].indexOf('failed') === 0) {
					hasFailures = true;
					break;
				}
			}
			if (isDone) {
				var win = me.getProgressWindow();
				win.down('#identifyingMessage').getEl().down('div.x-mask-msg-text').setStyle('backgroundImage', 'none');
				win.down('#doneButton').setHidden(false);

				if (hasFailures) {
					win.down('#retryButton').setHidden(false).setDisabled(false).setHandler(function(btn) {
						me.load(Ext.apply({retryFailures: true}, params));
						btn.setDisabled(true);
					}, me);
				} else {
					win.down('#retryButton').setHidden(true);
				}

				dfd.resolve(data.entities);
			} else {
				me.setTimeoutId(Ext.defer(me.doLoad, me.getUpdateDelay(), me, [params, dfd]));
			}
		}, function(err) {
			Voyant.application.showError(me.localize('error'));
			console.warn(err);
			dfd.reject(err);
		});
	},

	updateProgress: function(statusArray) {
		var total = statusArray.length;
		var numDone = 0;
		statusArray.forEach(function(item) {
			if (item[1] === 'done' || item[1].indexOf('failed') === 0) numDone++;
		});

		if (this.getProgressWindow() === undefined) {
			this.setProgressWindow(Ext.create('Ext.window.Window', {
				title: this.localize('identifyingDocEnts'),
				width: 400,
				height: 300,
				minimizable: true,
				closeAction: 'destroy',
				layout: {
					type: 'vbox',
					align: 'middle',
					pack: 'stretch',
				},
				items: [{
					itemId: 'identifyingMessage',
					xtype: 'container',
					html: '<div class="x-mask-msg-text">'+this.localize('identifyingDocEnts')+'</div>',
					flex: .5,
					margin: '20 0 10 0'
				},{
					itemId: 'progressBar',
					xtype: 'progressbar',
					width: 300,
					height: 20,
					margin: '0 0 10 0'
				},{
					xtype: 'dataview',
					width: 300,
					flex: 1,
					margin: '0 0 10 0',
					scrollable: 'y',
					itemId: 'documentStatus',
					store: Ext.create('Ext.data.ArrayStore', {
						fields: ['docTitle', 'statusIcon']
					}),
					itemSelector: '.doc',
					tpl: [
					'<tpl for=".">',
						'<div class="doc">',
							'<i class="fa {statusIcon}" style="margin-right: 5px;"></i>',
							'<span class="" style="">{docTitle}</span>',
						'</div>',
					'</tpl>']
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
				buttons: [{
					itemId: 'retryButton',
					xtype: 'button',
					text: this.localize('retry'),
					hidden: true
				},{
					itemId: 'doneButton',
					xtype: 'button',
					text: this.localize('done'),
					hidden: true,
					handler: function(btn) {
						btn.up('window').close();
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
		
		win.down('#progressBar').updateProgress(numDone/total, numDone+' / '+total);
		
		var docsStore = Voyant.application.getCorpus().getDocuments();
		var statusWithDocTitles = statusArray.map(function(status) {
			var docTitle = docsStore.getById(status[0]).getShortTitle();
			var statusMsg = status[1];
			var statusIcon = 'fa-spinner';
			if (statusMsg.indexOf('failed') === 0) {
				statusIcon = 'fa-exclamation-triangle';
				console.log('ner: '+docTitle+', '+statusMsg);
			} else if (statusMsg === 'done') {
				statusIcon = 'fa-check';
			} else if (statusMsg === 'queued') {
				statusIcon = 'fa-clock-o';
			}
			return [docTitle, statusIcon];
		});
		win.down('#documentStatus').getStore().loadData(statusWithDocTitles);

		win.setTitle(this.localize('identifyingDocEnts')+' '+numDone+' / '+total);

		win.show();

		return numDone === total;
	}


});