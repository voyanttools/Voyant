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
			done: 'Done',
			statusDone: 'Done',
			statusFailed: 'Failed',
			statusQueued: 'Queued',
			statusStarted: 'Started',
			status413: 'Your document is too large for this service'
		}
	},

	config: {
		progressWindow: undefined,
		updateDelay: 5000,
		bins: 25,
		timeoutId: undefined
	},
	
	// FIXME duplicating colors from styles.css
	entitiesColors: {
		date: '#80b1d3',
		time: '#80b1d3',
		duration: '#80b1d3',
		person: '#fdb462',
		organization: '#bebada',
		gpe: '#bebada',
		loc: '#b3de69',
		location: '#b3de69',
		money: '#ffffb3',
		misc: '#8dd3c7',
		product: undefined,
		cardinal: undefined,
		quantity: undefined,
		event: undefined,
		fac: undefined,
		language: undefined,
		law: undefined,
		norp: undefined,
		percent: undefined,
		work_of_art: undefined,
		unknown: undefined,
		set: undefined
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
	 * @param {String} params.annotator Annotator can be: 'stanford' (default) or 'nssi' or 'spacy'
	 */
	load: function(params) {
		params = Ext.apply({
			tool: 'corpus.DocumentEntities',
			corpus: Voyant.application.getCorpus().getId(),
			noCache: true
		}, params || {});

		this.doLoad(params, true);
	},

	doLoad: function(params, firstCall) {
		var me = this;
		Ext.Ajax.request({
			url: Voyant.application.getTromboneUrl(),
			params: params
		}).then(function(response) {
			var data = Ext.decode(response.responseText).documentEntities;
			
			var progressArray = me._getProgressFromStatus(data.status);
			var isDone = progressArray[0] === progressArray[1];
			var hasFailures = progressArray[2];
			var has413Status = progressArray[3].indexOf('413') !== -1; // 413 = corpus too large

			if (firstCall && isDone && !hasFailures) {
				var win = me.getProgressWindow();
				if (win) {
					win.close();
				}

				me._addDistributionsToEntities(data.entities, me.getBins());
				me._addEntitiesToCategories(data.entities);
				Voyant.application.dispatchEvent('entityResults', me, data.entities);
			} else {
				me.updateProgress(data.status, progressArray);
				if (isDone) {
					var win = me.getProgressWindow();
					win.down('#identifyingMessage').getEl().down('div.x-mask-msg-text').setStyle('backgroundImage', 'none');
					win.down('#doneButton').setHidden(false);
	
					if (hasFailures && !has413Status) {
						win.down('#retryButton').setHidden(false).setDisabled(false).setHandler(function(btn) {
							me.load(Ext.apply({retryFailures: true}, params));
							btn.setDisabled(true);
						}, me);
					} else {
						win.down('#retryButton').setHidden(true);
						if (firstCall) {
							win.close();
						}
					}

					me._addDistributionsToEntities(data.entities, me.getBins());
					me._addEntitiesToCategories(data.entities);
					Voyant.application.dispatchEvent('entityResults', me, data.entities);
				} else {
					delete params.retryFailures;
					me.setTimeoutId(Ext.defer(me.doLoad, me.getUpdateDelay(), me, [params, false]));
				}
			}
		}, function(err) {
			Voyant.application.showError(me.localize('error'));
			console.warn(err);
			Voyant.application.dispatchEvent('entityResults', me, null);
		});
	},

	_getProgressFromStatus: function(statusArray) {
		var total = statusArray.length;
		var numDone = 0;
		var hasFailures = false;
		var statusCodes = [];
		statusArray.forEach(function(item) {
			if (item[1] === 'done') numDone++;
			else if (item[1].indexOf('failed') === 0) {
				numDone++;
				hasFailures = true;
				var statusCode = item[1].match(/\d\d\d$/);
				if (statusCode !== null) {
					statusCodes.push(statusCode[0]);
				}
			}
		});
		return [numDone, total, hasFailures, statusCodes];
	},

	updateProgress: function(statusArray, progressArray) {
		if (this.getProgressWindow() === undefined) {
			this.setProgressWindow(Ext.create('Ext.window.Window', {
				title: this.localize('identifyingDocEnts'),
				width: 400,
				height: 300,
				minimizable: true,
				closeAction: 'destroy',
				layout: {
					type: 'vbox',
					align: 'stretch',
					pack: 'center',
				},
				items: [{
					itemId: 'identifyingMessage',
					xtype: 'container',
					html: '<div style="text-align: center" class="x-mask-msg-text">'+this.localize('identifyingDocEnts')+'</div>',
					flex: .5,
					margin: '20 10 10 10'
				},{
					itemId: 'progressBar',
					xtype: 'progressbar',
					height: 20,
					margin: '0 10 10 10'
				},{
					xtype: 'dataview',
					flex: 1,
					margin: '0 10 10 10',
					scrollable: 'y',
					itemId: 'documentStatus',
					store: Ext.create('Ext.data.ArrayStore', {
						fields: ['docTitle', 'statusIcon', 'statusText']
					}),
					itemSelector: '.doc',
					tpl: [
					'<tpl for=".">',
						'<div class="doc">',
							'<i class="fa {statusIcon}" style="margin-right: 5px;"></i>',
							'<span class="" style="">{docTitle}</span>',
							'<span style="float: right">{statusText}</span>',
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

		var numDone = progressArray[0];
		var total = progressArray[1];

		var win = this.getProgressWindow();
		
		win.down('#progressBar').updateProgress(numDone/total, numDone+' / '+total);
		
		var docsStore = Voyant.application.getCorpus().getDocuments();
		var statusWithDocTitles = statusArray.map(function(status, index) {
			var docTitle = docsStore.getById(status[0]).getShortTitle();
			var statusMsg = status[1];
			var statusIcon = 'fa-spinner';
			var statusText = '';//this.localize('statusStarted');
			if (statusMsg.indexOf('failed') === 0) {
				statusIcon = 'fa-exclamation-triangle';
				if (statusMsg.indexOf('413') !== -1) {
					statusText = this.localize('status413');
				} else {
					statusText = this.localize('statusFailed');
				}
				console.log('ner: '+docTitle+', '+statusMsg);
			} else if (statusMsg === 'done') {
				statusIcon = 'fa-check';
				statusText = '';//this.localize('statusDone');
			} else if (statusMsg === 'queued') {
				statusIcon = 'fa-clock-o';
				statusText = '';//this.localize('statusQueued');
			}
			return [docTitle, statusIcon, statusText];
		}, this);
		win.down('#documentStatus').getStore().loadData(statusWithDocTitles);

		win.setTitle(this.localize('identifyingDocEnts')+' '+numDone+' / '+total);

		win.show();
	},

	_addEntitiesToCategories: function(entities) {
		var categories = {};
		entities.forEach(function(entity) {
			if (categories[entity.type] === undefined) {
				categories[entity.type] = [];
			}
			categories[entity.type].push(entity.term);
		});
		var catMan = Voyant.application.getCategoriesManager();
		Object.keys(categories).forEach(function(category) {
			var color = this.entitiesColors[category];
			if (color !== undefined) {
				catMan.addCategory(category);
				catMan.addTerms(category, categories[category]);	
				catMan.setCategoryFeature(category, 'color', color);
			}
		}, this);	
	},

	_addDistributionsToEntities: function(entities, bins) {
		function doAdd(docIndex, positions) {
			var totalTokens = Voyant.application.getCorpus().getDocument(docIndex).get('tokensCount-lexical');
			var binSize = Math.floor(totalTokens/bins);
			
			var distribution = new Array(bins);
			for (var i = 0; i < bins; i++) { distribution[i] = 0; }

			positions.forEach(function(position) {
				var bin;
				if (Array.isArray(position)) {
					bin = Math.floor(position[0] / binSize);
				} else {
					bin = Math.floor(position / binSize);
				}
				distribution[bin]++;
			});

			return distribution;
		}

		entities.forEach(function(entity) {
			if (entity.positions) {
				entity.distributions = doAdd(entity.docIndex, entity.positions);
			} else {
				console.warn('no positions for:',entity);
				entity.distributions = [];
			}
		}, this);
	}

});