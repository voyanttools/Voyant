/**
 * Corpus Terms tool, a grid that shows the terms in the corpus.
 * 
 * @class CorpusTerms
 */
Ext.define('Voyant.panel.CorpusTerms', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpusterms',
    statics: {
    	i18n: {
			comparisonCorpus: 'Comparison Corpus'
    	},
    	api: {
    		
    		/**
			 * @memberof CorpusTerms
    		 * @property {StopList}
			 * @default
    		 */
    		stopList: 'auto',
    		
    		/**
    		 * @memberof CorpusTerms
			 * @property {Query}
    		 */
    		query: undefined,
    		
    		/**
			 * @memberof CorpusTerms
    		 * @property {Number} maxBins The maximum number of bins to use for distributions in Trend.
    		 * 
    		 * By default this is set to 100 (in other words, if there are more than 100 documents in the corpus, they will be forced into 100 bins).
    		 * Higher values are possible but it can cause performance issues and necessitate more data transfer (values for each one of the bins for each one of the terms).
			 * @default
    		 */
    		maxBins: 100,

			/**
			 * @memberof CorpusTerms
			 * @property {TermColors}
			 * @default
			 */
			termColors: 'categories',

    		/**
			 * @memberof CorpusTerms
    		 * @property {String} comparisonCorpus An existing corpus to be used for comparison purposes.
    		 * 
    		 * None of the columns visible by default use comparisonCorpus so this is an advanced parameter used when the "Comparison" column is shown.
    		 * The comparison column shows the relative frequency of the term in the corpus compared to the relative frequency of the same term in a comparison corpus.
    		 */
    		comparisonCorpus: undefined,

			/**
			 * @memberof CorpusTerms
			 * @property {Columns} columns 'term', 'rawFreq', 'relativeFreq', 'relativePeakedness', 'relativeSkewness', 'comparisonRelativeFreqDifference', 'distributions'
			 */
			columns: undefined,

			/**
			 * @memberof CorpusTerms
			 * @property {SortColumn}
			 */
			sort: undefined,

			/**
			 * @memberof CorpusTerms
			 * @property {SortDir}
			 */
			dir: undefined,
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	/**
    	 * @private
    	 */
    	options: [{
    		xtype: 'stoplistoption'
    	},{
			xtype: 'categoriesoption'
		},{
			xtype: 'termcolorsoption'
		},{
    		xtype: 'corpusselector',
    		name: 'comparisonCorpus'
    	}]
    },

	/**
	 * @private
	 */
    constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
		this.getOptions().filter(function(option) { return option.xtype === 'corpusselector'})[0].fieldLabel = this.localize('comparisonCorpus');
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    
    initComponent: function() {
        var me = this;

        var store = Ext.create("Voyant.data.store.CorpusTermsBuffered", {
        	parentPanel: this,
        	proxy: {
        		extraParams: {
        			withDistributions: 'relative',
        			forTool: 'corpusterms'
        		}
        	}
        });
        
        Ext.apply(me, {
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
            store : store,
    		selModel: Ext.create('Ext.selection.CheckboxModel', {
                pruneRemoved: false,
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		if (selections && selections.length>0) {
                        		this.getApplication().dispatchEvent('corpusTermsClicked', this, selections);
                    		}
                    	},
                    	scope: this
                    }
                },
                mode: 'SIMPLE'
            }),
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }]
            }],
            
            plugins: [{
                ptype: 'rowexpander',
                rowBodyTpl: new Ext.XTemplate('')
            }],
            viewConfig: {
                listeners: {
                    // TODO widget disappears when scrolled off screen
                    expandbody: function(rowNode, record, expandRow, eOpts) {
                        if (expandRow.textContent==='' || (eOpts && eOpts.force)) {
                            Ext.create('Voyant.widget.CorpusTermSummary', {
                                record: record,
                                header: false,
                                renderTo: expandRow.querySelector('div')
                            });
                        }
                    },
                    scope: this
                }
            },
    		columns: [{
                xtype: 'rownumberer',
                width: 'autoSize',
                sortable: false
            },{
    			text: this.localize("term"),
            	tooltip: this.localize("termTip"),
        		dataIndex: 'term',
        		flex: 1,
                sortable: true,
				xtype: 'coloredtermfield',
				useCategoriesMenu: true
            },{
            	text: this.localize("rawFreq"),
            	tooltip: this.localize("rawFreqTip"),
            	dataIndex: 'rawFreq',
                width: 'autoSize',
            	sortable: true
            },{
            	text: this.localize("relativeFreq"),
            	tooltip: this.localize("relativeFreqTip"),
            	dataIndex: 'relativeFreq',
            	renderer: function(val) {
            		var percent = val*100;
            		return Ext.util.Format.number(val*1000000, "0,000")/* + " (%"+
            			(val*100 <  .1 ? "<0.1" : Ext.util.Format.number(val*100, "0.0"))+")"*/
            	},
                width: 'autoSize',
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativePeakedness"),
            	tooltip: this.localize("relativePeakednessTip"),
            	dataIndex: 'relativePeakedness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                width: 'autoSize',
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("relativeSkewness"),
            	tooltip: this.localize("relativeSkewnessTip"),
            	dataIndex: 'relativeSkewness',
            	renderer: Ext.util.Format.numberRenderer("0,000.0"),
                width: 'autoSize',
                hidden: true,
            	sortable: true
            },{
            	text: this.localize("corpusComparisonDifference"),
            	tooltip: this.localize("corpusComparisonDifferenceTip"),
            	dataIndex: 'comparisonRelativeFreqDifference',
            	renderer: Ext.util.Format.numberRenderer("0,000.00000"),
                width: 'autoSize',
                hidden: !this.getApiParam('comparisonCorpus'),
            	sortable: true,
            	listeners: {
            		show: function(ct, column, eopts) {
            			if (!me.getApiParam('comparisonCorpus')) {
            				me.showError(me.localize('noCorpusComparison'))
            			}
            		}
            	}
            },{
                xtype: 'widgetcolumn',
                text: this.localize("trend"),
                tooltip: this.localize("trendTip"),
                flex: 1,
                dataIndex: 'distributions',
                widget: {
                    xtype: 'sparklineline',
                    tipTpl: new Ext.XTemplate('{[this.getDocumentTitle(values.x,values.y)]}', {
                    	getDocumentTitle: function(docIndex, relativeFreq) {
                    		return this.panel.store.getCorpus().getDocument(docIndex).getTitle()+"<br>"+this.panel.localize("relativeFreqLabel")+" "+Ext.util.Format.number(relativeFreq*1000000, "0,000")
                    	},
                    	panel: me 
                    })
                }
            }]
        });
        
    	me.on('loadedCorpus', function(src, corpus) {
    		if (corpus.getDocumentsCount()>100) {
    			this.getStore().getProxy().setExtraParam('bins', this.getApiParam('maxBins'));
    		}
    		if (this.isVisible()) {
				if (corpus.getDocumentsCount() === 1) {
					this.getColumns().filter(function(col) { return col.dataIndex === 'distributions'})[0].hide();
				}
        		this.getStore().load();
    		}
    	}, me);
    	
    	me.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (me.getStore().getCorpus()) {
				if (me.getStore().getCorpus().getDocumentsCount() === 1) {
					this.getColumns().filter(function(col) { return col.dataIndex === 'distributions'})[0].hide();
				}
    			me.getStore().load({params: this.getApiParams()});
    		}
    	}, me);

    	
    	me.on("query", function(src, query) {
    		this.setApiParam('query', query);
    		this.getStore().removeAll();
    		this.getStore().load();
    	}, me);


        me.callParent(arguments);
        
    }
})
