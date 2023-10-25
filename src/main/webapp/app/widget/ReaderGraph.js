Ext.define('Voyant.widget.ReaderGraph', {
    extend: 'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.readergraph',
    statics: {
        i18n: {
        }
    },
    config: {
        parentPanel: undefined,
        corpus: undefined,
        documentsStore: undefined,
    	locationMarker: undefined,
    	isDetailedGraph: true,
		seriesToolTip: undefined
    },
    
    locationMarkerColor: '#157fcc',

    DETAILED_GRAPH_DOC_LIMIT: 25, // upper limit on document count for showing detailed graphs
    LOCATION_UPDATE_FREQ: 100,

    SCROLL_UP: -1,
    SCROLL_EQ: 0,
    SCROLL_DOWN: 1,

    RESERVED_KEYS: ['id', 'docIndex', 'readerGraphPadding', 'readerGraphTotal'],

    constructor: function(config) {
        this.callParent(arguments);
    },

    initComponent: function() {
        Ext.apply(this, {
            layout: {
                type: 'hbox'
            },
            items: []
        });

        this.callParent(arguments);

        var parentPanel = this.findParentBy(function(clz) {
    		return clz.mixins["Voyant.panel.Panel"];
        });
    	if (parentPanel != null) {
            this.setParentPanel(parentPanel);
    		if (parentPanel.getCorpus && parentPanel.getCorpus()) {
    			this.on("afterrender", function(c) {
    				this.setCorpus(parentPanel.getCorpus());	
    			}, this);
    		} else {
                parentPanel.on("loadedCorpus", function(src, corpus) {
                    this.setCorpus(corpus);
                }, this);
                this.hasCorpusLoadedListener = true;
    		}
        }

		this.setSeriesToolTip(Ext.create('Ext.tip.ToolTip', {
			style: 'background: #fff',
			dismissDelay: 0
		}));
        
        this.on('boxready', function() {
            if (this.getLocationMarker() == undefined) {
                this.setLocationMarker(Ext.DomHelper.append(this.getEl(), {tag: 'div', style: 'background-color: '+this.locationMarkerColor+'; height: 100%; width: 2px; z-index: 3; position: absolute; top: 0; left: 0;'}));
            }
        });        
    },

    updateCorpus: function(corpus) {
        var docs = corpus.getDocuments();
        this.setDocumentsStore(docs);
        this.setIsDetailedGraph(docs.getTotalCount() < this.DETAILED_GRAPH_DOC_LIMIT);

        this.generateChart();
    },

    loadQueryTerms: function(queryTerms) {
        // TODO add categories param?
        if (this.getIsDetailedGraph()) {
            this.getCorpus().getDocumentTerms().load({
                params: {
                    query: queryTerms,
                    limit: -1,
                    withDistributions: true
                },
                callback: function(records, operation) {
                    this.populateDetailedChart(records);
                },
                scope: this
            })
        } else {
            this.getCorpus().getCorpusTerms().load({
                params: {
                    query: queryTerms,
                    limit: -1,
                    withDistributions: true
                },
                callback: function(records, operation) {
                    this.populateChart(records);
                },
                scope: this
            })
        }
            
    },

    populateDetailedChart: function(records) {
        var graphDatas = {};
        var maxValue = 0;
        records.forEach(function(r) {
            var graphData = [];
            var dist = r.get('distributions');
            var docId = r.get('docId');
            var docIndex = r.get('docIndex');
            var term = r.get('term');
            for (var i = 0; i < dist.length; i++) {
                var val = dist[i];
                if (val > maxValue) maxValue = val;
                graphData.push([docId, docIndex, i, val, term]);
            }
            if (graphDatas[docIndex] === undefined) {
                graphDatas[docIndex] = {};
            }
            graphDatas[docIndex][term] = graphData;
        });
        var graphs = this.query('cartesian');
        for (var i = 0; i < graphs.length; i++) {
            var graph = graphs[i];

            var docData = graphDatas[i];
            if (docData !== undefined) {
                var series = [];
                for (var term in docData) {
                    var termData = docData[term];
                    var sColor = this.getParentPanel().getApplication().getColorForTerm(term, true);
                    series.push({
                        type: 'line',
                        xField: 'bin',
                        yField: 'distribution',
                        style: { lineWidth: 1, strokeStyle: sColor },
                        store: Ext.create('Ext.data.ArrayStore', {
                            fields: ['docId', 'docIndex', 'bin', 'distribution', 'term'],
                            data: termData
                        })
                    });
                }
                graph.getAxes()[0].setMaximum(maxValue);
                graph.setSeries(series);
            }
        }
    },

	populateChart: function(records) {
		var graphDatas = {};
        this.getCorpus().getDocuments().each(function(doc, index) {
            graphDatas[index] = {};
        });
        var terms = [];
        records.forEach(function(r) {
            var term = r.get('term');
            if (terms.indexOf(term) === -1) {
                terms.push(term);
            }
            var dists = r.get('distributions');
            dists.forEach(function(val, docIndex) {
                graphDatas[docIndex][term] = val;
            });
        });
        terms.push('readerGraphPadding');

        var seriesData = Object.entries(graphDatas).map(function(termData) {
            return Object.assign({docIndex: parseInt(termData[0])}, termData[1]);
        });

        var maxValue = -1;
        seriesData.forEach(function(termData) {
            var total = Object.entries(termData)
                .filter(function(td) { return td[0] !== 'docIndex'})
                .map(function(td) { return td[1]})
                .reduce(function(prevVal, currVal) { return prevVal+currVal});
            
            termData.readerGraphTotal = total;

            if (total > maxValue) {
                maxValue = total;
            }
        });

        seriesData.forEach(function(termData) {
            termData.readerGraphPadding = maxValue - termData.readerGraphTotal;
        });

        var series = {
            type: 'bar',
            stacked: true,
            fullStack: true,
            xField: 'docIndex',
            yField: terms,
            style: {
                minGapWidth: 0,
                minBarWidth: 1,
                lineWidth: 0,
                strokeStyle: 'none'
            },
            renderer: function (sprite, config, rendererData, index) {
                var term = sprite.getField();
                var color;
                if (term === 'readerGraphPadding') {
                    color = this.getColor(index, 0.3);
                } else {
                    color = this.getParentPanel().getApplication().getColorForTerm(term, true);
                }
                return {fillStyle: color};
            }.bind(this)
        };
        var graph = this.down('cartesian');
        graph.getAxes()[0].setFields(terms);
        graph.setSeries(series);
        graph.setStore(Ext.create('Ext.data.JsonStore', {
            fields: ['docIndex'].concat(terms),
            data: seriesData
        }));
    },

	getColor: function(index, alpha) {
		var c = index % 2 === 0 ? [200,200,200] : [240,240,240];
		return 'rgba('+c.join(',')+','+alpha+')';
	},

    generateChart: function() {
		var me = this;
        
        function addChart(docInfo) {
            var index = docInfo.docIndex;
            var fraction = docInfo.fraction;
            var height = docInfo.relativeHeight;
            var bColor = this.getColor(index, 0.3);
            var chart = me.add({
                xtype: 'cartesian',
                plugins: {
                    ptype: 'chartitemevents'
                },
                flex: fraction,
                height: '100%',
                insetPadding: 0,
                background: {
                    type: 'linear',
                    degrees: 90,
                    stops: [{
                        offset: 0,
                        color: bColor
                    },{
                        offset: height,
                        color: bColor
                    },{
                        offset: height,
                        color: 'white'
                    },{
                        offset: 1,
                        color: 'white'
                    }]
                },
                axes: [{
                    type: 'numeric',
                    position: 'left',
                    fields: 'distribution',
                    hidden: true
                },{
                    type: 'category',
                    position: 'bottom',
                    fields: 'bin',
                    hidden: true
                }],
				listeners: {
					itemmouseover: function(chart, item, event) {
						var tooltipHtml = this.getCorpus().getDocument(item.record.get('docIndex')).getTitle();
						chart.getSeries().forEach(function(series) {
							var seriesItem = series.getItemByIndex(item.index);
							var term = seriesItem.record.get('term');
							var dist = seriesItem.record.get('distribution');
							tooltipHtml += '<br>'+term+': '+dist;
						}, this);
						this.getSeriesToolTip().setHtml(tooltipHtml);
						var xy = event.getXY();
						xy[0] += 15;
						xy[1] += 18;
						this.getSeriesToolTip().showAt(xy);
					},
					scope: this
				}
            });

            chart.body.on('mouseenter', function(event, target) {
                if (chart.getSeries().length === 0) {
                    var tooltipHtml = this.getCorpus().getDocument(docInfo.docIndex).getTitle();
                    this.getSeriesToolTip().setHtml(tooltipHtml);
                    var xy = event.getXY();
                    xy[0] += 15;
                    xy[1] += 18;
                    this.getSeriesToolTip().showAt(xy);
                }
            }, this);

			chart.body.on('mouseleave', function(event, target) {
				this.getSeriesToolTip().hide();
			}, this);
            
            chart.body.on('click', function(event, target) {
                var el = Ext.get(target);
                
                var x = event.getX();
                var box = el.getBox();
                var fraction = (x - box.x) / box.width;

                var chartContainer = el.parent('.x-panel');
                var containerParent = chartContainer.parent();
                var children = Ext.toArray(containerParent.dom.children);
                var docIndex = children.indexOf(chartContainer.dom);

                this.fireEvent('documentRelativePositionSelected', this, {docIndex: docIndex, fraction: fraction});
            }, this);
        }
        
        me.removeAll();
        
        var docs = me.getCorpus().getDocuments();
        var tokensTotal = me.getCorpus().getWordTokensCount();
        var docInfos = [];
        for (var i = 0; i < docs.getCount(); i++) {
            var d = docs.getAt(i);
            var docIndex = d.get('index');
            var count = d.get('tokensCount-lexical');
            var fraction = count / tokensTotal;
            docInfos.push({
                docIndex: docIndex,
                count: 1, // same height for all
                fraction: fraction
            });
        }
        
        if (this.getIsDetailedGraph()) {
            for (var i = 0; i < docInfos.length; i++) {
                var d = docInfos[i];
                d.relativeHeight = 1; // same height for all
                addChart.call(this, d);
            }
        } else {
            var chart = me.add({
                xtype: 'cartesian',
                plugins: {
                    ptype: 'chartitemevents'
                },
                flex: 1,
                height: '100%',
                animation: false,
                insetPadding: 0,
                axes: [{
                    type: 'numeric',
                    position: 'left',
                    fields: 'count',
                    hidden: true
                },{
                    type: 'category',
                    position: 'bottom',
                    fields: 'docIndex',
                    hidden: true
                }],
                series: [{
                    type: 'bar',
                    xField: 'docIndex',
                    yField: 'count',
                    style: {
                        minGapWidth: 0,
                        minBarWidth: 1,
                        lineWidth: 0,
                        strokeStyle: 'none'
                    },
                    renderer: function (sprite, config, rendererData, index) {
                        return {fillStyle: this.getColor.call(this, index, 0.3)};
                    }.bind(this)
                }],
                store: Ext.create('Ext.data.JsonStore', {
                    fields: [{name: 'docIndex', type: 'int'}, {name: 'count', type: 'int'}],
                    data: docInfos
                }),
                listeners: {
                    itemmouseover: function(chart, item, event) {
						var tooltipHtml = this.getCorpus().getDocument(item.record.get('docIndex')).getTitle();

                        if (chart.getSeries()[0].getFullStack()) {
                            Object.keys(item.record.data)
                                .filter(function(key) { return me.RESERVED_KEYS.indexOf(key) === -1 })
                                .forEach(function(key) {
                                    var val = item.record.data[key];
                                    tooltipHtml += '<br>'+key+': '+val;
                                }, this);
                        }
                        
						this.getSeriesToolTip().setHtml(tooltipHtml);
						var xy = event.getXY();
						xy[0] += 15;
						xy[1] += 18;
						this.getSeriesToolTip().showAt(xy);
					},
                    itemclick: function(chart, item, event) {
                        var el = Ext.get(event.getTarget());
                        var x = event.getX();
                        var box = el.getBox();
                        var docWidth = box.width / this.getCorpus().getDocuments().getCount();
                        var docX = (x - box.x) % docWidth;
                        var fraction = docX / docWidth;

            			var docIndex = item.record.get('docIndex');
                        var doc = this.getDocumentsStore().getAt(docIndex);
                        var docIndex = doc.getIndex();

                        this.fireEvent('documentRelativePositionSelected', this, {docIndex: docIndex, fraction: fraction});
                    },
                    scope: this
                }
            });
            chart.body.on('mouseleave', function(event, target) {
				this.getSeriesToolTip().hide();
			}, this);
        }

    },

    moveLocationMarker: function(docIndex, fraction, scrollDir) {
        var locMarkEl = Ext.get(this.getLocationMarker());
        var locX = locMarkEl.getX();
        if (this.getIsDetailedGraph()) {
            var graph = this.query('cartesian')[docIndex];
            if (graph) {
                locX = graph.getX() + graph.getWidth()*fraction;
            }
        } else {
            var graph = this.down('cartesian');
            if (graph) {
                var docWidth = graph.getWidth() / this.getCorpus().getDocuments().getCount();
                locX = graph.getX() + docWidth*docIndex + docWidth*fraction;
            }
        }
        if (scrollDir != null) {
            var currX = locMarkEl.getX();
            // prevent location being set in opposite direction of scroll
            if ((scrollDir == this.SCROLL_DOWN && currX > locX) || (scrollDir == this.SCROLL_UP && currX < locX)) locX = currX;
        }
        locMarkEl.setX(locX);
    }
});