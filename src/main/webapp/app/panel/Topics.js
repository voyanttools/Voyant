Ext.define('Voyant.panel.Topics', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.topics',
	statics: {
		i18n: {
			topics: 'Topics',
			documents: 'Documents'
		},
		api: {
			stopList: 'auto',
			topics: 10,
			termsPerTopic: 10,
			iterations: 100,
			perDocLimit: 1000,
			seed: 0
		},
		glyph: 'xf1ea@FontAwesome'
	},
	config: {
		/**
		 * @private
		 */
		options: [{xtype: 'stoplistoption'},{
			xtype: 'numberfield',
			name: 'perDocLimit',
			fieldLabel: 'maximum words per document',
			labelAlign: 'right',
			value: 1000,
			minValue: 1,
			step: 100,
			listeners: {
				afterrender: function(field) {
					var win = field.up("window");
					if (win && win.panel) {
						field.setValue(parseInt(win.panel.getApiParam('perDocLimit')))
						field.setFieldLabel(win.panel.localize("perDocLimit"))
					}
				},
				change: function(field, val) {
					var win = field.up("window");
					if (val>5000 && win && win.panel) {
						win.panel.toastInfo({
							html: win.panel.localize("perDocLimitHigh"),
							anchor: win.getTargetEl(),
							align: 'tr',
							maxWidth: 400
						})
					}
				}
			}
		},{
			xtype: 'numberfield',
			name: 'iterations',
			fieldLabel: 'iterations per run',
			labelAlign: 'right',
			value: 100,
			minValue: 50,
			maxValue: 1000,
			step: 50,
			listeners: {
				afterrender: function(field) {
					var win = field.up("window");
					if (win && win.panel) {
						field.setValue(parseInt(win.panel.getApiParam('iterations')))
						field.setFieldLabel(win.panel.localize("iterations"))
					}
				}
			}
		},{
			xtype: 'textfield',
			name: 'seed',
			fieldLabel: 'Random Seed',
			labelAlign: 'right',
			value: 0
		}],
		
		currentTopics: [],
		currentDocument: undefined,

		corpus: undefined
	},
	
	constructor: function(config) {
		var me = this;
		Ext.apply(this, {
			title: this.localize('title'),
			layout: {
				type: 'hbox',
				pack: 'start',
				align: 'begin',
				padding: '10px'
			},
			defaultType: 'dataview',
			items: [{
				itemId: 'topicsView',
				flex: 2,
				padding: '0 5px 0 0',
				margin: '0 5px 0 0',
				height: '100%',
				scrollable: 'y',
				store: Ext.create('Ext.data.ArrayStore',{
					fields: ['index', 'terms', 'weight']
				}),
				selectionModel: {
					type: 'dataviewmodel',
					mode: 'MULTI'
				},
				itemSelector: 'div.topicItem',
				tpl: new Ext.XTemplate(
					'<div>{[this.localize("topics")]}</div><tpl for=".">',
						'<div class="topicItem" style="background-color: {[this.getColor(values.index)]}">',
							'<div class="data weight">{[fm.number(values.weight*100, "00.0")]}%</div>',
							'<span class="term">{[values.terms.join("</span> <span class=\\"term\\">")]}</span>',
						'</div>',
					'</tpl>',
					{
						getColor: function(index) {
							var rgb = me.getColorForTopic(index);
							return 'rgba('+rgb.join(',')+',.33);'
						},
						localize: function(key) {
							return me.localize(key);
						}
					}
				),
				listeners: {
					selectionchange: function(sel, selected) {
						sel.view.removeCls('showWeight');
						me.setCurrentDocument(undefined);
						me.setCurrentTopics(selected.map(function(item) { return item.get('index') }));

						me.down('#docsView').getSelectionModel().deselectAll(true);
						me.down('#docsView').refresh();
					}
				}
			},{
				itemId: 'docsView',
				flex: 1,
				height: '100%',
				scrollable: 'y',
				store: Ext.create('Ext.data.JsonStore',{
					fields: ['docId', 'weights']
				}),
				selectionModel: {
					type: 'dataviewmodel',
					mode: 'SINGLE',
					allowDeselect: true,
					toggleOnClick: true
				},
				itemSelector: 'div.topicItem',
				tpl: new Ext.XTemplate(
					'<div>{[this.localize("documents")]}</div><tpl for=".">',
						'<div class="topicItem">',
							'{[this.getDocTitle(values.docId)]}',
							'<div class="chart">{[this.getChart(values.docId, values.weights)]}</div>',
						'</div>',
					'</tpl>',
					{
						getDocTitle: function(docId) {
							return me.getCorpus().getDocument(docId).getTitle();
						},
						getChart: function(docId, weights) {
							var chart = '';
							var topicStore = me.down('#topicsView').getStore();
							topicStore.each(function(item) {
								var index = item.get('index');
								var weight = weights[index];
								var rgb = me.getColorForTopic(index);
								var alpha = me.getCurrentDocument() === docId ? '1' : me.getCurrentTopics().length === 0 ? '.33' : me.getCurrentTopics().indexOf(index) !== -1 ? '1' : '.15';
								var color = 'rgba('+rgb.join(',')+','+alpha+')';
								chart += '<div style="width: '+(weight*100)+'%; background-color: '+color+'"> </div>';
							});
							return chart;
						},
						localize: function(key) {
							return me.localize(key);
						}
					}
				),
				listeners: {
					selectionchange: function(sel, selected) {
						me.setCurrentTopics([]);
						
						var docId = selected[0] ? selected[0].get('docId') : undefined;
						me.setCurrentDocument(docId);
						
						var topicStore = me.down('#topicsView').getStore();
						if (docId) {
							me.down('#topicsView').addCls('showWeight').getSelectionModel().deselectAll(true);
							topicStore.beginUpdate();
							sel.view.getStore().query('docId', docId).each(function(item) {
								var weights = item.get('weights');
								weights.forEach(function(weight, index) {
									topicStore.findRecord('index', index).set('weight', weight);
								});
							});
							topicStore.endUpdate();
							topicStore.sort('weight', 'DESC');
						} else {
							me.down('#topicsView').removeCls('showWeight').getSelectionModel().deselectAll(true);
							topicStore.sort('index', 'ASC');
						}

						sel.view.refresh();
					}
				}
					
			}],
			dockedItems: {
				dock: 'bottom',
				xtype: 'toolbar',
				overflowHandler: 'scroller',
				items:[
					   '<span class="info-tip" data-qtip="'+this.localize('searchTip')+'">'+this.localize('search')+'</span>'
					,{
					xtype: 'textfield',
					name: 'searchField',
					hideLabel: true,
					width: 80,
					listeners: {
						change: {
							fn: me.onQuery,
							scope: me,
							buffer: 500
						}
					}
				},
					'<span class="info-tip" data-qtip="'+this.localize('limitTermsTip')+'">'+this.localize('limitTerms')+'</span>'
				,{ 
					width: 80,
					hideLabel: true,
					xtype: 'slider',
					increment: 1,
					minValue: 1,
					maxValue: 100,
					listeners: {
						afterrender: function(slider) {
							slider.setValue(parseInt(this.getApiParam("termsPerTopic")))
						},
						changecomplete: function(slider, newvalue) {
							this.setApiParams({termsPerTopic: newvalue});
							this.runIterations();
						},
						scope: this
					}
				},
					'<span class="info-tip" data-qtip="'+this.localize('numTopicsTip')+'">'+this.localize('numTopics')+'</span>'
				,{ 
					width: 80,
					hideLabel: true,
					xtype: 'slider',
					increment: 1,
					minValue: 1,
					maxValue: 100,
					listeners: {
						afterrender: function(slider) {
							slider.setValue(parseInt(this.getApiParam("topics")))
						},
						changecomplete: function(slider, newvalue) {
							this.setApiParams({topics: newvalue});
							this.runIterations();
						},
						scope: this
					}
				},{
					text: 'Run',//new Ext.Template(this.localize('runIterations')).apply([100]),
					itemId: 'iterations',
					glyph: 'xf04b@FontAwesome',
					tooltip: this.localize('runIterationsTip'),
					handler: this.runIterations,
					scope: this
				}]
			}
		});

		this.callParent(arguments);
		

		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
		
		// create a listener for corpus loading (defined here, in case we need to load it next)
		this.on('loadedCorpus', function(src, corpus) {
			this.setCorpus(corpus);
			if (this.rendered) {
				this.initialize();
			}
			else {
				this.on("afterrender", function() {
					this.initialize();
				}, this)
			}

		});
	},
	
	runIterations: function() {
		var params = this.getApiParams();
		params.tool = 'analysis.TopicModeling';
		params.corpus = this.getCorpus().getAliasOrId();

		var iterations = this.getApiParam('iterations');
		var msg = Ext.MessageBox.progress({
			title: this.localize("runningIterations"),
			message: new Ext.Template(this.localize('runningIterationsCount')).apply([iterations])
		});

		Ext.Ajax.request({
			url: this.getTromboneUrl(),
			params: params,
			success: function(response, req) {
				msg.close();

				var data = JSON.parse(response.responseText);
				
				var topicsStore = this.down('#topicsView').getStore();
				topicsStore.loadData(data.topicModeling.topicWords.map(function(words, i) {
					return [i, words, 0];
				}));

				data.topicModeling.topicDocuments.sort(function(a, b) {
					var docIndexA = this.getCorpus().getDocument(a.docId).getIndex();
					var docIndexB = this.getCorpus().getDocument(b.docId).getIndex();
					return docIndexA-docIndexB;
				}.bind(this));
				this.down('#docsView').getStore().loadData(data.topicModeling.topicDocuments);
				this.down('#docsView').refresh();
			},
			scope: this
		});
	},

	getColorForTopic: function(topicIndex) {
		return this.getApplication().getColor(topicIndex);
	},

	onQuery: function(cmp, query) {
		var topicsView = this.down('#topicsView');
		topicsView.getEl().query('.highlighted').forEach(function(hi) {
			hi.classList.remove('highlighted');
		});
		
		if (query.trim() !== '') {
			var matcher = new RegExp(query, 'gi');
			var topicsStore = topicsView.getStore();
			var indexes = [];
			var matches = [];
			topicsStore.each(function(record) {
				var terms = record.get('terms');
				var termMatches = [];
				for (var i = 0; i < terms.length; i++) {
					var term = terms[i];
					if (term.search(matcher) !== -1) {
						termMatches.push(i);
					}
				}
				if (termMatches.length > 0) {
					indexes.push(record.get('index'));
				}
				matches.push(termMatches);
			});
			if (indexes.length > 0) {
				topicsView.setSelection(indexes.map(function(index) {return topicsStore.findRecord('index', index)}));
				topicsView.getNodes().forEach(function(node, i) {
					var nodeMatches = matches[i];
					if (nodeMatches.length > 0) {
						var terms = node.querySelectorAll('.term');
						nodeMatches.forEach(function(termIndex) {
							terms[termIndex].classList.add('highlighted');
						})
					}
				});
			} else {
				this.setCurrentTopics([]);
				topicsView.getSelectionModel().deselectAll(true);
				this.down('#docsView').refresh();
			}
		} else {
			this.setCurrentTopics([]);
			topicsView.getSelectionModel().deselectAll(true);
			this.down('#docsView').refresh();
		}
	},
	
	initialize: function() {
		this.runIterations();
	},

	getExtraDataExportItems: function() {
		return [{
			name: 'export',
			inputValue: 'dataAsTsv',
			boxLabel: this.localize('exportGridCurrentTsv')
		}]
	},

	exportDataAsTsv: function(panel, form) {
		var topicsValue = "Topic\t";
		var docsValue = 'Document Title';

		var topicOrder = [];

		this.down('#topicsView').getStore().getData().each(function(record, i) {
			if (i === 0) {
				topicsValue += record.get('terms').map(function(t, i) { return 'Term '+i; }).join("\t");
			}
			
			topicOrder.push(record.get('index'));

			topicsValue += "\nTopic "+record.get('index')+"\t"+record.get('terms').join("\t");
			docsValue += "\tTopic "+record.get('index')+' Weight';
		});

		this.down('#docsView').getStore().getData().each(function(record) {
			var title = this.getCorpus().getDocument(record.get('docId')).getTitle();
			
			var weights = topicOrder.map(function(topicIndex) {
				var weight = record.get('weights')[topicIndex];
				return Ext.util.Format.number(weight*100, "00.######");
			}).join("\t");

			docsValue += "\n"+title+"\t"+weights;
		}, this);

		Ext.create('Ext.window.Window', {
			title: panel.localize('exportDataTitle'),
			height: 290,
			width: 450,
			bodyPadding: 10,
			layout: {
				type: 'vbox',
				pack: 'start',
				align: 'stretch'
			},
			modal: true,
			defaults: {
				margin: '0 0 5px 0'
			},
			items: [{
				html: panel.localize('exportDataTsvMessage')
			},{
				html: '<textarea class="x-form-text-default x-form-textarea" style="height: 76px; width: 100%">'+topicsValue+'</textarea>'
			},{
				html: '<textarea class="x-form-text-default x-form-textarea" style="height: 76px; width: 100%">'+docsValue+'</textarea>'
			}],
			buttonAlign: 'center',
			buttons: [{
				text: 'OK',
				handler: function(btn) {
					btn.up('window').close();
				}
			}]
		}).show();
	}
	
});