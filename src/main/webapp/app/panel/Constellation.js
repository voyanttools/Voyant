/**
 * Constellation produces a specialized network graph of high frequency terms that are connected by similar word vectors.
 *
 * @example
 * 
 * let config = {
 * 	"analysis": "ca",
 * 	"dimensions": 2,
 * 	"limit": 50
 * }; 
 * 
 * loadCorpus("austen").tool("constellation", config);
 * @class Constellation
 * @tutorial constellation
 * @memberof Tools
 */
Ext.define('Voyant.panel.Constellation', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.constellation',
	statics: {
		i18n: {
			title: 'Constellation',
			options: 'Options',
			termSearch: 'Term Search',
			cutoff: 'Similarity Threshold',
			numTerms: 'Terms',
			analysis: 'Analysis',
			ca: 'Correspondence Analysis',
			pca: 'Principal Component Analysis',
			tsne: 't-SNE',
			distance: 'Distance',
			cosine: 'Cosine Similarity',
			euclidean: 'Euclidean',
			maxStrength: 'Max Strength',
			maxConnections: 'Max Connections',
			linkStrength: 'Link Strength',
			bodyStrength: 'Body Strength',
			help: 'Constellation produces a specialized network graph of high frequency terms that are connected by similar word vectors.',
			helpTip: 'Constellation produces a specialized network graph of high frequency terms that are connected by similar word vectors.'
		},
		api: {
			/**
			 * @memberof Tools.Constellation
			 * @instance
			 * @property {String} analysis The type of analysis to perform. Options are: 'ca', 'pca', and 'tsne'.
			 */
			analysis: 'ca',

			/**
			 * @memberof Tools.Constellation
			 * @instance
			 * @property {docId}
			 */
			docId: undefined,

			/**
			 * @memberof Tools.Constellation
			 * @instance
			 * @property {limit}
			 * @default
			 */
			limit: 150,

			/**
			 * @memberof Tools.Constellation
			 * @instance
			 * @property {Number} dimensions The number of dimensions to render, either 2 or 3.
			 * @default
			 */
			dimensions: 3,

			/**
			 * @memberof Tools.Constellation
			 * @instance
			 * @property {stopList}
			 * @default
			 */
			stopList: 'auto'
		},
		glyph: 'xf1e0@FontAwesome'
	},
	
	config: {
		caStore: undefined,
		pcaStore: undefined,
		tsneStore: undefined,

		jsLoaded: false,
		corpusLoaded: false,

		chartData: undefined,

		distanceType: 'cosine',
		maxStrength: 1000,
		maxConnections: 50,
		linkStrength: 1500,
		bodyStrength: -1500,

		termSearchTimeout: null,

		options: [{xtype: 'stoplistoption'}]
	},
	
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	
	initComponent: function() {
		this.setCaStore(Ext.create('Voyant.data.store.CAAnalysis', {
			parentPanel: this,
			listeners: { load: this.handleData, scope: this }
		}));
		this.setPcaStore(Ext.create('Voyant.data.store.PCAAnalysis', {
			parentPanel: this,
			listeners: { load: this.handleData, scope: this }
		}));
		this.setTsneStore(Ext.create('Voyant.data.store.TSNEAnalysis', {
			parentPanel: this,
			listeners: { load: this.handleData, scope: this }
		}));

		Ext.apply(this, {
			title: this.localize('title'),
			layout: 'border',
			items: [{
				xtype: 'container',
				region: 'center',
				layout: 'fit',
				style: 'backgroundColor: #fff',
				items: {
					xtype: 'component',
					itemId: 'visParent',
					listeners: {
						resize: function(cmp, width, height) {
							var svg = cmp.getEl().down('svg');
							if (svg) {
								d3.select(svg.dom).attr('width', width).attr('height', height);
								Ext.Function.defer(this.zoomToFit, 50, this);
							}
						},
						scope: this
					}
				}
			},{
				title: this.localize('options'),
				xtype: 'panel',
				width: 200,
				region: 'west',
				split: true,
				collapsible: true,
				scrollable: 'y',
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				defaults: {
					xtype: 'button',
					margin: '5',
					labelAlign: 'top'
				},
				items: [{
					xtype: 'documentselectorbutton'
				},{
					text: this.localize('analysis'),
					itemId: 'analysis',
					glyph: 'xf1ec@FontAwesome',
					menu: {
						items: [
							{text: this.localize('ca'), itemId: 'analysis_ca', group:'analysis', xtype: 'menucheckitem'},
							{text: this.localize('pca'), itemId: 'analysis_pca', group:'analysis', xtype: 'menucheckitem'},
							{text: this.localize('tsne'), itemId: 'analysis_tsne', group:'analysis', xtype: 'menucheckitem'}
						],
						listeners: {
							render: function(field) {
								field.child('#analysis_'+this.getApiParam('analysis')).setChecked(true);
							},
							click: function(menu, item) {
								if (item !== undefined) {
									var analysis = item.getItemId().split('_')[1];
									if (analysis !== this.getApiParam('analysis')) {
										this.setApiParam('analysis', analysis);
										this.loadFromApis();
									}
								}
							},
							scope: this
						}
					}
				},{
					xtype: 'slider',
					fieldLabel: this.localize('numTerms'),
					minValue: 10,
					maxValue: 1000,
					increment: 5,
					listeners: {
						render: function(field) {
							field.setValue(this.getApiParam('limit'));
						},
						changecomplete: function(field, newVal) {
							this.setApiParam('limit', newVal);
							this.loadFromApis();
						},
						scope: this
					}
				},{
					xtype: 'textfield',
					fieldLabel: this.localize('termSearch'),
					itemId: 'termSearch',
					listeners: {
						change: function(field, term) {
							if (this.getTermSearchTimeout() !== null) {
								clearTimeout(this.getTermSearchTimeout());
							}
							this.setTermSearchTimeout(setTimeout(this.updateGraph.bind(this), 500));
						},
						scope: this
					}
				},{
					xtype: 'radiogroup',
					fieldLabel: this.localize('distance'),
					items: [{
						name: 'distance', boxLabel: this.localize('cosine'), inputValue: 'cosine', checked: true
					},{
						name: 'distance', boxLabel: this.localize('euclidean'), inputValue: 'euclidean'
					}],
					listeners: {
						change: function(field, newVal) {
							this.setDistanceType(newVal.distance);
							this.loadFromApis();
						},
						scope: this
					}
				},{
					xtype: 'slider',
					fieldLabel: this.localize('maxStrength'),
					minValue: 0,
					maxValue: 8000,
					increment: 1,
					listeners: {
						render: function(field) {
							field.setValue(this.getMaxStrength());
						},
						changecomplete: function(field, newVal) {
							this.setMaxStrength(newVal);
							this.updateGraph();
						},
						scope: this
					}
				},{
					xtype: 'slider',
					fieldLabel: this.localize('maxConnections'),
					minValue: 2,
					maxValue: 100,
					increment: 1,
					listeners: {
						render: function(field) {
							field.setValue(this.getMaxConnections());
						},
						changecomplete: function(field, newVal) {
							this.setMaxConnections(newVal);
							this.updateGraph();
						},
						scope: this
					}
				},{
					xtype: 'slider',
					fieldLabel: this.localize('linkStrength'),
					value: this.getLinkStrength(),
					minValue: 1,
					maxValue: 3000,
					increment: 1,
					listeners: {
						change: function(field, newVal) {
							this.setLinkStrength(newVal);
							this.getChartData().simulation.force("link").distance(x => x.sim * newVal);
    						this.getChartData().simulation.alpha(1).restart();
						},
						scope: this
					}
				},{
					xtype: 'slider',
					fieldLabel: this.localize('bodyStrength'),
					value: this.getBodyStrength(),
					minValue: -3000,
					maxValue: -1,
					increment: 1,
					listeners: {
						change: function(field, newVal) {
							this.setBodyStrength(newVal);
							this.getChartData().simulation.force("body").strength(newVal);
    						this.getChartData().simulation.alpha(1).restart();
						},
						scope: this
					}
				}]
			}]
		});

		this.on('boxready', function(src, corpus) {
			console.log('boxready')
			d3.select('head').insert('script')
				.attr('type', 'module')
				.attr('onload', function() {
					this.setJsLoaded(true);
					if (this.getCorpusLoaded()) {
						console.log('br load')
						this.loadFromApis();
					}
				}.bind(this))
				.attr('src', Voyant.application.getBaseUrl()+'resources/constellation/main.js');
			d3.select('head').insert('link')
				.attr('rel', 'stylesheet')
				.attr('type', 'text/css')
				.attr('href', Voyant.application.getBaseUrl()+'resources/constellation/style.css');
		}, this);
		
		this.on('loadedCorpus', function(src, corpus) {
			if (this.isVisible()) {
				console.log('loadedCorpus')
				this.getCaStore().setCorpus(corpus);
				this.getPcaStore().setCorpus(corpus);
				this.getTsneStore().setCorpus(corpus);

				this.setCorpusLoaded(true);
				if (this.getJsLoaded()) {
					console.log('lc load')
					this.loadFromApis();
				}
			}
		}, this);

		this.on('corpusSelected', function(src, corpus) {
			this.setApiParam('docId', undefined);
			this.loadFromApis();
		}, this);
		this.on('documentsSelected', function(src, docIds) {
			this.setApiParam('docId', docIds);
			this.loadFromApis();
		}, this);
		
		this.on('activate', function() { // load after tab activate (if we're in a tab panel)
			if (this.getCorpus()) {
				// only preloadEntities if there isn't already data
				// if (this.down('voyantnetworkgraph').getNodeData().length === 0) {
				// 	Ext.Function.defer(this.preloadEntities, 100, this);
				// }
			}
		}, this);
		
		this.on('query', function(src, query) {this.loadFromQuery(query);}, this);
		
		this.on('constellationJSLoaded', function() {
			console.log('constellationJSLoaded');
			if (this.getJsLoaded() && this.getCorpusLoaded()) {
				this.loadFromApis();
			}
		})

		this.callParent(arguments);
	},

	initGraph: function(nodes, edges) {
		var el = this.down('#visParent').getEl();
		el.update('');
		var width = el.getWidth();
		var height = el.getHeight();
		
		var graphId = 'constellationGraph';
		var svg = d3.select(el.dom).append('svg').attr('width', width).attr('height', height).attr('id', graphId);
		
		[svg, simulation] = Voyant.panel.Constellation.constellation.init_graph(width, height, graphId);

		simulation.force("link").distance(x => x.sim * this.getLinkStrength());
		simulation.force("body").strength(this.getBodyStrength());

		svg.on('nodeClicked', function(event) {
			console.log(event);
			this.dispatchEvent('termsClicked', this, [event.detail.nodeId]);
		}.bind(this));

		var metric = this.getDistanceType() === 'cosine' ? Voyant.panel.Constellation.vec.cosine_similarity : Voyant.panel.Constellation.vec.distance;

		this.setChartData({
			svg: svg,
			simulation: simulation,
			metric: metric,
			cutoff: this.getMaxStrength(),
			connections: this.getMaxConnections(),
			hidden: false,//document.getElementById("hidetext").checked,
			hide_unselected: false,//document.getElementById("hide-unselected").checked,
			selection: new Set(),
			nodes: nodes,
			edges: edges
		});


	},

	updateGraph: function() {
		var chartData = this.getChartData();
		chartData.cutoff = this.getMaxStrength();
		chartData.connections = this.getMaxConnections();
		
		Voyant.panel.Constellation.constellation.update_graph(chartData);
	},

	handleNodeClick: function(event, data) {
		event.stopImmediatePropagation();
		event.preventDefault();
		this.dispatchEvent('termsClicked', this, [data.id]);
	},

	loadFromApis: function() {
		if (Voyant.panel.Constellation.vec === undefined) return;

		var params = {};
		Ext.apply(params, this.getApiParams());
		delete params.analysis;
		if (this.getApiParam('analysis') === 'tsne') {
			this.getTsneStore().load({
				params: params
			});
		} else if (this.getApiParam('analysis') === 'pca') {
			this.getPcaStore().load({
				params: params
			});
		} else {
			this.getCaStore().load({
				params: params
			});
		}
	},

	handleData: function(store) {
		var rec = store.getAt(0);
		var tokens = rec.getTokens();
		var data = tokens.map(function(token) { return token.getData(); });
		if (this.getApiParam('analysis') === 'ca') {
			data = data.filter(function(d) { return d.category === 'term'; });
		}
	
		let nodes = data.map(x => { return {
			id: x["term"],
			label: x["term"],
			vector: x["vector"]
		}});

		var metric = this.getDistanceType() === 'cosine' ? Voyant.panel.Constellation.vec.cosine_similarity : Voyant.panel.Constellation.vec.distance;
		let edges = Voyant.panel.Constellation.constellation.generate_edges(nodes, metric);
		
		this.initGraph(nodes, edges);
		this.updateGraph();
	}
	
});
