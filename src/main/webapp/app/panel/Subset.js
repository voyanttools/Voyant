Ext.define('Voyant.panel.Subset', { 
	
	
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel','Voyant.util.Downloadable'],
	alias: 'widget.subset',
	isConsumptive: true,
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		documentFilename: ['pubDate','title'],
    		documentFormat: 'SOURCE'
    	},
		glyph: 'xf0ce@FontAwesome'
    },
    config: {
    	options: [{xtype: 'stoplistoption'},{xtype: 'categoriesoption'}],
		inDocumentsCountOnly: false,
		stopList: 'auto',
		store: undefined,
		matchingDocIds: []
    },
    constructor: function(config) {
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);    	
    },
    
    
    initComponent: function(config) {
        var me = this;

        Ext.applyIf(me, {
        	introHtml: '',
        	fieldItems: [{
	        		xtype: 'querysearchfield',
	        		fieldLabel: this.localize('titleLabel'),
	        		tokenType: 'title'
        		},{
	        		xtype: 'querysearchfield',
	        		fieldLabel: this.localize('authorLabel'),
	        		tokenType: 'author'
        		},{
	        		xtype: 'querysearchfield',
	        		fieldLabel: this.localize('lexicalLabel')
        	}],
        	fieldColumns: 2
        });
        
        Ext.applyIf(me, {
        	intro: {
        		margin: '5 0 5 0',
        		layout: 'center',
        		items: {
        			itemId: 'intro',
            		html: me.introHtml
        		}
        	},
        	fields: {
				xtype: 'container',
        		layout: 'center',
        		items: {
    				xtype: 'container',
        			maxWidth: 1200,
        			layout: {
        				type: 'table',
        				columns: me.fieldColumns
        			},
        			// wrap in another container otherwise the tip won't work
        			items: me.fieldItems.map(function(item) {return {
        				xtype: 'container',
            			defaults: {
            				margin: '5 10 5 10',
                    		inDocumentsCountOnly: me.getInDocumentsCountOnly(),
                    		stopList: me.getStopList(),
                    		showAggregateInDocumentsCount: true,
                    		isDocsMode: true,
                    		flex: 1,
                    		maxWidth: 800,
                    		labelAlign: 'right'
            			},
        				items: Ext.applyIf(item, {
        					fieldLabel: me.localize((item.tokenType ? item.tokenType : 'lexical')+'Label')
        				})
        			}}, this)
        		}
        	},
        	foot: {
        		layout: 'center',
        		margin: '20 0 0 0',
        		items: {
        			xtype: 'container',
        			layout: {
        				type: 'hbox',
        				align: 'middle'
        			},
        			defaults: {
    	        		margin: '0 5 0 5',
//    	        		scale: 'large',
    	        		width: 200
        			},
        			items:  [{
    	        		xtype: 'button',
    	        		itemId: 'export',
	                    glyph: 'xf08e@FontAwesome',
    	        		text: this.localize('sendToVoyantButton'),
    	        		handler: me.handleSendToVoyant,
    	        		scope: me
            		},{
    	        		xtype: 'button',
				    	glyph: 'xf019@FontAwesome',
    	        		itemId: 'download',
    	        		text: this.localize('downloadButton'),
    	        		handler: me.handleExport,
    	        		scope: me
            		},{
            			xtype: 'container',
            			hidden: true,
            			itemId: 'statuscontainer',
            			layout: 'vbox',
            			items: [{
            				itemId: 'status',
            				bodyStyle: 'text-align: center',
            				width: 200
            			},{
            				xtype: 'container',
            				width: 200,
            				items: {
            	    			xtype: 'sparklineline',
            	    			chartRangeMin: 0,
            	    			itemId: 'sparkline',
            	    			margin: '0 0 0 10',
            	    			values: [1,1],
            	    			height: 20,
            	    			width: 200
            				}
            			}]
            		}]
        		}
        	}
        })

        Ext.applyIf(me, {
        	items: [me.intro, me.fields, me.foot]
        });
        
    	me.on('loadedCorpus', function(src, corpus) {
    		me.getStore().setCorpus(corpus);
    		if (me.getInitialConfig('introHtml')==undefined && me.getInitialConfig('intro')==undefined) {
    			 me.queryById('intro').setHtml(corpus.getString())
    		}
    	}, me);
    	
    	me.on('query', function(src, queries) {
    		this.performAggregateQuery(this.getAggregateQuery());
    	});
    	
    	me.setStore(Ext.create('Voyant.data.store.DocumentQueryMatches'))
        me.callParent([config]);
        
    },
    
    handleSendToVoyant: function() {
    	if (!this.getStore().lastOptions || !this.getStore().lastOptions.params.query) {
    		// there's currently no query, so give the option of opening the current corpus in a new window
    		Ext.Msg.alert(this.localize('sendToVoyantButton'), new Ext.XTemplate(this.localize('sendToVoyantNoQuery')).apply([this.getBaseUrl()+"?corpus="+this.getStore().getCorpus().getId()]))
    	} else {
        	this.mask("Creating corpus…");

			Ext.Ajax.request({
				url: this.getApplication().getTromboneUrl(),
				params: {
					corpus: this.getCorpus().getId(),
					tool: 'corpus.CorpusManager',
					keepDocuments: true,
					docId: this.getMatchingDocIds()
				},
				success: function(response, opts) {
					this.unmask();
					var json = Ext.JSON.decode(response.responseText);
					var url = this.getBaseUrl()+"?corpus="+json.corpus.id;
					this.openUrl(url);
				},
				failure: function(response, opts) {
					this.unmask();
					this.showResponseError("Unable to export corpus: "+this.getCorpus().getId(), response);
				},
				scope: this
			})
    	}
    },
    
    handleExport: function() {
    	if (!this.getStore().lastOptions || !this.getStore().lastOptions.params.query) {
    		this.downloadFromCorpusId(this.getStore().getCorpus().getId());
    	} else {
    		var record = this.getStore().getAt(0);
    		if (this.getStore().lastOptions.params.query && record && record.getCount()==0) {
    			this.showMsg({message: this.localize('noMatches')})
    		} else {
    	    	Ext.Ajax.request({
					url: this.getApplication().getTromboneUrl(),
					params: {
						corpus: this.getCorpus().getId(),
						tool: 'corpus.CorpusManager',
						keepDocuments: true,
						docId: this.getMatchingDocIds()
					},
					success: function(response, opts) {
						this.unmask();
						var json = Ext.JSON.decode(response.responseText);
						this.downloadFromCorpusId(json.corpus.id);
					},
					failure: function(response, opts) {
						this.unmask();
						this.showResponseError("Unable to export corpus: "+this.getCorpus().getId(), response);
					},
					scope: this
				})
    		}
    	}
    },

    performAggregateQuery: function(query) {
    	var statuscontainer = this.queryById('statuscontainer');
		var status = this.queryById('status');
		var spark = this.queryById('sparkline');
		if (statuscontainer) {statuscontainer.show();}
		if (status) {status.setHtml(new Ext.XTemplate('{0:plural("documents")} matching.').apply([0]))}
		if (spark) {spark.setValues([0,0]);}
    	if (query) {
        	var docsCount = this.getStore().getCorpus().getDocumentsCount();
        	this.getStore().load({
        		params: {
        			query: query,
        			withDistributions: true,
					includeDocIds: true,
        			bins: docsCount > 100 ? 100 : docsCount 
        		},
        		callback: function(records, operation, success) {
        			if (success && records && records.length==1) {
						var record = records[0];
        				if (status) {
        					status.setHtml(new Ext.XTemplate('{0:plural("document")} matching.').apply([record.getCount()]))
        				}
        				if (spark) {
            				spark.setValues(record.getDistributions())
        				}
						this.setMatchingDocIds(Ext.Array.clone(record.getDocIds()));
        			}
        		},
				scope: this
        	})
    	} else if (this.getStore().lastOptions) { // set query to undefined so that send/export buttons work properly
    		this.getStore().lastOptions.params.query = undefined
    	}
    },
    
    getAggregateQuery: function() {
		var aggregateQueries = [];
		Ext.ComponentQuery.query('field', this).forEach(function(field) {
			if (field.getTokenType && field.getValue) {
				var tokenType = field.getTokenType();
				var vals = Ext.Array.from(field.getValue());
				if (vals.length>0) {
					if (vals.length>0) {
        				aggregateQueries.push("+("+vals.map(function(val) {
        					return tokenType+":"+val
        				}).join("|")+")");
					}
				}
			}
		})
		return aggregateQueries.join(" ");
    }
})
