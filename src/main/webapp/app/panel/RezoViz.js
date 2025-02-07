/**
 * RezoViz represents connections between people, places and organizations that co-occur in multiple documents.
 * 
 * @class RezoViz
 * @tutorial rezoviz
 * @memberof Tools
 */
Ext.define('Voyant.panel.RezoViz', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.rezoviz',
	statics: {
		i18n: {
			timedOut: 'The entities call took too long and has timed out. Retry?',
			maxLinks: 'Max. Links',
			nerService: 'Entity Identification Service'
		},
		api: {
			/**
			 * @memberof Tools.RezoViz
			 * @instance
			 * @property {Query}
			 */
			query: undefined,

			/**
			 * @memberof Tools.RezoViz
			 * @instance
			 * @property {Limit}
			 * @default
			 */
			limit: 50,

			/**
			 * @memberof Tools.RezoViz
			 * @instance
			 * @property {String[]} type The entity types to include in the results. One or more of: 'location', 'organization', 'person'.
			 */
			type: ['organization','location','person'],

			/**
			 * @memberof Tools.RezoViz
			 * @instance
			 * @property {Number} minEdgeCount
			 */
			minEdgeCount: 2,

			/**
			 * @memberof Tools.RezoViz
			 * @instance
			 * @property {StopList}
			 * @default
			 */
			stopList: 'auto',

			/**
			 * @memberof Tools.RezoViz
			 * @instance
			 * @property {DocId}
			 */
			docId: undefined,

			/**
			 * @memberof Tools.RezoViz
			 * @instance
			 * @property {String} nerService Which NER service to use: 'spacy', 'nssi', or 'voyant'.
			 * @default
			 */
			nerService: 'spacy'
		},
		glyph: 'xf1e0@FontAwesome'
	},
	
	config: {
		graphStyle: {
			link: {
				normal: {
					stroke: '#000000',
					strokeOpacity: 0.1
				},
				highlight: {
					stroke: '#000000',
					strokeOpacity: 0.5
				}
			}
		},

		options: [{xtype: 'stoplistoption'}]
	},
	
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	
	initComponent: function() {
		var me = this;

		var graphStyle = {};
		var entityTypes = ['person', 'location', 'organization'];
		entityTypes.forEach(function(entityType) {
			var baseColor = me.getApplication().getColorForEntityType(entityType, true);
			var nFill = d3.hsl(baseColor);
			nFill.s *= .85;
			nFill.l *= 1.15;
			var nStroke = d3.hsl(baseColor);
			nStroke.s *= .85;
			var hFill = d3.hsl(baseColor);
			var hStroke = d3.hsl(baseColor);
			hStroke.l *= .75;
			graphStyle[entityType+'Node'] = {
				normal: {
					fill: nFill.toString(),
					stroke: nStroke.toString()
				},
				highlight: {
					fill: hFill.toString(),
					stroke: hStroke.toString()
				}
			}
		});
		this.setGraphStyle(Ext.apply(this.getGraphStyle(), graphStyle));

		Ext.apply(me, {
			title: this.localize('title'),
			layout: 'fit',
			items: {
				xtype: 'voyantnetworkgraph',
				applyNodeStyle: function(sel, nodeState) {
					var state = nodeState === undefined ? 'normal' : nodeState;
					var style = this.getGraphStyle().node[state];
					sel.selectAll('rect')
						.style('fill', function(d) { var type = d.type+'Node'; return me.getGraphStyle()[type][state].fill; })
						.style('stroke', function(d) { var type = d.type+'Node'; return me.getGraphStyle()[type][state].stroke; });
				},
				listeners: {
					nodeclicked: function(graph, node) {
						me.dispatchEvent('termsClicked', me, [node.term]);
					},
					edgeclicked: function(graph, edge) {
						me.dispatchEvent('termsClicked', me, ['"'+edge.source.term+' '+edge.target.term+'"~'+me.getApiParam('context')]);
					}
				}
			},
			dockedItems: [{
				dock: 'bottom',
				xtype: 'toolbar',
				overflowHandler: 'scroller',
				items: [{
					xtype: 'corpusdocumentselector'
				},{
					xtype: 'button',
					text: this.localize('categories'),
					menu: {
						items: [{
							xtype: 'menucheckitem',
							text: this.localize('people'),
							itemId: 'person',
							checked: true
						},{
							xtype: 'menucheckitem',
							text: this.localize('locations'),
							itemId: 'location',
							checked: true
						},{
							xtype: 'menucheckitem',
							text: this.localize('organizations'),
							itemId: 'organization',
							checked: true
						},{
							xtype: 'button',
							text: this.localize('reload'),
							style: 'margin: 5px;',
							handler: this.categoriesHandler,
							scope: this
						}]
					}
				},{
					xtype: 'button',
					text: this.localize('nerService'),
					menu: {
						items: [{
							xtype: 'menucheckitem',
							group: 'nerService',
							text: 'SpaCy',
							itemId: 'spacy',
							checked: true,
							handler: this.serviceHandler,
							scope: this
						},{
							xtype: 'menucheckitem',
							group: 'nerService',
							text: 'NSSI',
							itemId: 'nssi',
							checked: true,
							handler: this.serviceHandler,
							scope: this
						},{
							xtype: 'menucheckitem',
							group: 'nerService',
							text: 'Voyant',
							itemId: 'voyant',
							checked: false,
							handler: this.serviceHandler,
							scope: this
						}]
					}
				},{
					xtype: 'numberfield',
					itemId: 'minEdgeCount',
					fieldLabel: this.localize('minEdgeCount'),
					labelAlign: 'right',
					labelWidth: 120,
					width: 170,
					maxValue: 10,
					minValue: 1,
					allowDecimals: false,
					allowExponential: false,
					allowOnlyWhitespace: false,
					listeners: {
						render: function(field) {
							field.setRawValue(this.getApiParam('minEdgeCount'));
						},
						change: function(field, newVal) {
							if (field.isValid()) {
								this.setApiParam('minEdgeCount', newVal);
								this.preloadEntities();
							}
						},
						scope: this
					}
				},{
					xtype: 'slider',
					fieldLabel: this.localize('maxLinks'),
					labelAlign: 'right',
					labelWidth: 100,
					width: 170,
					minValue: 10,
					maxValue: 1000,
					increment: 10,
					listeners: {
						render: function(field) {
							field.setValue(this.getApiParam('limit'));
						},
						changecomplete: function(field, newVal) {
							this.setApiParam('limit', newVal);
							this.preloadEntities();
						},
						scope: this
					}
				}]
			}]
		});
		
		this.on('loadedCorpus', function(src, corpus) {
			if (this.isVisible()) {
				this.preloadEntities();
			}
		}, this);

		this.on('corpusSelected', function(src, corpus) {
			this.setApiParam('docId', undefined);
			this.preloadEntities();
		}, this);
		this.on('documentsSelected', function(src, docIds) {
			this.setApiParam('docId', docIds);
			this.preloadEntities();
		}, this);
		
		this.on('activate', function() { // load after tab activate (if we're in a tab panel)
			if (this.getCorpus()) {
				// only preloadEntities if there isn't already data
				if (this.down('voyantnetworkgraph').getNodeData().length === 0) {
					Ext.Function.defer(this.preloadEntities, 100, this);
				}
			}
		}, this);
		
		this.on('query', function(src, query) {this.loadFromQuery(query);}, this);
		
		me.callParent(arguments);

	},

	categoriesHandler: function(item) {
		var categories = [];
		item.up('menu').items.each(function(checkitem) {
			if (checkitem.checked) {
				categories.push(checkitem.itemId);
			}
		});
		
		this.setApiParam('type', categories);
		this.preloadEntities();
	},

	serviceHandler: function(menuitem) {
		this.setApiParam('nerService', menuitem.itemId);
		this.preloadEntities();
	},

	preloadEntities: function() {
		var me = this;
		new Voyant.data.util.DocumentEntities({annotator: this.getApiParam('nerService')}, function() {
			me.getEntities();
		});
	},

	getEntities: function() {
		this.down('voyantnetworkgraph').resetGraph();

		var corpusId = this.getCorpus().getId();
		var el = this.getLayout().getRenderTarget();
		el.mask(this.localize('loadingEntities'));

		Ext.Ajax.request({
			url: this.getApplication().getTromboneUrl(),
			method: 'POST',
			params: {
				tool: 'corpus.EntityCollocationsGraph',
				annotator: this.getApiParam('nerService'),
				type: this.getApiParam('type'),
				limit: this.getApiParam('limit'),
				minEdgeCount: this.getApiParam('minEdgeCount'),
				corpus: this.getCorpus().getId(),
				docId: this.getApiParam('docId'),
				stopList: this.getApiParam('stopList'),
				noCache: true
			},
			timeout: 120000,
			success: function(response) {
				el.unmask();
				var obj = Ext.decode(response.responseText);
				if (obj.entityCollocationsGraph.edges.length==0) {
					this.showError({msg: this.localize('noEntities')});
					var currMinEdgeCount = this.getApiParam('minEdgeCount');
					if (currMinEdgeCount > 1) {
						Ext.Msg.confirm(this.localize('error'), this.localize('noEntitiesForEdgeCount'), function(button) {
							if (button === 'yes') {
								var newEdgeCount = Math.max(1, currMinEdgeCount-1);
								this.queryById('minEdgeCount').setRawValue(newEdgeCount);
								this.setApiParam('minEdgeCount', newEdgeCount);
								this.preloadEntities();
							}
						}, this);
					}
				}
				else {
					this.processEntities(obj.entityCollocationsGraph);
				}
			},
			failure: function(response) {
				el.unmask();
				Ext.Msg.confirm(this.localize('error'), this.localize('timedOut'), function(button) {
					if (button === 'yes') {
						this.preloadEntities();
					}
				}, this);
			},
			scope: this
		});
	},

	processEntities: function(entityParent) {
		var nodes = entityParent.nodes;
		var edges = entityParent.edges;
		
		var el = this.getLayout().getRenderTarget();
		var cX = el.getWidth()/2;
		var cY = el.getHeight()/2;

		var visNodes = [];
		for (var i = 0; i < nodes.length; i++) {
			var n = nodes[i];

			visNodes.push({
				term: n.term,
				title: n.term + ' ('+n.rawFreq+')',
				type: n.type,
				value: n.rawFreq,
				fixed: false,
				x: cX,
				y: cY
			});
		}
		
		var visEdges = [];
		for (var i = 0; i < edges.length; i++) {
			var link = edges[i].nodes;

			var sourceId = nodes[link[0]].term;
			var targetId = nodes[link[1]].term;
			visEdges.push({
				source: sourceId,
				target: targetId,
				rawFreq: nodes[link[1]].rawFreq // TODO
			});
		}

		this.down('voyantnetworkgraph').loadJson({nodes: visNodes, edges: visEdges});
	}
	
});
