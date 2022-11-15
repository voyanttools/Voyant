Ext.define('Voyant.panel.Topics', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel','Voyant.widget.LiveSearchGrid'],
	alias: 'widget.topics',
	statics: {
		i18n: {
		},
		api: {
			stopList: 'auto',
			topics: 10,
			termsPerTopic: 10,
			iterations: 100,
			perDocLimit: 1000,
			query: undefined
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
			minValue: 1,
			maxValue: 10000,
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
		}],
		
		corpus: undefined,

		documentWeightStore: Ext.create('Ext.data.ArrayStore',{
			fields: ['topicIndex', 'docId', 'topicWeight']
		}),
		
		documentTopicSmoothing : 0.1,
		topicWordSmoothing : 0.01,
		vocabularySize : 0,
		vocabularyCounts : {},
		stopwords : {},
		docSortSmoothing : 10.0,
		sumDocSortSmoothing : 10.0 * 25, // update?
		requestedSweeps : 0,
		wordTopicCounts : {},
		topicWordCounts : [],
		tokensPerTopic : [],
		topicWeights : Array(25),
		documents: [],
		progress: undefined,
		totalIterations: 0,
		exportGridAll: false
	},
	
	zeros: function(count, val) {
		val = val || 0;
		var ret = Array(count)
		for (var i=0; i<count; i++) {ret[i]=val;}
		return ret;
	},
	
	constructor: function(config ) {
		var me = this;
		Ext.apply(this, {
			title: this.localize('title'),
			layout: {
				type: 'hbox',
				pack: 'start',
				align: 'stretch'
			},
			store: {
				fields: ['topicIndex', 'topicWords'],
				data: []
			},
			columns: [{
				text: this.localize("topic"),
				tooltip: this.localize("topicTip"),
				flex: 3,
				dataIndex: 'topicWords',
				sortable: false
			},{
				xtype: 'widgetcolumn',
				text: this.localize("scores"),
				tooltip: this.localize("scoresTip"),
				flex: 1,
				dataIndex: 'topicIndex',
				onWidgetAttach: function(col, widget, rec) {
					var topicIndex = rec.get('topicIndex');
					var scores = [];
					me.getDocumentWeightStore().each(function(record) {
						if (record.get('topicIndex') === topicIndex) {
							scores.push(record.get('topicWeight'));
						}
					});
					widget.setValues(scores);
				},
				widget: {
					xtype: 'sparklinebar',
					tipTpl: new Ext.XTemplate('{[this.getDocumentTitle(values.offset,values.value)]}', {
						getDocumentTitle: function(docIndex, score) {
							return this.panel.getCorpus().getDocument(docIndex).getTitle()+"<br>coverage: "+Ext.util.Format.number(score*100, "0,000.0")+"%"
						},
						panel: me 
					})
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
							fn: me.onTextFieldChange,
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
							this.sweep();
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
					maxValue: 200,
					listeners: {
						afterrender: function(slider) {
							slider.setValue(parseInt(this.getApiParam("topics")))
						},
						changecomplete: function(slider, newvalue) {
							this.setApiParams({topics: newvalue});
							this.sweep();
						},
						scope: this
					}
				},{
					text: new Ext.Template(this.localize('runIterations')).apply([100]),
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
		
		this.resetData();
		
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
		
		this.on('query', function(src, query) {
			this.setApiParam('query', query);
			this.updateSearchResults();
		})
		
	},
	
	resetData: function() {
		var topics = parseInt(this.getApiParam('topics'));
	 	this.setVocabularyCounts({});
		this.setSumDocSortSmoothing(this.getDocSortSmoothing()*topics);
		this.setRequestedSweeps(0);
		this.setWordTopicCounts({});
		this.setTopicWordCounts([]);
		this.setTokensPerTopic(this.zeros(topics));
		this.setTopicWeights(this.zeros(topics));
		this.setDocuments([]);
		this.setTotalIterations(0);
	},
	
	runIterations: function() {
		this.sweep();
	},
	
	sweep: function() {
		var topics = parseInt(this.getApiParam('topics'));

		var params = this.getApiParams();
		params.tool = 'analysis.TopicModeling';
		params.corpus = this.getCorpus().getAliasOrId();
		// params.noCache = 1;

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
				var docWeights = [];
				data.topicModeling.topicDocuments.sort(function(a, b) {
					var docIndexA = this.getCorpus().getDocument(a.docId).getIndex();
					var docIndexB = this.getCorpus().getDocument(b.docId).getIndex();
					return docIndexA-docIndexB;
				}.bind(this));
				for (var i = 0; i < topics; i++) {
					data.topicModeling.topicDocuments.forEach(function(doc) {
						docWeights.push([i, doc.docId, doc.weights[i]]);
					});
				}
				this.getDocumentWeightStore().loadData(docWeights);
				this.getStore().loadData(data.topicModeling.topicWords.map(function(topic, i) {
					return [i, topic.join(' ')];
				}));
			},
			scope: this
		});
	},
	
	initialize: function() {
		// make sure we have the right number of iterations in our label (especially after an options change)
		var val = new Ext.Template(this.localize('runIterations')).apply([Ext.util.Format.number(parseInt(this.getApiParam('iterations')), "0,000")]);
		var iterations = this.down('#iterations').setText(val);
	}
	
});