/**
 * The Contexts (or Keywords in Context) tool shows each occurrence of a keyword with a bit of surrounding text (the context).
 * 
 * @class Contexts
 * @memberof Tools
 */
Ext.define('Voyant.panel.Contexts', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	requires: ['Voyant.data.store.Contexts'],
	alias: 'widget.contexts',
	isConsumptive: true,
    statics: {
    	i18n: {
    	},
    	api: {
			/**
			 * @memberof Contexts
			 * @property {Query}
			 */
    		query: undefined,

			/**
			 * @memberof Contexts
			 * @property {DocId}
			 */
    		docId: undefined,

			/**
			 * @memberof Contexts
			 * @property {DocIndex}
			 */
    		docIndex: undefined,

			/**
			 * @memberof Contexts
			 * @property {StopList}
			 * @default
			 */
    		stopList: 'auto',

			/**
			 * @memberof Contexts
			 * @property {Context}
			 * @default
			 */
    		context: 5,

			/**
			 * @memberof Contexts
			 * @property {Number} expand  How many terms to show when you expand any given row
			 * @default
			 */
    		expand: 50,

			/**
			 * @memberof Contexts
			 * @property {Columns} columns 'docIndex', 'left', 'term', 'right', 'position'
			 */
			columns: undefined,

			/**
			 * @memberof Contexts
			 * @property {SortColumn}
			 */
			sort: undefined,

			/**
			 * @memberof Contexts
			 * @property {SortDir}
			 */
			dir: undefined,

			/**
			 * @memberof Contexts
			 * @property {TermColors}
			 * @default
			 */
			termColors: 'categories'
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	options: [{xtype: 'stoplistoption'},{xtype: 'categoriesoption'},{xtype: 'termcolorsoption'}]
    },
    constructor: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, { 
    		title: this.localize('title'),
    		emptyText: this.localize("emptyText"),
            store : Ext.create("Voyant.data.store.ContextsBuffered", {
            	parentPanel: this,
            	proxy: {
            		extraParams: {
                    	stripTags: "all"            			
            		}
            	}
//            	sortOnLoad: true,
//            	sorters: {
//                    property: 'position',
//                    direction: 'ASC'
//            	}
            }),
    		selModel: {
    			type: 'rowmodel',
                listeners: {
                    selectionchange: {
                    	fn: function(sm, selections) {
                    		this.getApplication().dispatchEvent('termLocationClicked', this, selections);
                    	},
                    	scope: this
                    }
                }
            },
            plugins: [{ // the expander slider assumes there's only one plugin, needs to be updated if changed
                ptype: 'rowexpander',
                rowBodyTpl : new Ext.XTemplate('')
            }],
            dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                    xtype: 'querysearchfield'
                }, {
                    xtype: 'totalpropertystatus'
                }, this.localize('context'), {
                	xtype: 'slider',
                	minValue: 5,
                	value: 5,
                	maxValue: 50,
                	increment: 5,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(me.getApiParam('context'));
                		},
                		changecomplete: function(slider, newValue) {
                			me.setApiParam("context", slider.getValue());
           		        	me.getStore().clearAndLoad({params: me.getApiParams()});
                		}
                	}
                }, this.localize('expand'), {
                	xtype: 'slider',
                	minValue: 5,
                	value: 5,
                	maxValue: 500,
                	increment: 10,
                	width: 50,
                	listeners: {
                		render: function(slider) {
                			slider.setValue(me.getApiParam('expand'));
                		},
                		changecomplete: function(slider, newValue) {
                			me.setApiParam('expand', newValue);
                			var view = me.getView();
                			var recordsExpanded = me.plugins[0].recordsExpanded;
                			var store = view.getStore();
                			for (var id in recordsExpanded) {
                				var record = store.getByInternalId(id);
            					var row = view.getRow(record);
            					var expandRow = row.parentNode.childNodes[1];
                				if (recordsExpanded[id]) {
                					view.fireEvent("expandbody", row, record, expandRow, {force: true});
                				} else {
                					Ext.fly(expandRow).down('.x-grid-rowbody').setHtml('');
                				}
                			}
                		}
                	}
                },{
        			xtype: 'corpusdocumentselector'
        		}]
            }],
    		columns: [{
    			text: this.localize("document"),
    			tooltip: this.localize("documentTip"),
                width: 'autoSize',
        		dataIndex: 'docIndex',
                sortable: true,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                	return store.getCorpus().getDocument(value).getTitle();
                }
            },{
    			text: this.localize("left"),
    			tooltip: this.localize("leftTip"),
    			align: 'right',
        		dataIndex: 'left',
                sortable: true,
                flex: 1
            },{
    			text: this.localize("term"),
    			tooltip: this.localize("termTip"),
        		dataIndex: 'term',
                sortable: true,
                width: 'autoSize',
				xtype: 'coloredtermfield'
            },{
    			text: this.localize("right"),
    			tooltip: this.localize("rightTip"),
        		dataIndex: 'right',
                sortable: true,
                flex: 1
            },{
    			text: this.localize("position"),
    			tooltip: this.localize("positionTip"),
        		dataIndex: 'position',
                sortable: true,
                hidden: true,
                flex: 1
            }],
            listeners: {
            	scope: this,
				corpusSelected: function() {
					if (this.getStore().getCorpus()) {
						this.setApiParams({docId: undefined, docIndex: undefined})
						this.getStore().clearAndLoad()
					}
				},
				
				documentsSelected: function(src, docs) {
					var docIds = [];
					var corpus = this.getStore().getCorpus();
					docs.forEach(function(doc) {
						docIds.push(corpus.getDocument(doc).getId())
					}, this);
					this.setApiParams({docId: docIds, docIndex: undefined})
					this.getStore().clearAndLoad()
				},

            	documentSegmentTermClicked: {
	           		 fn: function(src, documentSegmentTerm) {
	           			 if (!documentSegmentTerm.term) {return;}
	           			 params = {query: documentSegmentTerm.term};
	           			 if (documentSegmentTerm.docId) {
	           				 params.docId = documentSegmentTerm.docId;
	           			 }
	           			 else {
	           				 // default to first document
	           				 params.docIndex = documentSegmentTerm.docIndex ?  documentSegmentTerm.docIndex : 0;
	           			 }
	           			 this.setApiParams(params);
	       	        	if (this.isVisible()) {
	       		        	this.getStore().clearAndLoad()
	       	        	}
	           		 },
	           		 scope: this
            	},
	           	 documentIndexTermsClicked: {
	           		 fn: function(src, documentIndexTerms) {
	           			// this isn't quite right, since we want every term associated with a docIndex, but for now it will do
	           			var queriesHash = {};
	           			var queries = [];
	           			var docIndexHash = {};
	           			var docIndex = [];
	           			documentIndexTerms.forEach(function(item) {
	           				if (!queriesHash[item.term]) {
	           					queries.push(item.term);
	           					queriesHash[item.term]=true;
	           				}
	           				if (!docIndexHash[item.docIndex]) {
	           					docIndex.push(item.docIndex);
	           					docIndexHash[item.docIndex]=true;
	           				}
	           			});
	       	        	this.setApiParams({
	       	        		docId: undefined,
	       	        		docIndex: docIndex,
	       	        		query: queries
	       	        	});
	       	        	if (this.isVisible()) {
	       		        	this.getStore().clearAndLoad({params: this.getApiParams()});
	       	        	}
	           		 },
	           		 scope: this
	           	 },
                 afterrender: function(me) {
                	 me.getView().on('expandbody', function( rowNode, record, expandRow, eOpts ) {
                		 if (expandRow.textContent==="" || (eOpts && eOpts.force)) {
                	            var store = Ext.create("Voyant.data.store.Contexts", {
                	            	stripTags: "all",
                	            	corpus: me.getStore().getCorpus()
                	            });
                	            var data = record.getData();
								var query = data.query;
								if (query.match(/^[\^@]/) !== null) {
									query = data.term; // if it's a category query then use term instead
								}
                	            store.load({
                	            	params: {
                    	            	query: query,
                    	            	docIndex: data.docIndex,
                    	            	position: data.position,
                    	            	limit: 1,
                    	            	context: me.getApiParam('expand')
                	            	},
                	                callback: function(records, operation, success) {
                	                	if (success && records.length==1) {
                	                		data = records[0].getData();
                	                		Ext.fly(operation.expandRow).down('.x-grid-rowbody').setHtml(data.left + " <span class='word keyword'>" + data.middle + "</span> " + data.right);
                	                	}
                	                },
                	                expandRow: expandRow
                	            });
                	            
                		 }
                	 });
                 }

            }
        });
        
        me.on("loadedCorpus", function(src, corpus) {
        	if (this.hasCorpusAccess(corpus)==false) {
        		this.mask(this.localize('limitedAccess'), 'mask-no-spinner');
        	}
        	else {
				var query = Ext.Array.from(this.getApiParam("query"));
				if (query.length > 0 && query[0].match(/^[\^@]/) !== null) {
					// query is a category so just load
					this.getStore().clearAndLoad({params: this.getApiParams()});
				} else {
					var corpusTerms = corpus.getCorpusTerms({autoLoad: false});
					corpusTerms.load({
						callback: function(records, operation, success) {
							if (success && records.length>0) {
								this.setApiParam("query", [records[0].getTerm()]);
								this.getStore().clearAndLoad({params: this.getApiParams()});
							}
						},
						scope: me,
						params: {
							limit: 1,
							query: query,
							stopList: this.getApiParam("stopList"),
							forTool: 'contexts'
						}
					});
				}
        	}
        });
        
        me.on("query", function(src, query) {
        	this.setApiParam('query', query);
        	this.getStore().clearAndLoad({params: this.getApiParams()});
        }, me);
        
        me.on("documentTermsClicked", function(src, documentTerms) {
        	var documentIndexTerms = [];
        	documentTerms.forEach(function(documentTerm) {
        		documentIndexTerms.push({
        			term: documentTerm.getTerm(),
        			docIndex: documentTerm.getDocIndex()
        		});
        	});
        	this.fireEvent("documentIndexTermsClicked", this, documentIndexTerms);
        });
        
        me.on("termsClicked", function(src, terms) {
        	var documentIndexTerms = [];
        	if (Ext.isString(terms)) {terms = [terms];}
        	terms.forEach(function(term) {
        		if (term.docIndex !== undefined) {
            		documentIndexTerms.push({
            			term: term.term,
            			docIndex: term.docIndex
            		});
        		}
        	});
        	if (documentIndexTerms.length > 0) {
        		this.fireEvent("documentIndexTermsClicked", this, documentIndexTerms);
        	}
        });

    	me.callParent(arguments);
     }
     
});