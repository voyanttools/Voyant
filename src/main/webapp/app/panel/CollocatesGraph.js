/**
 * Collocates Graph represents keywords and terms that occur in close proximity as a force directed network graph.
 *
 * @example
 *
 *   let config = {
 *     centralize: null,
 *     context: 5,
 *     limit: 5,
 *     query: null,
 *     stopList: "auto",
 *   };
 *
 *   loadCorpus("austen").tool("collocatesgraph", config);
 *
 * @class CollocatesGraph
 * @tutorial collocatesgraph
 * @memberof Tools
 */
Ext.define('Voyant.panel.CollocatesGraph', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.collocatesgraph',
    statics: {
    	i18n: {
    	},
    	api: {
			/**
			 * @memberof Tools.CollocatesGraph
			 * @instance
			 * @property {query}
			 */
    		query: undefined,

			/**
			 * @memberof Tools.CollocatesGraph
			 * @instance
			 * @property {limit}
			 * @default
			 */
    		limit: 5,

			/**
			 * @memberof Tools.CollocatesGraph
			 * @instance
			 * @property {stopList}
			 * @default
			 */
    		stopList: 'auto',

			/**
			 * @memberof Tools.CollocatesGraph
			 * @instance
			 * @property {context}
			 * @default
			 */
    		context: 5,

			/**
			 * @memberof Tools.CollocatesGraph
			 * @instance
			 * @property {String} centralize If specified, will "centralize" on this keyword
			 */
    		centralize: undefined
    	},
		glyph: 'xf1e0@FontAwesome'
    },
    
    config: {
    	options: [{xtype: 'stoplistoption'},{
    		xtype: 'categoriesoption'
    	}],
    	
    	nodeData: undefined,
    	linkData: undefined,
    	
    	visId: undefined,
    	vis: undefined,
    	visLayout: undefined,
    	nodes: undefined,
    	links: undefined,
    	zoom: undefined,
    	
    	dragging: false,
    	
    	contextMenu: undefined,
    	
    	currentNode: undefined,
    	
    	networkMode: undefined,
    	
    	graphStyle: {
    		keywordNode: {
    			normal: {
    				fill: '#c6dbef',
    				stroke: '#6baed6'
    			},
    			highlight: {
    				fill: '#9ecae1',
    				stroke: '#3182bd'
    			}
    		},
    		contextNode: {
    			normal: {
    				fill: '#fdd0a2',
    				stroke: '#fdae6b'
    			},
    			highlight: {
    				fill: '#fd9a53',
    				stroke: '#e6550d'
    			}
    		},
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
    		defaultMode: {
	    		damping: 0.4, // 0 = no damping, 1 = full damping
	    		centralGravity: 0.1, // 0 = no grav, 1 = high grav
	    		nodeGravity: -50,  // negative = repel, positive = attract
				springLength: 100,
				springStrength: 0.25, // 0 = not strong, >1 = probably too strong
				collisionScale: 1.25 // 1 = default, 0 = no collision 
    		},
    		centralizedMode: {
    			damping: 0.4, // 0 = no damping, 1 = full damping
    			centralGravity: 0.1, // 0 = no grav, 1 = high grav
	    		nodeGravity: -1,  // negative = repel, positive = attract
				springLength: 200,
				springStrength: 1, // 0 = not strong, >1 = probably too strong
				collisionScale: 1 // 1 = default, 0 = no collision 
    		}
    	}
    },

    DEFAULT_MODE: 0,
    CENTRALIZED_MODE: 1,
    
    constructor: function(config) {
    	this.setNodeData([]);
    	this.setLinkData([]);
    	
    	this.setVisId(Ext.id(null, 'links_'));

    	this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
    		title: this.localize('title'),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                   xtype: 'querysearchfield'
                },{
                	text: me.localize('clearTerms'),
					glyph: 'xf014@FontAwesome',
                	handler: this.resetGraph,
                	scope: me
                },this.localize('context'),{
                	xtype: 'slider',
                	itemId: 'contextSlider',
                	minValue: 3,
                	value: 5,
                	maxValue: 30,
                	increment: 2,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(this.getApiParam('context'));
                		},
                		changecomplete: function(slider, newValue) {
                			this.setApiParam('context', slider.getValue());
                			if (this.getNetworkMode() === this.DEFAULT_MODE) {
                    			var terms = this.getNodeData().map(function(node) { return node.term; });
                				if (terms.length > 0) {
                					this.setNodeData([]);
                					this.setLinkData([]);
                					this.refresh();
                					
                					this.loadFromQuery(terms);
                				}
                			}
                		},
                		scope: me
                	}
                }]
            }]
        });
        
        this.setContextMenu(Ext.create('Ext.menu.Menu', {
			renderTo: Ext.getBody(),
			items: [{
				xtype: 'box',
				itemId: 'label',
				margin: '5px 0px 5px 5px',
				html: ''
			},{
		        xtype: 'menuseparator'
			},{
				xtype: 'menucheckitem',
				text: 'Fixed',
				itemId: 'fixed',
				listeners: {
					checkchange: function(c, checked, e) {
						var node = this.getCurrentNode();
						if (node !== undefined) {
							var data = {
								fixed: checked
							};
							if (checked) {
								data.fx = node.x;
								data.fy = node.y;
							} else {
								data.fx = null;
								data.fy = null;
							}
							this.updateDataForNode(node.id, data);
						}
					},
					scope: this
				}
			},{
				xtype: 'button',
				text: 'Fetch Collocates',
				style: 'margin: 5px;',
				handler: function(b, e) {
					var node = this.getCurrentNode();
					if (node !== undefined) {
						if (this.getNetworkMode() === this.CENTRALIZED_MODE) {
							this.resetGraph();
							this.setNetworkMode(this.DEFAULT_MODE);
							this.setApiParam('centralize', undefined);
							node.start = 0;
							node.limit = this.getApiParam('limit');
						}
		    			this.fetchCollocatesForNode(node);
		    		}
				},
				scope: this
			},{
				xtype: 'button',
				text: 'Centralize',
				style: 'margin: 5px;',
				handler: function(b, e) {
					var node = this.getCurrentNode();
					if (node !== undefined) {
		    			this.doCentralize(node.term);
		    		}
					this.getContextMenu().hide();
				},
				scope: this
			},{
				xtype: 'button',
				text: 'Remove',
				style: 'margin: 5px;',
				handler: function(b, e) {
					var node = this.getCurrentNode();
					if (node !== undefined) {
						this.removeNode(node.id);
					}
					b.up('menu').hide();
				},
				scope: this
			}]
		}));
        
        this.on('loadedCorpus', function(src, corpus) {
			if (this.isVisible()) {
				this.initLoad();
			}
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

		this.on('beforedestroy', function(panel) {
			if (this.getVisLayout()) {
				this.getVisLayout().stop(); // make sure force simulation isn't running when removed
			}
		}, this);
        
        me.callParent(arguments);

    },
    
    initLoad: function() {
		this.initGraph();
		this.setNetworkMode(this.DEFAULT_MODE);
		
		if (this.getApiParam('centralize')) {
			this.setNetworkMode(this.CENTRALIZED_MODE);
			var term = this.getApiParam('centralize');
			this.doCentralize(term);
		} else {
			var limit = 3;
			var query = this.getApiParam('query');
			if (query !== undefined) {
				if (query.indexOf('^@') === 0) {
					// it's a category so increase limit so that we get most/all of the terms
					limit = 20;
				} else {
					limit = Ext.isArray(query) ? query.length : query.split(',').length;
				}
			}
			this.getCorpus().getCorpusTerms({autoLoad: false}).load({
				params: {
					limit: limit,
					query: query,
					stopList: this.getApiParam('stopList'),
					categories: this.getApiParam("categories")
				},
			    callback: function(records, operation, success) {
			    	if (success) {
			    		this.loadFromCorpusTermRecords(records);
			    	}
			    },
			    scope: this
	    	});
		}
    },
    
    loadFromQuery: function(query) {
    	if (Ext.isArray(query) && query.length==0) {
    		this.setApiParam("query", undefined);
    		this.resetGraph();
    		return;
    	}
    	this.setApiParams({ query: query });
    	var params = this.getApiParams();
    	params.noCache=true;
    	(Ext.isString(query) ? [query] : query).forEach(function(q) {
        	this.getCorpus().getCorpusCollocates({autoLoad: false}).load({
        		params: Ext.apply(Ext.clone(params), {query: q}),
        		callback: function(records, operations, success) {
        			if (success) {
        				this.loadFromCorpusCollocateRecords(records);
        			}
        		},
        		scope: this
        	});
    	}, this);
    },
    
    loadFromCorpusTermRecords: function(corpusTerms) {
    	if (Ext.isArray(corpusTerms) && corpusTerms.length>0) {
    		var terms = [];
    		corpusTerms.forEach(function(corpusTerm) {
    			terms.push(corpusTerm.getTerm());
    		});
    		this.loadFromQuery(terms);
    	}
    },
    
    loadFromCorpusCollocateRecords: function(records, keywordId) {
    	if (Ext.isArray(records)) {
    		var start = this.getApiParam('limit');
    		
    		var el = this.getLayout().getRenderTarget();
    		var cX = el.getWidth()/2;
    		var cY = el.getHeight()/2;
    		
    		var existingKeys = {};
    		this.getNodeData().forEach(function(item) {
    			existingKeys[item.id] = true;
    		}, this);
    		
    		var newNodes = [];
    		var newLinks = [];
    		
    		records.forEach(function(corpusCollocate, index) {
    			var term = corpusCollocate.getTerm();
    			var contextTerm = corpusCollocate.getContextTerm();
    			var termFreq = corpusCollocate.getKeywordRawFreq();
    			var contextFreq = corpusCollocate.getContextTermRawFreq();
    			
    			var termValue = termFreq;
    			var contextValue = contextFreq;
    			if (this.getNetworkMode() === this.CENTRALIZED_MODE) {
    				termValue = 0;
    				contextValue = Math.log(contextFreq);
    			}
    			
    			var termEntry = undefined;
    			var contextTermEntry = undefined;
    			
    			if (index == 0) { // only process keyword once
    				if (keywordId === undefined) keywordId = this.idGet(term);
	    			if (existingKeys[keywordId] !== undefined) {
	    				this.updateDataForNode(keywordId, {
	    					title: term+' ('+termFreq+')',
	    					type: 'keyword',
	    					value: termValue
	    				});
	    			} else {
	    				existingKeys[keywordId] = true;
	    				
	    				termEntry = {
		    				id: keywordId,
	    					term: term,
	    					title: term+' ('+termFreq+')',
	    					type: 'keyword',
	    					value: termValue,
	    					start: start,
	    					fixed: false,
	    					x: cX,
	    					y: cY
						};
	    				newNodes.push(termEntry);
	    			}
				}
    			
    			if (term != contextTerm) {
	    			var contextId = this.idGet(contextTerm);
	    			if (existingKeys[contextId] !== undefined) {
	    			} else {
	    				existingKeys[contextId] = true;
	    				
	    				contextTermEntry = {
    	    				id: contextId,
    	    				term: contextTerm,
        					title: contextTerm+' ('+contextFreq+')',
        					type: 'context',
        					value: contextValue,
        					start: 0,
        					fixed: false,
	    					x: cX,
	    					y: cY
    					};
	    				newNodes.push(contextTermEntry);
	    			}
	    			
	    			var existingLink = null;
	    			var linkData = this.getLinkData();
	    			for (var i = 0; i < linkData.length; i++) {
	    				var link = linkData[i];
	    				if ((link.source.id == keywordId && link.target.id == contextId) || (link.source.id == contextId && link.target.id == keywordId)) {
	    					existingLink = link;
	    					break;
	    				}
	    			}

	    			var linkValue = corpusCollocate.getContextTermRawFreq();
	    			if (existingLink === null) {
	    				newLinks.push({source: keywordId, target: contextId, value: linkValue, id: keywordId+'-'+contextId});
	    			} else if (existingLink.value < linkValue) {
//	    				existingLink.value = linkValue;
	    			}
    			}
    		}, this);
    		
    		this.setNodeData(this.getNodeData().concat(newNodes));
    		this.setLinkData(this.getLinkData().concat(newLinks));
    		
    		this.refresh();		
    	}
    },
    
    idGet: function(term) {
    	return 'links_'+term.replace(/\W/g, '_');
    },
    
    updateDataForNode: function(nodeId, dataObj) {
    	var data = this.getNodeData();
		for (var i = 0; i < data.length; i++) {
			if (data[i].id === nodeId) {
				Ext.apply(data[i], dataObj);
				break;
			}
		}
    },
    
    removeNode: function(nodeId, removeOrphans) {
    	var data = this.getNodeData();
		for (var i = 0; i < data.length; i++) {
			if (data[i].id === nodeId) {
				data.splice(i, 1);
				break;
			}
		}
		
		data = this.getLinkData();
		for (var i = data.length-1; i >= 0; i--) {
			if (data[i].source.id === nodeId || data[i].target.id === nodeId) {
				data.splice(i, 1);
			}
		}
		
		
		this.setApiParam("query", Ext.Array.remove(Ext.Array.from(this.getApiParam("query")), nodeId));
		
		if (removeOrphans) {
			// TODO
		}
		
		this.refresh();
    },
    
    doCentralize: function(term) {
    	this.setApiParam("centralize",term);
    	this.resetGraph();
    	
    	this.setNetworkMode(this.CENTRALIZED_MODE);
    	
    	var data = {
			id: this.idGet(term),
			term: term,
			title: term+' ('+1+')',
			type: 'keyword',
			value: 1000,
			start: 0
		};
		this.setNodeData([data]);
		this.refresh();
		
		var centralizeLimit = 150;
		var limit = this.getApiParam('limit');
		this.setApiParam('limit', centralizeLimit);
		this.fetchCollocatesForNode(data);
		this.setApiParam('limit', limit);
    },
    
    // called by setNetworkMode
    applyNetworkMode: function(mode) {
    	if (this.getVisLayout()) {
	    	if (mode === this.DEFAULT_MODE) {
	    		var physics = this.getGraphPhysics().defaultMode;
	    		this.getVisLayout()
	    			.velocityDecay(physics.damping)
		    		.force('link', d3.forceLink().id(function(d) { return d.id; }).distance(physics.springLength).strength(physics.springStrength))
					.force('charge', d3.forceManyBody().strength(physics.nodeGravity))
					.force('collide', d3.forceCollide(function(d) { return Math.sqrt(d.bbox.width * d.bbox.height) * physics.collisionScale; }));
	    		this.getVisLayout().force('x').strength(physics.centralGravity);
	    		this.getVisLayout().force('y').strength(physics.centralGravity);
	    	} else {
	    		var physics = this.getGraphPhysics().centralizedMode;
	    		this.getVisLayout()
	    			.velocityDecay(physics.damping)
		    		.force('link', d3.forceLink().id(function(d) { return d.id; }).distance(physics.springLength).strength(physics.springStrength))
					.force('charge', d3.forceManyBody().strength(function(d) {
						if (d.type === 'keyword') {
							return -10000;
						} else {
							return 0;
						}
					}))
					.force('collide', d3.forceCollide(function(d) {
						if (d.type === 'keyword') {
							return d.value;
						} else {
							return Math.sqrt(d.bbox.width * d.bbox.height) * physics.collisionScale;
						}
					}));
	    		this.getVisLayout().force('x').strength(physics.centralGravity);
	    		this.getVisLayout().force('y').strength(physics.centralGravity);
	    	}
    	}
    	
    	return mode; // need to return mode for it to actually be set
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
	    			if (this.getNetworkMode() === this.DEFAULT_MODE || d.type !== 'keyword') {
		    			x -= d.bbox.width*0.5;
		    			y -= d.bbox.height*0.5;
	    			} else {
	    				
	    			}
	    			return 'translate('+x+','+y+')';
	    		}.bind(this));
	    		
	    		if (!this.getDragging() && this.getVisLayout().alpha() < 0.075) {
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
		
		svg.on('click', function() {
    		this.getContextMenu().hide();
    	}.bind(this));
    	
    	this.setLinks(g.append('g').attr('class', 'links').selectAll('.link'));
    	this.setNodes(g.append('g').attr('class', 'nodes').selectAll('.node'));
		this.setVis(g);
    },
    
    resetGraph: function() {
		this.setNodeData([]);
    	this.setLinkData([]);
		this.setNetworkMode(this.DEFAULT_MODE); // ? there was another version of this function without this
		this.refresh();
    },
    
    refresh: function() {
    	var me = this;
    	
    	var nodeData = this.getNodeData();
    	var linkData = this.getLinkData();
    	
//    	var nodeMap = d3.map(nodeData, function(d) { return d.id; });
//    	var bilinks = [];
//    	linkData.forEach(function(link) {
//    		var s = link.source = nodeMap.get(link.source);
//    		var t = link.target = nodeMap.get(link.target);
//    		var i = {};
//    		nodeData.push(i);
//    		linkData.push({source: s, target: i}, {source: i, target: t});
//    		bilinks.push([s,i,t]);
//    	});
    	
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
				if (me.getNetworkMode() === me.DEFAULT_MODE) {
					return Math.max(1, Math.min(15, Math.sqrt(d.value)));
				} else {
					return 1;
				}
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
				this.fetchCollocatesForNode(data);
			}.bind(me))
			.on('contextmenu', function(d, i) {
				d3.event.preventDefault();
//				me.getTip().hide();
				var menu = me.getContextMenu();
				menu.queryById('label').setHtml(d.term);
    			menu.queryById('fixed').setChecked(d.fixed);
				menu.showAt(d3.event.pageX+10, d3.event.pageY-50);
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
					if (me.isMasked()) {
			    		if (!me.isOffCanvas(d3.event.x, d3.event.y)) {
			    			me.unmask();
			    		}
			    	} else if (me.isOffCanvas(d3.event.x, d3.event.y)) {
			    		me.mask(me.localize('releaseToRemove'));
			    	}
				})
				.on('end', function(d) {
					me.setDragging(false);
//					if (!d3.event.active) me.getVisLayout().alpha(0);
					if (d.fixed != true) {
						d.fx = null;
						d.fy = null;
					}
					if (me.isOffCanvas(d3.event.x, d3.event.y)) {
	    	    		me.unmask();
	    	    		me.mask(me.localize('cleaning'));
	    	    		me.removeNode(d.id);
	    	    		me.unmask();
	    	    	}
				})
			);
    	
    	nodeEnter.append('title');
    	
    	if (this.getNetworkMode() === this.DEFAULT_MODE) {
    		nodeEnter.append('rect')
				.style('stroke-width', 1)
				.style('stroke-opacity', 1);
    	} else {
    		nodeEnter.filter(function(d) { return d.type === 'keyword'; }).append('circle')
    			.style('stroke-width', 1)
    			.style('stroke-opacity', 1);
    	}
    	
    	nodeEnter.append('text')
			.attr('font-family', function(d) { return me.getApplication().getCategoriesManager().getFeatureForTerm('font', d.term); })
			.text(function(d) { return d.term; })
			.style('cursor', 'pointer')
			.style('user-select', 'none')
			.attr('dominant-baseline', 'middle');

		var allNodes = nodeEnter.merge(node);
		allNodes.selectAll('title').text(function(d) { return d.title; });
		allNodes.selectAll('text')
			.attr('font-size', function(d) { return Math.max(10, Math.sqrt(d.value)); })
			.each(function(d) { d.bbox = this.getBBox(); }) // set bounding box for later use

    	this.setNodes(allNodes);
    	
    	if (this.getNetworkMode() === this.DEFAULT_MODE) {
	    	this.getVis().selectAll('rect')
	    		.attr('width', function(d) { return d.bbox.width+16; })
				.attr('height', function(d) { return d.bbox.height+8; })
				.attr('rx', function(d) { return Math.max(2, d.bbox.height * 0.2); })
				.attr('ry', function(d) { return Math.max(2, d.bbox.height * 0.2); })
				.call(this.applyNodeStyle.bind(this));
	    	this.getVis().selectAll('text')
		    	.attr('dx', 8)
				.attr('dy', function(d) { return d.bbox.height*0.5+4; });
    	} else {
    		this.getVis().selectAll('circle')
    			.attr('r', function(d) { return Math.min(150, d.bbox.width); })
    			.call(this.applyNodeStyle.bind(this));
    		this.getVis().selectAll('text')
		    	.attr('dx', function(d) {
		    		if (d.type === 'keyword') {
		    			return -d.bbox.width*0.5;
			    	} else {
			    		return 8;
			    	}
	    		})
				.attr('dy', function(d) {
					if (d.type === 'keyword') {
						return 0;
					} else {
						return d.bbox.height*0.5+4;
					}
				});
    	}
    	this.getVis().selectAll('line').call(this.applyLinkStyle.bind(this));
    	
    	
    	this.getVisLayout().nodes(nodeData);
    	this.getVisLayout().force('link').links(linkData);
    	this.getVisLayout().alpha(1).restart();
    },
    
    isOffCanvas: function(x, y) {
    	var vis = Ext.get(this.getVisId());
    	return x < 0 || y < 0 || x > vis.getWidth() || y > vis.getHeight();
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
    	if (!this.getContextMenu().isVisible()) {
			this.setCurrentNode(undefined);
		}
		
		this.getVis().selectAll('rect')
			.style('stroke-width', 1)
			.call(this.applyNodeStyle.bind(this));
		
		this.getVis().selectAll('line')
			.call(this.applyLinkStyle.bind(this));
    },
    
    fetchCollocatesForNode: function(d) {
    	var limit = this.getApiParam('limit');
    	var query = this.getApiParam("query");
    	
    	var query = Ext.Array.from(this.getApiParam("query"));
    	Ext.Array.include(query, d.term)
		this.setApiParam("query", query);

    	var corpusCollocates = this.getCorpus().getCorpusCollocates({autoLoad: false});
    	corpusCollocates.load({
    		params: Ext.apply(this.getApiParams(), {query: d.term, start: d.start, limit: limit}),
    		callback: function(records, operation, success) {
    			if (success) {
    				this.updateDataForNode(d.id, {
    					start: d.start+limit
    				});
    	    		
    	    		this.loadFromCorpusCollocateRecords(records, d.id);
    			}
    		},
    		scope: this
    	});
    }
    
});