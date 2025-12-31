/**
 * Constellations
 * TODO add word2vec
 * @class Constellations
 * @memberof Tools
 */
Ext.define('Voyant.panel.Constellations', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.constellations',
	statics: {
		i18n: {
			title: 'Constellations',
			options: 'Options',
			termSearch: 'Term Search',
			cutoff: 'Similarity Threshold',
			numTerms: 'Terms',
			analysis: 'Analysis',
			ca: 'Correspondence Analysis',
			pca: 'Principal Component Analysis',
			tsne: 't-SNE',
			help: 'Constellations produces a specialized network graph of high frequency terms that are connected by similar word vectors.',
			helpTip: 'Constellations produces a specialized network graph of high frequency terms that are connected by similar word vectors.'
		},
		api: {
			analysis: 'ca',
			docId: undefined,
			limit: 50,
			dimensions: 3,
			stopList: 'auto'
		},
		glyph: 'xf1e0@FontAwesome'
	},
	
	config: {
		caStore: undefined,
		pcaStore: undefined,
		tsneStore: undefined,

		allNodeData: undefined,
		allEdgeData: undefined,
		
		simCutoff: 25, // percent
		simMin: 0,
		simMax: 1,
		allSims: [],
		simWin: undefined,

		vis: undefined,
		simulation: undefined,
		physics: {
			nodeGravity: -500,  // negative = repel, positive = attract
			springLength: 50
		},
		zoom: undefined, // d3 zoom
		zoomExtent: [0.25, 8],

		termSearchTimeout: null,

		options: [{xtype: 'stoplistoption'}]
	},
	
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	
	initComponent: function() {
		this.setCaStore(Ext.create('Voyant.data.store.CAAnalysis', {
			listeners: { load: this.handleData, scope: this }
		}));
		this.setPcaStore(Ext.create('Voyant.data.store.PCAAnalysis', {
			listeners: { load: this.handleData, scope: this }
		}));
		this.setTsneStore(Ext.create('Voyant.data.store.TSNEAnalysis', {
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
					itemId: 'visParent'
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
					maxValue: 250,
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
					xtype: 'slider',
					fieldLabel: this.localize('cutoff'),
					minValue: 1,
					maxValue: 100,
					increment: 1,
					listeners: {
						render: function(field) {
							field.setValue(this.getSimCutoff());
						},
						changecomplete: function(field, newVal) {
							this.setSimCutoff(newVal);
							this.updateGraph();
						},
						scope: this
					}
				},{
					xtype: 'container',
					layout: 'fit',
					items: {
						itemId: 'simGraph',
						xtype: 'sparklineline',
						minSpotColor: '',
						maxSpotColor: '',
						spotColor: '',
						disableTooltips: true,
						width: 200,
						height: 50
					}
				}]
			}]
		});

		this.on('boxready', function(src, corpus) {
			// this.initGraph();
		}, this);
		
		this.on('loadedCorpus', function(src, corpus) {
			if (this.isVisible()) {
				this.getCaStore().setCorpus(corpus);
				this.getPcaStore().setCorpus(corpus);
				this.getTsneStore().setCorpus(corpus);
				this.loadFromApis();
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
		
		this.callParent(arguments);
	},

	initGraph: function(nodes, edges) {
		var el = this.down('#visParent').getEl();
		el.update('');
		var width = el.getWidth();
		var height = el.getHeight();
		
		var svg = d3.select(el.dom).append('svg').attr('width', width).attr('height', height);
		var group = svg.append('g');
		group.append('g').attr('class', 'edges');
		group.append('g').attr('class', 'nodes');
		group.append('g').attr('class', 'labels');
		this.setVis(group);
		
		var zoom = d3.zoom()
			.scaleExtent(this.getZoomExtent())
			.on('zoom', function(event) {
				group.attr('transform', event.transform);
			});
		this.setZoom(zoom);
		svg.call(zoom);

		var physics = this.getPhysics();

		this.setSimulation(d3.forceSimulation(nodes)
			.force('x', d3.forceX(width/2))
			.force('y', d3.forceY(height/2))
			.force('link', d3.forceLink(edges).id(function(d) { return d.id; }).distance(physics.springLength))
			.force('charge', d3.forceManyBody().strength(physics.nodeGravity))
			.force('center', d3.forceCenter(width/2, height/2))
			.on('tick', function() {
				svg.select('.edges').selectAll('line')
					.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return d.target.x; })
					.attr('y2', function(d) { return d.target.y; });
		
				svg.select('.nodes').selectAll('circle')
					.attr('cx', function(d) { return d.x})
					.attr('cy', function(d) { return d.y});

				svg.select('.labels').selectAll('text')
					.attr('x', function(d) { return d.x +15 })
					.attr('y', function(d) { return d.y +5 })
				
				if (this.getSimulation().alpha() < 0.075) {
 					this.stopSimulation();
 				}
			}.bind(this))
			.on('end', function() {
				Ext.Function.defer(this.zoomToFit, 100, this);
			}.bind(this))
		);

		this.getSimulation().stop();
	},

	updateGraph: function() {
		this.stopSimulation();

		var selectedTerm = this.down('#termSearch').getValue();
		console.log(selectedTerm);
		[nodes, edges] = this.doFilter(this.getAllNodeData(), this.getAllEdgeData(), selectedTerm);

		this.getVis().select('.labels')
			.selectAll('text')
			.data(nodes)
			.join('text')
				.classed('hidden', false)
				.classed('label', true)
				.style('cursor', 'pointer')
				.attr('font-size', '16px')
				.attr('font-family', '"Palatino Linotype", "Book Antiqua", Palatino, serif')
				.text(function(d) { return d.id })
				.on('click', this.handleNodeClick.bind(this))
				.call(d3.drag()
					.on('start', this.handleDragStart.bind(this))
					.on('drag', this.handleDrag.bind(this))
					.on('end', this.handleDragEnd.bind(this))
				)

		this.getVis().select('.nodes')
			.selectAll('circle')
			.data(nodes, function(d) { return d.id })
			.join('circle')
				.classed('node', true)
				.classed('selected', function(node) { return node.selected === true })
				.style('cursor', 'pointer')
				.style('stroke', function(node) { return node.selected ? '#ff8800' : '#6baed6' })
				.style('stroke-width', 1)
				.style('fill', function(node) { return node.selected ? '#ffcd93ff' : '#c6dbef' })
				.attr('r', function(node) {
					if (node.selected === true) {
						return 20;
					}
					return 10;
				})
				.on('click', this.handleNodeClick.bind(this))
				.call(d3.drag()
					.on('start', this.handleDragStart.bind(this))
					.on('drag', this.handleDrag.bind(this))
					.on('end', this.handleDragEnd.bind(this))
				)
		
		this.getVis().select('.edges')
			.selectAll('line')
			.data(edges)
			.join('line')
				.classed('edge', true)
				.style('stroke', '#000')
				.style('stroke-opacity', 0.1)

		this.getSimulation()
			.nodes(nodes)
			.force('link')
				.links(edges)

		this.getSimulation().alpha(1).restart();
	},

	stopSimulation: function() {
		if (this.getSimulation()) {
			this.getSimulation().alpha(-1);
		}
	},

	handleNodeClick: function(event, data) {
		event.stopImmediatePropagation();
		event.preventDefault();
		this.dispatchEvent('termsClicked', this, [data.id]);
	},

	handleDragStart: function(event) {
		this.getSimulation().alpha(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	},

	handleDrag: function(event) {
		this.getSimulation().alpha(0.3);
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	},

	handleDragEnd: function(event) {
		event.subject.fx = null;
		event.subject.fy = null;
	},

	loadFromApis: function() {
		this.stopSimulation();

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
	
		let all_node_data = data.map(x => { return {id: x["term"] }})
		let all_edge_data = []

		var sims = [];
		// Populate edge data with distances
		for (let pairs of this.combinations(data)) {
			let sim = this.distance(pairs[0]["vector"], pairs[1]["vector"]);
			all_edge_data.push({
				"source": pairs[0]["term"],
				"target": pairs[1]["term"],
				"sim": sim
			});
			sims.push(sim);
		}
		
		this.setAllSims(sims.sort(function(a, b) { return a - b }));

		this.setSimMin(this.arrayMin(sims));
		this.setSimMax(this.arrayMax(sims));
		console.log(this.getSimMin(), this.getSimMax())

		this.setAllNodeData(all_node_data);
		this.setAllEdgeData(all_edge_data);
		
		this.initGraph(all_node_data, all_edge_data);
		this.updateGraph();

		this.down('#simGraph').setValues(this.getAllSims());
	},

	doFilter: function(nodes, edges, selection) {
		var cutoffPercent = this.getSimCutoff() / 100;
		var easedCutoff = this.easeIn(cutoffPercent);
		var cutoff = this.map(easedCutoff, 0, 1, this.getSimMin(), this.getSimMax());
		console.log(cutoffPercent, easedCutoff, cutoff)

		var valueSpot = {};
		valueSpot["0:"+cutoff] = "#ff8800";
		this.down('#simGraph').setValueSpots(valueSpot);

		if (nodes === undefined || edges === undefined) return [[],[]];

		let nodes_temp = new Set()

		// Filter out edges
		let edges_filtered = edges.filter(edge => {
			if (edge.sim <= cutoff) {
				nodes_temp.add(edge.source.id)
				nodes_temp.add(edge.target.id)
				return true
			}
		})

		// Filter out nodes
		let nodes_filtered = nodes.filter(x => {
			x.selected = false
			if (x.id === selection) {
				x.selected = true
				return true
			}

			return nodes_temp.has(x["id"])
		});

		if (nodes_filtered.length === 0) {
			console.warn('no nodes!')
		}

		console.log('num edges', edges_filtered.length);

		return [nodes_filtered, edges_filtered];
	},

	distance: function(source, target) {
		// This function returns the Euclidean distance between two arrays.
		return Math.sqrt(source.reduce((sum, current, index) => {
			const x = Math.pow(current - target[index], 2)
			return sum + x
		}, 0));
	},

	combinations: function*(items) {
		// This function will return all pairs of values in an iterable.
		for (let row of items.entries()) {
			const index = row[0];
			const x = row[1];

			for (let y of items.slice(index + 1)) {
				yield [x, y]
			}
		}
	},

	arrayMin: function(arr) {
		var len = arr.length, min = Infinity;
		while (len--) {
			if (arr[len] < min) {
				min = arr[len];
			}
		}
		return min;
	},

	arrayMax: function(arr) {
		var len = arr.length, max = -Infinity;
		while (len--) {
			if (arr[len] > max) {
				max = arr[len];
			}
		}
		return max;
	},

	easeIn: function(x) {
		return x*x*x;
	},

	map: function(value, istart, istop, ostart, ostop) {
		return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
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
	}
	
});
