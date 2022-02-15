Ext.define('Voyant.panel.RezoViz', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.rezoviz',
	statics: {
		i18n: {
			timedOut: 'The entities call took too long and has timed out. Retry?',
			maxLinks: 'Max. Links'
		},
		api: {
			query: undefined,
			mode: undefined,
			limit: 50,
			type: ['organization','location','person'],
			minEdgeCount: 2,
			terms: undefined,
			stopList: 'auto',
			docId: undefined
		},
		glyph: 'xf1e0@FontAwesome'
	},
	
	config: {
		nodeData: undefined,
		linkData: undefined,
		
		visId: undefined,
		vis: undefined,
		visLayout: undefined,
		nodes: undefined,
		links: undefined,
		zoom: undefined,
		
		dragging: false,
		
		currentNode: undefined,
		
		graphStyle: {
			// locationNode: {
			// 	normal: {
			// 		fill: '#c7e9c0',
			// 		stroke: '#a1d99b'
			// 	},
			// 	highlight: {
			// 		fill: '#74c476',
			// 		stroke: '#31a354'
			// 	}
			// },
			// personNode: {
			// 	normal: {
			// 		fill: '#fdd0a2',
			// 		stroke: '#fdae6b'
			// 	},
			// 	highlight: {
			// 		fill: '#fd8d3c',
			// 		stroke: '#e6550d'
			// 	}
			// },
			// organizationNode: {
			// 	normal: {
			// 		fill: '#dadaeb',
			// 		stroke: '#bcbddc'
			// 	},
			// 	highlight: {
			// 		fill: '#9e9ac8',
			// 		stroke: '#756bb1'
			// 	}
			// },
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
		
		graphPhysics: {
			damping: 0.4, // 0 = no damping, 1 = full damping
			centralGravity: 0.1, // 0 = no grav, 1 = high grav
			nodeGravity: -50,  // negative = repel, positive = attract
			springLength: 100,
			springStrength: 0.1, // 0 = not strong, >1 = probably too strong
			collisionScale: 1.25 // 1 = default, 0 = no collision 
		},

		options: [{xtype: 'stoplistoption'}]
	},
	
	constructor: function(config) {
		this.setNodeData([]);
		this.setLinkData([]);
		
		this.setVisId(Ext.id(null, 'rezoviz_'));

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
				this.initLoad();
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
				if (this.getNodeData().length === 0) { // only initLoad if there isn't already data
					Ext.Function.defer(this.initLoad, 100, this);
				}
			}
		}, this);
		
		this.on('query', function(src, query) {this.loadFromQuery(query);}, this);
		
		this.on('resize', function(panel, width, height) {
			var vis = Ext.get(this.getVisId());
			if (vis) {
				var el = this.body;//this.getLayout().getRenderTarget();
				var elHeight = el.getHeight();
				var elWidth = el.getWidth();
				
				vis.el.dom.setAttribute('width', elWidth);
				vis.el.dom.setAttribute('height', elHeight);
				this.getVisLayout()
					.force('x', d3.forceX(elWidth/2))
					.force('y', d3.forceY(elHeight/2));
//        			.alpha(0.5).restart(); // restarting physics messes up zoomToFit
				
				Ext.Function.defer(this.zoomToFit, 100, this);
 //       		this.zoomToFit();
			}
		}, this);
		
		me.callParent(arguments);

	},
	
	initLoad: function() {
		this.initGraph();
		this.initPhysics();
		
		this.preloadEntities();
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

	preloadEntities: function() {
		var me = this;
		// TODO uncomment when new entities calls are in place
		// new Voyant.data.util.DocumentEntities().then(function() {
		// 	me.getEntities();
		// });
		me.getEntities();
	},

	getEntities: function() {
		this.resetGraph();

		var corpusId = this.getCorpus().getId();
		var el = this.getLayout().getRenderTarget();
		el.mask(this.localize('loadingEntities'));

		Ext.Ajax.request({
			url: this.getApplication().getTromboneUrl(),
			method: 'POST',
			params: {
				tool: 'corpus.EntityCollocationsGraph',
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
					Ext.Msg.confirm(this.localize('error'), this.localize('noEntitiesForEdgeCount'), function(button) {
						if (button === 'yes') {
							var newEdgeCount = Math.max(1, this.getApiParam('minEdgeCount')-1);
							this.queryById('minEdgeCount').setRawValue(newEdgeCount);
							this.setApiParam('minEdgeCount', newEdgeCount);
							this.preloadEntities();
						}
					}, this);
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
				id: this.idGet(n),
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

			var sourceId = this.idGet(nodes[link[0]]);
			var targetId = this.idGet(nodes[link[1]]);
			visEdges.push({
				source: sourceId,
				target: targetId,
				// value: edges[i].count,
				value: nodes[link[1]].rawFreq,
				id: sourceId+'-'+targetId
			});
		}
		
		this.setNodeData(visNodes);
		this.setLinkData(visEdges);

		this.refresh();
	},
	
	idGet: function(ent) {
		var term = ent.term;
		var type = ent.type;
		return type+'_'+term.replace(/\W/g, '_');
	},
	
	initPhysics: function() {
		if (this.getVisLayout()) {
			var physics = this.getGraphPhysics();
			this.getVisLayout()
				.velocityDecay(physics.damping)
				.force('link', d3.forceLink().id(function(d) { return d.id; }).distance(physics.springLength).strength(physics.springStrength))
				.force('charge', d3.forceManyBody().strength(physics.nodeGravity))
				.force('collide', d3.forceCollide(function(d) { return Math.sqrt(d.bbox.width * d.bbox.height) * physics.collisionScale; }));
			this.getVisLayout().force('x').strength(physics.centralGravity);
			this.getVisLayout().force('y').strength(physics.centralGravity);
		}
	},
	
	initGraph: function() {
		var el = this.getLayout().getRenderTarget();
		el.update('');
		var width = el.getWidth();
		var height = el.getHeight();
		
		this.setVisLayout(d3.forceSimulation()
			.force('x', d3.forceX(width/2))
			.force('y', d3.forceY(height/2))
			.on('tick', function() {
				this.getLinks()
					.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return d.target.x; })
					.attr('y2', function(d) { return d.target.y; });
	//    		this.getLinks().attr('d', function(d) {
	//				return 'M' + d[0].x + ',' + d[0].y
	//						+ 'S' + d[1].x + ',' + d[1].y
	//						+ ' ' + d[2].x + ',' + d[2].y;
	//			});
				this.getNodes().attr('transform', function(d) {
					var x = d.x;
					var y = d.y;
					x -= d.bbox.width*0.5;
					y -= d.bbox.height*0.5;
					return 'translate('+x+','+y+')';
				}.bind(this));
				
				if (!this.getDragging() && this.getVisLayout().alpha() < 0.005) {
					this.getVisLayout().alpha(-1); // trigger end event
				}
			}.bind(this))
			.on('end', function() {
				Ext.Function.defer(this.zoomToFit, 100, this);
			}.bind(this))
		);
		
		var svg = d3.select(el.dom).append('svg').attr('id',this.getVisId()).attr('class', 'linksGraph').attr('width', width).attr('height', height);
		var g = svg.append('g');
		
		var zoom = d3.zoom()
			.scaleExtent([1/4, 4])
			.on('zoom', function() {
				g.attr('transform', d3.event.transform);
			});
		this.setZoom(zoom);
		svg.call(zoom);
		
		this.setLinks(g.append('g').attr('class', 'links').selectAll('.link'));
		this.setNodes(g.append('g').attr('class', 'nodes').selectAll('.node'));
		this.setVis(g);
	},
	
	resetGraph: function() {
		this.setNodeData([]);
		this.setLinkData([]);
		this.refresh();
	},
	
	refresh: function() {
		var me = this;
		
		var nodeData = this.getNodeData();
		var linkData = this.getLinkData();
		
		var link = this.getLinks().data(linkData, function(d) { return d.id; });
		link.exit().remove();
		var linkEnter = link.enter().append('line')
			.attr('class', 'link')
			.attr('id', function(d) { return d.id; })
			.on('mouseover', me.linkMouseOver.bind(me))
			.on('mouseout', me.linkMouseOut.bind(me))
			.on('click', function(data) {
				d3.event.stopImmediatePropagation();
				d3.event.preventDefault();
				this.dispatchEvent('termsClicked', this, ['"'+data.source.term+' '+data.target.term+'"~'+this.getApiParam('context')]);
			}.bind(me))
//			.style('fill', 'none')
			.style('cursor', 'pointer')
			.style('stroke-width', function(d) {
				return Math.max(1, Math.min(10, Math.log(d.value)) );
			});
			
		this.setLinks(linkEnter.merge(link));

		var node = this.getNodes().data(nodeData, function(d) { return d.id; });
		node.exit().remove();
		var nodeEnter = node.enter().append('g')
			.attr('class', function(d) { return 'node '+d.type; })
			.attr('id', function(d) { return d.id; })
			.on('mouseover', me.nodeMouseOver.bind(me))
			.on('mouseout', me.nodeMouseOut.bind(me))
			.on('click', function(data) {
				d3.event.stopImmediatePropagation();
				d3.event.preventDefault();
				this.dispatchEvent('termsClicked', this, [data.term]);
			}.bind(me))
			.on('dblclick', function(data) {
				d3.event.stopImmediatePropagation();
				d3.event.preventDefault();
			}.bind(me))
			.on('contextmenu', function(d, i) {
				d3.event.preventDefault();
//				me.getTip().hide();
			})
			.call(d3.drag()
				.on('start', function(d) {
					me.setDragging(true);
					if (!d3.event.active) me.getVisLayout().alpha(0.3).restart();
					d.fx = d.x;
					d.fy = d.y;
					d.fixed = true;
				})
				.on('drag', function(d) {
					me.getVisLayout().alpha(0.3); // don't let simulation end while the user is dragging
					d.fx = d3.event.x;
					d.fy = d3.event.y;
				})
				.on('end', function(d) {
					me.setDragging(false);
//					if (!d3.event.active) me.getVisLayout().alpha(0);
					if (d.fixed != true) {
						d.fx = null;
						d.fy = null;
					}
				})
			);
		
		nodeEnter.append('title').text(function(d) { return d.title; });
		
		nodeEnter.append('rect')
			.style('stroke-width', 1)
			.style('stroke-opacity', 1);
		
		nodeEnter.append('text')
			.attr('font-family', function(d) { return me.getApplication().getCategoriesManager().getFeatureForTerm('font', d.term); })
			.attr('font-size', function(d) { return Math.max(1, Math.log(d.value))*10; })
			.text(function(d) { return d.term; })
			.each(function(d) { d.bbox = this.getBBox(); }) // set bounding box for later use
			.style('cursor', 'pointer')
			.style('user-select', 'none')
			.attr('dominant-baseline', 'middle');
		
		this.setNodes(nodeEnter.merge(node));
		
		this.getVis().selectAll('rect')
			.attr('width', function(d) { return d.bbox.width+16; })
			.attr('height', function(d) { return d.bbox.height+8; })
			.attr('rx', function(d) { return Math.max(2, d.bbox.height * 0.2); })
			.attr('ry', function(d) { return Math.max(2, d.bbox.height * 0.2); })
			.call(this.applyNodeStyle.bind(this));
		this.getVis().selectAll('text')
			.attr('dx', 8)
			.attr('dy', function(d) { return d.bbox.height*0.5+4; });
		
		this.getVis().selectAll('line').call(this.applyLinkStyle.bind(this));
		
		
		this.getVisLayout().nodes(nodeData);
		this.getVisLayout().force('link').links(linkData);
		this.getVisLayout().alpha(1).restart();
	},
	
	zoomToFit: function(paddingPercent, transitionDuration) {
		var bounds = this.getVis().node().getBBox();
		var width = bounds.width;
		var height = bounds.height;
		var midX = bounds.x + width/2;
		var midY = bounds.y + height/2;
		var svg = this.getVis().node().parentElement;
		var svgRect = svg.getBoundingClientRect();
		var fullWidth = svgRect.width;
		var fullHeight = svgRect.height;
		var scale = (paddingPercent || 0.8) / Math.max(width/fullWidth, height/fullHeight);
		var translate = [fullWidth/2 - scale*midX, fullHeight/2 - scale*midY];
		if (width<1) {return} // FIXME: something strange with spyral
	 	
		d3.select(svg)
			.transition()
			.duration(transitionDuration || 500)
			.call(this.getZoom().transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
	},
 
	applyNodeStyle: function(sel, nodeState) {
		var state = nodeState === undefined ? 'normal' : nodeState;
		sel.style('fill', function(d) { var type = d.type+'Node'; return this.getGraphStyle()[type][state].fill; }.bind(this));
		sel.style('stroke', function(d) { var type = d.type+'Node'; return this.getGraphStyle()[type][state].stroke; }.bind(this));
	},
	
	applyLinkStyle: function(sel, linkState) {
		var state = linkState === undefined ? 'normal' : linkState;
		sel.style('stroke', function(d) { return this.getGraphStyle().link[state].stroke; }.bind(this));
		sel.style('stroke-opacity', function(d) { return this.getGraphStyle().link[state].strokeOpacity; }.bind(this));
	},
	
	linkMouseOver: function(d) {
		this.getVis().selectAll('line').call(this.applyLinkStyle.bind(this));
		this.getVis().select('#'+d.id).call(this.applyLinkStyle.bind(this), 'highlight');
	},
	
	linkMouseOut: function(d) {
		this.getVis().selectAll('line').call(this.applyLinkStyle.bind(this));
	},
	
	nodeMouseOver: function(d) {
		this.setCurrentNode(d);
		
		this.getVis().selectAll('rect').call(this.applyNodeStyle.bind(this));
		
		this.getLinks().each(function(link) {
			var id;
			if (link.source.id == d.id) {
				id = link.target.id;
			} else if (link.target.id == d.id) {
				id = link.source.id;
			}
			if (id !== undefined) {
				this.getVis().select('#'+id+' rect').call(this.applyNodeStyle.bind(this), 'highlight');
				this.getVis().select('#'+link.id).call(this.applyLinkStyle.bind(this), 'highlight');
			}
		}.bind(this));
		
		this.getVis().select('#'+d.id+' rect')
			.style('stroke-width', 3)
			.call(this.applyNodeStyle.bind(this), 'highlight');
	},
	
	nodeMouseOut: function(d) {
		this.setCurrentNode(undefined);
		
		this.getVis().selectAll('rect')
			.style('stroke-width', 1)
			.call(this.applyNodeStyle.bind(this));
		
		this.getVis().selectAll('line')
			.call(this.applyLinkStyle.bind(this));
	}
	
});
