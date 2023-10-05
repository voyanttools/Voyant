Ext.define('Voyant.widget.EntitiesList', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.entitieslist',
	statics: {
		i18n: {
			term: 'Term',
			count: 'Count',
			next: 'Next Occurrence',
			prev: 'Previous Occurrence',
			date: 'Date',
			person: 'Person',
			gpe: 'Geopolitical Entity',
			loc: 'Location',
			money: 'Money',
			time: 'Time',
			product: 'Product',
			cardinal: 'Cardinal',
			quantity: 'Quantity',
			event: 'Event',
			fac: 'Facility',
			language: 'Language',
			law: 'Law',
			norp: 'National/Religious/Political',
			percent: 'Percent',
			work_of_art: 'Work of Art',
			unknown: 'Unknown'
		}
	},

	bins: 25,

	initComponent: function() {
		var me = this;
		Ext.apply(this, {
			title: 'Entities',
			forceFit: true,
			store: Ext.create('Ext.data.JsonStore', {
				fields: ['term','normalized','type','docIndex','rawFreq','positions','offset'],
				groupField: 'type',
				sorters: [{
					property: 'rawFreq',
					direction: 'DESC'
				}]
			}),
			features: [{
				ftype: 'grouping',
				hideGroupedHeader: true,
				enableGroupingMenu: false,
				startCollapsed: true,
				groupHeaderTpl: ['{name:this.localizeName} ({children.length})',{
					localizeName: function(name) {
						return me.localize(name);
					}
				}]
			}],
			plugins: [{
				ptype: 'rowexpander',
				rowBodyTpl: new Ext.XTemplate(''),
				expandOnDblClick: false
			}],
			viewConfig: {
				listeners: {
					expandbody: function(rowNode, record, expandRow, eOpts) {
						me.getSelectionModel().select(record, false, true); // select expanded row, otherwise select event gets triggered later when interacting with prev/next buttons
						if (expandRow.textContent === '' || (eOpts && eOpts.force)) {
							var parentEl = expandRow.querySelector('div.x-grid-rowbody');
							var expandedRow = Ext.create('Ext.container.Container', {
								currentEntityPositionIndex: 0,
								handlePositionChange: function(dir) {
									if (dir < 0) {
										this.currentEntityPositionIndex--;
										if (this.currentEntityPositionIndex < 0) this.currentEntityPositionIndex = record.get('positions').length-1;
									} else {
										this.currentEntityPositionIndex++;
										if (this.currentEntityPositionIndex > record.get('positions').length-1) this.currentEntityPositionIndex = 0;
									}

									// programatically highlight the current bar
									var dist = record.get('distribution');
									var distBinToHighlight = 0;
									var distBinCount = 0;
									for (var i = 0; i < dist.length; i++) {
										distBinCount += dist[i];
										if (distBinCount > this.currentEntityPositionIndex) {
											distBinToHighlight = i;
											break;
										}
									}
									var sparkline = this.down('sparklinebar');
									var sparklineBox = sparkline.canvas.el.getBox();
									var binWidth = sparkline.getBarWidth()+sparkline.getBarSpacing();
									var mouseX = sparklineBox.x + (binWidth * distBinToHighlight);
									var mouseY = sparklineBox.y + (sparklineBox.height*.5);
									var event = Ext.create('Ext.event.Event', new MouseEvent('mousemove', {clientX: mouseX, clientY: mouseY}));
									sparkline.onMouseMove(event);

									Voyant.application.dispatchEvent('entityLocationClicked', this, record, this.currentEntityPositionIndex);
								},
								layout: {
									type: 'hbox',
									align: 'middle'
								},
								renderTo: parentEl,
								items: [{
									xtype: 'button',
									glyph: 'xf060@FontAwesome',
									tooltip: me.localize('prev'),
									handler: function(btn, e) {
										btn.up('container').handlePositionChange(-1);
									}
								},{
									xtype: 'button',
									glyph: 'xf061@FontAwesome',
									tooltip: me.localize('next'),
									margin: '0 5',
									handler: function(btn, e) {
										btn.up('container').handlePositionChange(1);
									}
								},{
									xtype: 'sparklinebar',
									values: record.get('distribution'),
									highlightColor: '#f80',
									height: 24,
									tipTpl: false,
									width: parentEl.offsetWidth - 80 // TODO resize when layout changes
								}],
								listeners: {
									boxready: function(cmp) {
										setTimeout(function() {
											cmp.currentEntityPositionIndex = -1;
											cmp.handlePositionChange(1);
										}, 50);
									}
								}
							});
						}
					}
				}
			},
			columns: [{
				text: this.localize('term'),
				dataIndex: 'term',
				flex: 1
			},{
				text: this.localize('count'),
				dataIndex: 'rawFreq',
				width: 50
			}],
			listeners: {
				select: function(cmp, record, index) {
					Voyant.application.dispatchEvent('entityClicked', this, record);
				},
				columnresize: function(ct, column, width) {
				}
			}
		});
		
		this.callParent(arguments);
	},

	addEntities: function(entities) {
		var store = this.getStore();
		if (store !== undefined) {
			var append = false;
			if (store.count() > 0 && entities.length > 0) {
				var oldDocIndex = store.first().get('docIndex');
				var newDocIndex = entities[0].docIndex;
				append = oldDocIndex === newDocIndex;
			}
			entities.forEach(function(entity) {
				if (entity.positions) {
					entity.distribution = this.getDistributionFromPositions(entity.docIndex, entity.positions, this.bins);
				} else {
					console.warn('no positions for:',entity);
					entity.distribution = [];
				}
			}, this);
			store.loadData(entities, append);
			if (append === false) {
				this.view.findFeature('grouping').collapseAll();
			}
		}
	},

	getDistributionFromPositions: function(docIndex, positions, bins) {
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
});