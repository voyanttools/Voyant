/**
 * The Correlations tool enables an exploration of the extent to which term frequencies vary in sync (terms whose frequencies rise and fall together or inversely).
 * 
 * @class Correlations
 */
Ext.define('Voyant.panel.Correlations', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.correlations',
    statics: {
    	i18n: {
    	},
    	api: {
			/**
			 * @memberof Correlations
			 * @property {Query}
			 */
    		query: undefined,

			/**
			 * @memberof Correlations
			 * @property {DocId}
			 */
    		docId: undefined,

			/**
			 * @memberof Correlations
			 * @property {DocIndex}
			 */
    		docIndex: undefined,

			/**
			 * @memberof Correlations
			 * @property {StopList}
			 * @default
			 */
    		stopList: 'auto',

			/**
			 * @memberof Correlations
			 * @property {Number} minInDocumentsCountRatio The minimum coverage (as a percentage) for terms. For instance, if a corpus has 10 documents and the minimum coverage is 20%, at least two of the documents must contain the term or it will be ignored.
			 * @default
			 */
    		minInDocumentsCountRatio: 100,

			/**
			 * @memberof Correlations
			 * @property {Columns} columns 'sourceTerm', 'source-distributions', 'target-distributions', 'targetTerm', 'correlation', 'significance'
			 */
			columns: undefined,

			/**
			 * @memberof Correlations
			 * @property {SortColumn}
			 */
			sort: undefined,

			/**
			 * @memberof Correlations
			 * @property {SortDir}
			 */
			dir: undefined,

			/**
			 * @memberof Correlations
			 * @property {TermColors}
			 * @default
			 */
			termColors: 'categories'
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	options: [{xtype: 'stoplistoption'}, {xtype: 'categoriesoption'}, {xtype: 'termcolorsoption'}]
    },
    constructor: function() {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, { 
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
    		store: Ext.create("Voyant.data.store.TermCorrelationsBuffered", {
            	parentPanel: this,
				leadingBufferZone: 100 // since these calls are expensive reduce buffer to 1 page
	        }),

    		columns: [{
    			text: this.localize("source"),
    			tooltip: this.localize("sourceTip"),
        		dataIndex: 'sourceTerm',
        		sortable: false,
				xtype: 'coloredtermfield'
    		},{
                xtype: 'widgetcolumn',
                tooltip: this.localize("trendTip"),
                width: 100,
                dataIndex: 'source-distributions',
                widget: {
                    xtype: 'sparklineline'
                },
                text: '←'
            },{
                xtype: 'widgetcolumn',
                tooltip: this.localize("trendTip"),
                width: 100,
                dataIndex: 'target-distributions',
                widget: {
                    xtype: 'sparklineline'
                },
                text: '→',
                align: 'right'
            },{
    			text: this.localize("target"),
    			tooltip: this.localize("targetTip"),
        		dataIndex: 'targetTerm',
        		sortable: false,
				xtype: 'coloredtermfield'
    		},{
    			text: this.localize("correlation"),
    			tooltip: this.localize("correlationTip"),
        		dataIndex: 'correlation'
    		},{
    			text: this.localize("significance"),
    			tooltip: this.localize("significanceTip"),
        		dataIndex: 'significance'
    		}],
    		

            listeners: {
            	scope: this,
				corpusSelected: function() {
					this.setApiParams({docIndex: undefined, docId: undefined});
	        		this.getStore().getProxy().setExtraParam('tool', 'corpus.CorpusTermCorrelations');
	        		this.getStore().load();
				},
				
				documentsSelected: function(src, docs) {
					var docIds = [];
					var corpus = this.getStore().getCorpus();
					docs.forEach(function(doc) {
						docIds.push(corpus.getDocument(doc).getId())
					}, this);
					this.setApiParams({docId: docIds, docIndex: undefined})
	        		this.getStore().getProxy().setExtraParam('tool', 'corpus.DocumentTermCorrelations');
	        		this.getStore().load();
				}

            },
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                    xtype: 'querysearchfield'
                },{
                    xtype: 'totalpropertystatus'
                }, {
                	xtype: 'tbspacer'
                }, {
                	xtype: 'tbtext',
                	itemId: 'minInDocumentsCountRatioLabel',
                	text: me.localize('minInDocumentsCountRatioLabel')
                }, {
        			xtype: 'slider',
	            	increment: 5,
	            	minValue: 0,
	            	maxValue: 100,
	            	width: 75,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getApiParam("minInDocumentsCountRatio"))
	            			slider.up('toolbar').getComponent("minInDocumentsCountRatioLabel").setText(new Ext.XTemplate(me.localize("minInDocumentsCountRatioLabel")).apply([this.getApiParam("minInDocumentsCountRatio")]));
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({minInDocumentsCountRatio: newvalue});
	            			slider.up('toolbar').getComponent("minInDocumentsCountRatioLabel").setText(new Ext.XTemplate(me.localize("minInDocumentsCountRatioLabel")).apply([newvalue]));
	            			this.getStore().load();
	            		},
	            		scope: this
	            	}
                },{
        			xtype: 'corpusdocumentselector'
        		}]
            }]
        });
        
        me.on("loadedCorpus", function(src, corpus) {
        	if (corpus.getDocumentsCount()==1) { // switch to documents mode
        		this.getStore().getProxy().setExtraParam('tool', 'corpus.DocumentTermCorrelations');
        	}
        	if (this.isVisible()) {
        		this.getStore().load();
        	}
        });
        
    	me.on("activate", function() { // load after tab activate (if we're in a tab panel)
    		if (this.getStore().getCorpus()) {this.getStore().load();}
    	}, this)

    	me.on("query", function(src, query) {
        	this.setApiParam("query", query);
        	this.getStore().load();
        }, me);
        
        me.callParent(arguments);
     }
     
});