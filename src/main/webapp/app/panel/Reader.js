/**
 * The Reader tool provides a way of reading documents in the corpus, text is fetched as needed.
 *
 * @example
 *
 *   let config = {
 *     "limit": null,
 *     "query": null,
 *     "skipTodocId": null,
 *     "start": null
 *   };
 *
 *   loadCorpus("austen").tool("Reader", config);
 *
 * @class Reader
 * @tutorial reader
 * @memberof Tools
 */
Ext.define('Voyant.panel.Reader', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.data.store.Tokens'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.reader',
	isConsumptive: true,
    statics: {
    	i18n: {
			highlightEntities: 'Highlight Entities',
			entityType: 'entity type',
			nerVoyant: 'Entity Identification with Voyant',
			nerNssi: 'Entity Identification with NSSI',
			nerSpacy: 'Entity Identification with SpaCy'
    	},
    	api: {
			/**
			 * @memberof Tools.Reader
			 * @instance
			 * @property {start}
			 * @default
			 */
    		start: 0,

			/**
			 * @memberof Tools.Reader
			 * @instance
			 * @property {limit}
			 * @default
			 */
    		limit: 1000,

			/**
			 * @memberof Tools.Reader
			 * @instance
			 * @property {String} skipToDocId The document ID to start reading from, defaults to the first document in the corpus.
			 */
    		skipToDocId: undefined,

			/**
			 * @memberof Tools.Reader
			 * @instance
			 * @property {query}
			 */
    		query: undefined
    	},
    	glyph: 'xf0f6@FontAwesome'
	},
    config: {
    	innerContainer: undefined,
    	tokensStore: undefined, // for loading the tokens to display in the reader
    	documentsStore: undefined, // for storing a copy of the corpus document models
    	documentTermsStore: undefined, // for getting document term positions for highlighting
		documentEntitiesStore: undefined, // for storing the results of an entities call
		enableEntitiesList: true, // set to false when using reader as part of entitiesset
    	exportVisualization: false,
    	lastScrollTop: 0,
		scrollIntoView: false,
		insertWhere: 'beforeEnd',
    	lastLocationUpdate: new Date(),
    	options: [{xtype: 'stoplistoption'},{xtype: 'categoriesoption'}]
    },
    
    SCROLL_UP: -1,
    SCROLL_EQ: 0,
    SCROLL_DOWN: 1,
    
	LOCATION_UPDATE_FREQ: 100,
	
	INITIAL_LIMIT: 1000, // need to keep track since limit can be changed when scrolling,

	MAX_TOKENS_FOR_NER: 100000, // upper limit on document size for ner submission

    constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    },
    
    initComponent: function(config) {
    	var tokensStore = Ext.create("Voyant.data.store.Tokens", {
    		parentTool: this,
    		proxy: {
    			extraParams: {
    				forTool: 'reader'
    			}
    		}
    	})
    	var me = this;
    	tokensStore.on("beforeload", function(store) {
    		return me.hasCorpusAccess(store.getCorpus());
    	})
    	tokensStore.on("load", function(s, records, success) {
    		if (success) {
	    		var contents = "";
	    		var documentFrequency = this.localize("documentFrequency");
	    		var isPlainText = false;
	    		var docIndex = -1;
	    		var isLastNewLine = false;
	    		records.forEach(function(record) {
	    			if (record.getPosition()==0) {
	    				contents+="<h3>"+this.getDocumentsStore().getById(record.getDocId()).getFullLabel()+"</h3>";
	    			}
	    			if (record.getDocIndex()!=docIndex) {
	    				isPlainText = this.getDocumentsStore().getById(record.getDocId()).isPlainText();
	    				docIndex = record.getDocIndex();
	    			}
	    			if (record.isWord()) {
	    				isLastNewLine = false;
	    				contents += "<span class='word' id='"+ record.getId() + "' data-qtip='<div class=\"freq\">"+documentFrequency+" "+record.getDocumentRawFreq()+"</div>'>"+ record.getTerm() + "</span>";
	    			}
	    			else {
	    				var newContents = record.getTermWithLineSpacing(isPlainText);
	    				var isNewLine = newContents.indexOf("<br />")==0;
	    				if (isLastNewLine && (isNewLine || newContents.trim().length==0)) {}
	    				else {
	    					contents += newContents;
	    					isLastNewLine = isNewLine;
	    				}
	    			}
	    		}, this);
	    		this.updateText(contents);
	    		
	    		this.highlightKeywords();

				if (this.getDocumentEntitiesStore() !== undefined) {
					this.highlightEntities();
				}
    		}
    	}, this);
    	this.setTokensStore(tokensStore);
    	
    	this.on("query", function(src, queries) {
    		this.loadQueryTerms(queries);
    	}, this);
    	
    	this.setDocumentTermsStore(Ext.create("Ext.data.Store", {
			model: "Voyant.data.model.DocumentTerm",
    		autoLoad: false,
    		remoteSort: false,
    		proxy: {
				type: 'ajax',
				url: Voyant.application.getTromboneUrl(),
				extraParams: {
					tool: 'corpus.DocumentTerms',
					withPositions: true,
					bins: 25,
					forTool: 'reader'
				},
				reader: {
					type: 'json',
		            rootProperty: 'documentTerms.terms',
		            totalProperty: 'documentTerms.total'
				},
				simpleSortMode: true
   		    },
   		    listeners: {
   		    load: function(store, records, successful, opts) {
   		    		this.highlightKeywords(records);
   		    	},
   		    	scope: this
   		    }
    	}));
    	
    	this.on("afterrender", function() {
    		var centerPanel = this.down('panel[region="center"]');
    		this.setInnerContainer(centerPanel.getLayout().getRenderTarget());
    		
    		// scroll listener
    		centerPanel.body.on("scroll", function(event, target) {
    			var scrollDir = this.getLastScrollTop() < target.scrollTop ? this.SCROLL_DOWN
    								: this.getLastScrollTop() > target.scrollTop ? this.SCROLL_UP
									: this.SCROLL_EQ;
    			
    			// scroll up
    			if (scrollDir == this.SCROLL_UP && target.scrollTop < 1) {
    				this.fetchPrevious(true);
    			// scroll down
    			} else if (scrollDir == this.SCROLL_DOWN && target.scrollHeight - target.scrollTop < target.offsetHeight*1.5) {//target.scrollTop+target.offsetHeight>target.scrollHeight/2) { // more than half-way down
    				this.fetchNext(false);
    			} else {
    				var amount;
    				if (target.scrollTop == 0) {
    					amount = 0;
    				} else if (target.scrollHeight - target.scrollTop == target.clientHeight) {
    					amount = 1;
    				} else {
    					amount = (target.scrollTop + target.clientHeight * 0.5) / target.scrollHeight;
    				}
					
					var now = new Date();
        			if (now - this.getLastLocationUpdate() > this.LOCATION_UPDATE_FREQ || amount == 0 || amount == 1) {
        				this.updateLocationMarker(amount, scrollDir);
        			}
    			}
    			this.setLastScrollTop(target.scrollTop);
    		}, this);
    		
    		// click listener
    		centerPanel.body.on("click", function(event, target) {
    			target = Ext.get(target);
				// if (target.hasCls('entity')) {} TODO
    			if (target.hasCls('word')) {
    				var info = Voyant.data.model.Token.getInfoFromElement(target);
    				var term = target.getHtml();
    				var data = [{
    					term: term,
    					docIndex: info.docIndex
    				}];
    				this.loadQueryTerms([term]);
    				this.getApplication().dispatchEvent('termsClicked', this, data);
    			}
    		}, this);
    		
    		if (this.getCorpus()) {
				if (this.getApiParam('skipToDocId') === undefined) {
					this.setApiParam('skipToDocId', this.getCorpus().getDocument(0).getId());
				}
    			this.load();
	    		var query = this.getApiParam('query');
	    		if (query) {
	    			this.loadQueryTerms(Ext.isString(query) ? [query] : query);
	    		}
    		}
			this.on("loadedCorpus", function() {
				if (this.getApiParam('skipToDocId') === undefined) {
					this.setApiParam('skipToDocId', this.getCorpus().getDocument(0).getId());
				}
    			this.load(true); // make sure to clear in case we're replacing the corpus
	    		var query = this.getApiParam('query');
	    		if (query) {
	    			this.loadQueryTerms(Ext.isString(query) ? [query] : query);
	    		}
			}, this);
    	}, this);
    	
    	Ext.apply(this, {
    		title: this.localize('title'),
    		cls: 'voyant-reader',
    	    layout: 'fit',
    	    items: {
    	    	layout: 'border',
    	    	items: [{
    		    	bodyPadding: 10,
    		    	region: 'center',
    		    	border: false,
    		    	autoScroll: true,
    		    	html: '<div class="readerContainer"></div>'
    		    },{
					xtype: 'readergraph',
    		    	region: 'south',
					weight: 0,
    		    	height: 30,
    		    	split: {
    		    		size: 2
    		    	},
    		    	splitterResize: true,
					border: false,
					listeners: {
						documentRelativePositionSelected: function(src, data) {
							var doc = this.getDocumentsStore().getAt(data.docIndex);
							var totalTokens = doc.get('tokensCount-lexical');
							var position = Math.floor(totalTokens * data.fraction);
							var bufferPosition = position - (this.getApiParam('limit')/2);
							this.setApiParams({'skipToDocId': doc.getId(), start: bufferPosition < 0 ? 0 : bufferPosition});
							this.load(true);
						},
						scope: this
					}
    		    },{
					xtype: 'entitieslist',
					region: 'east',
					weight: 10,
					width: '40%',
					split: {
						size: 2
					},
					splitterResize: true,
					border: false,
					hidden: true,
					collapsible: true,
					animCollapse: false
				}]
    	    },

    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                	glyph: 'xf060@FontAwesome',
            		handler: function() {
            			this.fetchPrevious(true);
            		},
            		scope: this
            	},{
            		glyph: 'xf061@FontAwesome',
            		handler: function() {
            			this.fetchNext(true);
            		},
            		scope: this
            	},{xtype: 'tbseparator'},{
                    xtype: 'querysearchfield'
                },'->',{
					glyph: 'xf0eb@FontAwesome',
					tooltip: this.localize('highlightEntities'),
					itemId: 'nerServiceParent',
					hidden: true,
					menu: {
						items: [{
							xtype: 'menucheckitem',
							group: 'nerService',
							text: this.localize('nerSpacy'),
							itemId: 'spacy',
							checked: true,
							handler: this.nerServiceHandler,
							scope: this
						},{
							xtype: 'menucheckitem',
							group: 'nerService',
							text: this.localize('nerNssi'),
							itemId: 'nssi',
							checked: false,
							handler: this.nerServiceHandler,
							scope: this
						},{
							xtype: 'menucheckitem',
							group: 'nerService',
							text: this.localize('nerVoyant'),
							itemId: 'stanford',
							checked: false,
							handler: this.nerServiceHandler,
							scope: this
						}
						// ,{
						// 	xtype: 'menucheckitem',
						// 	group: 'nerService',
						// 	text: 'NER with Voyant (OpenNLP)',
						// 	itemId: 'opennlp',
						// 	checked: false,
						// 	handler: this.nerServiceHandler,
						// 	scope: this
						// }
						]
					}
				}]
    		}],
    		listeners: {
    			loadedCorpus: function(src, corpus) {
    	    		this.getTokensStore().setCorpus(corpus);
    	    		this.getDocumentTermsStore().getProxy().setExtraParam('corpus', corpus.getId());
    	    		
    	    		var docs = corpus.getDocuments();
    	    		this.setDocumentsStore(docs);
					
    	    		if (this.rendered) {
    	    			this.load();
        	    		if (this.hasCorpusAccess(corpus)==false) {
        	    			this.mask(this.localize("limitedAccess"), 'mask-no-spinner')
        	    		}
        	    		var query = this.getApiParam('query');
        	    		if (query) {
        	    			this.loadQueryTerms(Ext.isString(query) ? [query] : query);
        	    		}
    	    		}
    	    		
    			},
            	termsClicked: function(src, terms) {
            		var queryTerms = [];
            		terms.forEach(function(term) {
            			if (Ext.isString(term)) {queryTerms.push(term);}
            			else if (term.term) {queryTerms.push(term.term);}
            			else if (term.getTerm) {queryTerms.push(term.getTerm());}
            		});
            		if (queryTerms.length > 0) {
            			this.loadQueryTerms(queryTerms);
            		}
        		},
        		corpusTermsClicked: function(src, terms) {
        			var queryTerms = [];
            		terms.forEach(function(term) {
            			if (term.getTerm()) {queryTerms.push(term.getTerm());}
            		});
            		this.loadQueryTerms(queryTerms);
        		},
        		documentTermsClicked: function(src, terms) {
        			var queryTerms = [];
            		terms.forEach(function(term) {
            			if (term.getTerm()) {queryTerms.push(term.getTerm());}
            		});
            		this.loadQueryTerms(queryTerms);
        		},
        		documentSelected: function(src, document) {
        			var corpus = this.getTokensStore().getCorpus();
        			var doc = corpus.getDocument(document);
        			this.setApiParams({'skipToDocId': doc.getId(), start: 0});
					this.load(true);
        		},
        		documentsClicked: function(src, documents, corpus) {
        			if (documents.length > 0) {
            			var doc = documents[0];
            			this.setApiParams({'skipToDocId': doc.getId(), start: 0});
						this.load(true);
            		}
        		},
        		termLocationClicked: function(src, terms) {
    				if (terms[0] !== undefined) {
    					var term = terms[0];
    					var docIndex = term.get('docIndex');
    					var position = term.get('position');
    					this.showTermLocation(docIndex, position, term);
    				};
        		},
        		documentIndexTermsClicked: function(src, terms) {
        			if (terms[0] !== undefined) {
    					var term = terms[0];
    					var termRec = Ext.create('Voyant.data.model.Token', term);
    					this.fireEvent('termLocationClicked', this, [termRec]);
        			}
        		},
				entityResults: function(src, entities) {
					if (entities !== null) {
						this.clearEntityHighlights(); // clear again in case failed documents were rerun
						this.setDocumentEntitiesStore(entities);
						this.highlightEntities();
						if (this.getEnableEntitiesList()) {
							this.down('entitieslist').expand().show();
						}
					}
				},
				entitiesClicked: function(src, entities) {
					if (entities[0] !== undefined) {
						var entity = entities[0];
						var docIndex = entity.get('docIndex');
						var position = entity.get('positions')[0];
						if (Array.isArray(position)) position = position[0];
						this.showTermLocation(docIndex, position, entity);
					}
				},
				entityLocationClicked: function(src, entity, positionIndex) {
					var docIndex = entity.get('docIndex');
					var position = entity.get('positions')[positionIndex];
					if (Array.isArray(position)) position = position[0];
					this.showTermLocation(docIndex, position, entity);
				},
				scope: this
    		}
    	});
    	
        this.callParent(arguments);
    },
    
    loadQueryTerms: function(queryTerms) {
    	if (queryTerms && queryTerms.length > 0) {
			var docId = this.getApiParam('skipToDocId');
			if (docId === undefined) {
				var docIndex = 0;
				var locationInfo = this.getLocationInfo();
				if (locationInfo) {
					docIndex = locationInfo[0].docIndex;
				}
				docId = this.getCorpus().getDocument(docIndex).getId();
			}
			this.getDocumentTermsStore().load({
				params: {
					query: queryTerms,
					docId: docId,
					categories: this.getApiParam('categories'),
					limit: -1
    			}
			});
			this.down('readergraph').loadQueryTerms(queryTerms);
		}
    },

	showTermLocation: function(docIndex, position, term) {
		var bufferPosition = position - (this.getApiParam('limit')/2);
		var doc = this.getCorpus().getDocument(docIndex);
		this.setApiParams({'skipToDocId': doc.getId(), start: bufferPosition < 0 ? 0 : bufferPosition});
		this.load(true, {
			callback: function() {
				var el = this.body.dom.querySelector("#_" + docIndex + "_" + position);
				if (el) {
					el.scrollIntoView({
						block: 'center'
					});
					Ext.fly(el).frame('#f80');
				}
				if (term.get('type')) {
					this.highlightEntities();
				} else {
					this.highlightKeywords(term, false);
				}
			},
			scope: this
		});
	},
    
    highlightKeywords: function(termRecords, doScroll) {
		var container = this.getInnerContainer().first();
		container.select('span[class*=keyword]').removeCls('keyword').applyStyles({backgroundColor: 'transparent', color: 'black'});

		if (termRecords === undefined && this.getDocumentTermsStore().getCount() > 0) {
			termRecords = this.getDocumentTermsStore().getData().items;
		}
		if (termRecords === undefined) {
			return;
		}

		if (!Ext.isArray(termRecords)) termRecords = [termRecords];

		termRecords.forEach(function(r) {
			var term = r.get('term');
			var bgColor = this.getApplication().getColorForTerm(term);
			var textColor = this.getApplication().getTextColorForBackground(bgColor);
			bgColor = 'rgb('+bgColor.join(',')+') !important';
			textColor = 'rgb('+textColor.join(',')+') !important';
			var styles = 'background-color:'+bgColor+';color:'+textColor+';';
			
			// might be slightly faster to use positions so do that if they're available
			if (r.get('positions')) {
				var positions = r.get('positions');
				var docIndex = r.get('docIndex');
				
				positions.forEach(function(pos) {
					var match = container.dom.querySelector('#_'+docIndex+'_'+pos);
					if (match) {
						Ext.fly(match).addCls('keyword').dom.setAttribute('style', styles);
					}
				})
			} else {
				var caseInsensitiveQuery = new RegExp('^'+term+'$', 'i');
				var nodes = container.select('span.word');
				nodes.each(function(el, compEl, index) {
					if (el.dom.firstChild && el.dom.firstChild.nodeValue.match(caseInsensitiveQuery)) {
						el.addCls('keyword').dom.setAttribute('style', styles);
					}
				});
			}
		}, this);
	},

	nerServiceHandler: function(menuitem) {
		var annotator = menuitem.itemId;

		var docIndex = [];
		var locationInfo = this.getLocationInfo();
		if (locationInfo) {
			for (var i = locationInfo[0].docIndex; i <= locationInfo[1].docIndex; i++) {
				docIndex.push(i);
			}
		} else {
			docIndex.push(0);
		}

		this.clearEntityHighlights();

		var entitiesList = this.down('entitieslist');
		entitiesList.clearEntities();
		entitiesList.getEntities(annotator, docIndex);
	},

	clearEntityHighlights: function() {
		var container = this.getInnerContainer().first();
		container.select('.entity').each(function(el) {
			el.removeCls('entity start middle end location person organization misc money time percent date duration set unknown');
			el.dom.setAttribute('data-qtip', el.dom.getAttribute('data-qtip').replace(/<div class="entity">.*?<\/div>/g, ''));
		});
	},

	highlightEntities: function() {
		var container = this.getInnerContainer().first();
		var entities = this.getDocumentEntitiesStore();
		var entityTypeStr = this.localize('entityType');
		entities.forEach(function(entity) {
			var positionInstances = entity.positions;
			if (positionInstances) {
				positionInstances.forEach(function(positions) {
					var multiTermEntity = positions.length > 1;
					if (multiTermEntity) {
						// find the difference between start and end positions
						if (positions.length === 2 && positions[1]-positions[0] > 1) {
							// more than two terms, so fill in the middle positions
							var endPos = positions[1];
							var curPos = positions[0]+1;
							var curIndex = 1;
							while (curPos < endPos) {
								positions.splice(curIndex, 0, curPos);
								curPos++;
								curIndex++;
							}
						}
					}

					for (var i = 0, len = positions.length; i < len; i++) {
						var position = positions[i];
						if (position === -1) {
							console.warn('missing position for: '+entity.term);
						} else {
							var match = container.selectNode('#_'+entity.docIndex+'_'+position, false);
							if (match) {
								var termEntityPosition = '';
								if (multiTermEntity) {
									if (i === 0) {
										termEntityPosition = 'start ';
									} else if (i === len-1) {
										termEntityPosition = 'end ';
									} else {
										termEntityPosition = 'middle ';
									}
								}

								match.addCls('entity '+termEntityPosition+entity.type);
								var prevQTip = match.dom.getAttribute('data-qtip');
								if (prevQTip.indexOf('class="entity"') === -1) {
									match.dom.setAttribute('data-qtip', prevQTip+'<div class="entity">'+entityTypeStr+': '+entity.type+'</div>');
								}
							}
						}
					}
				});
			} else {
				console.warn('no positions for: '+entity.term);
			}
		});
	},
    
	fetchPrevious: function(scroll) {
		var readerContainer = this.getInnerContainer().first();
		var first = readerContainer.first('.word');
		if (first != null && first.hasCls("loading")===false) {
			while(first) {
				if (first.hasCls("word")) {
					var info = Voyant.data.model.Token.getInfoFromElement(first);
					var docIndex = info.docIndex;
					var start = info.position;
					var doc = this.getDocumentsStore().getAt(docIndex);    						
					var limit = this.getApiParam('limit');
					var getPrevDoc = false;
					if (docIndex === 0 && start === 0) {
						var scrollContainer = this.down('panel[region="center"]').body;
						var scrollNeeded = first.getScrollIntoViewXY(scrollContainer, scrollContainer.dom.scrollTop, scrollContainer.dom.scrollLeft);
						if (scrollNeeded.y != 0) {
							first.dom.scrollIntoView();
						}
						first.frame("red");
						break;
					}
					if (docIndex > 0 && start === 0) {
						getPrevDoc = true;
						docIndex--;
						doc = this.getDocumentsStore().getAt(docIndex);
						var totalTokens = doc.get('tokensCount-lexical');
						start = totalTokens-limit;
						if (start < 0) {
							start = 0;
							this.setApiParam('limit', totalTokens);
						}
					} else {
						limit--; // subtract one to limit for the word we're removing. need to do this to account for non-lexical tokens before/after first word.
						start -= limit;
					}
					if (start < 0) start = 0;
					
					var mask = first.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'before', false).mask();
					if (!getPrevDoc) {
						first.destroy();
					}
					
					var id = doc.getId();
					this.setApiParams({'skipToDocId': id, start: start});
					this.setInsertWhere('afterBegin')
					this.setScrollIntoView(scroll);
					this.load();
					this.setApiParam('limit', this.INITIAL_LIMIT);
					break;
				}
				first.destroy(); // remove non word
				first = readerContainer.first();
			}
		}
	},
	
	fetchNext: function(scroll) {
		var readerContainer = this.getInnerContainer().first();
		var last = readerContainer.last();
		if (last.hasCls("loading")===false) {
			while(last) {
				if (last.hasCls("word")) {
					var info = Voyant.data.model.Token.getInfoFromElement(last);
					var docIndex = info.docIndex;
					var start = info.position;
					var doc = this.getDocumentsStore().getAt(info.docIndex);
					var id = doc.getId();
					
					var totalTokens = doc.get('tokensCount-lexical');
					if (start + this.getApiParam('limit') >= totalTokens && docIndex == this.getCorpus().getDocumentsCount()-1) {
						var limit = totalTokens - start;
						if (limit <= 1) {
							last.dom.scrollIntoView();
							last.frame("red")
							break;
						} else {
							this.setApiParam('limit', limit);
						}
					}
					
					// remove any text after the last word
					var nextSib = last.dom.nextSibling;
					while(nextSib) {
						var oldNext = nextSib;
						nextSib = nextSib.nextSibling;
						oldNext.parentNode.removeChild(oldNext);
					}
					
					var mask = last.insertSibling("<div class='loading'>"+this.localize('loading')+"</div>", 'after', false).mask();
					last.destroy();
					this.setApiParams({'skipToDocId': id, start: info.position});
					this.setInsertWhere('beforeEnd');
					this.setScrollIntoView(scroll);
					this.load(); // callback not working on buffered store
					this.setApiParam('limit', this.INITIAL_LIMIT);
					break;
				}
				last.destroy(); // remove non word
				last = readerContainer.last();
			}
		}
	},
	
    load: function(doClear, config) {
    	if (doClear) {
    		this.getInnerContainer().first().destroy(); // clear everything
    		this.getInnerContainer().setHtml('<div class="readerContainer"><div class="loading">'+this.localize('loading')+'</div></div>');
			this.getInnerContainer().first().first().mask();
		}

		// check if we're loading a different doc and update terms store if so
		var tokensStore = this.getTokensStore();
		if (tokensStore.lastOptions && tokensStore.lastOptions.params.skipToDocId && tokensStore.lastOptions.params.skipToDocId !== this.getApiParam('skipToDocId')) {
			var dts = this.getDocumentTermsStore();
			if (dts.lastOptions) {
				var query = dts.lastOptions.params.query;
				this.loadQueryTerms(query);
			}
		}

    	this.getTokensStore().load(Ext.apply(config || {}, {
    		params: Ext.apply(this.getApiParams(), {
    			stripTags: 'blocksOnly',
    			stopList: '' // token requests shouldn't have stopList
    		})
    	}));
    },
    
    updateText: function(contents) {
    	var loadingMask = this.getInnerContainer().down('.loading');
    	if (loadingMask) loadingMask.destroy();
    	// FIXME: something is weird here in tool/Reader mode, this.getInnerContainer() seems empty but this.getInnerContainer().first() gets the canvas?!?
    	var inserted = this.getInnerContainer().first().insertHtml(this.getInsertWhere()/* where is this defined? */, contents, true); // return Element, not dom
    	if (inserted && this.getScrollIntoView()) {
    		inserted.dom.scrollIntoView(); // use dom
    		// we can't rely on the returned element because it can be a transient fly element, but the id is right in a deferred call
    		Ext.Function.defer(function() {
    			var el = Ext.get(inserted.id); // re-get el
    			if (el) {el.frame("red")}
    		}, 100);
    	}
    	var target = this.down('panel[region="center"]').body.dom;
    	var amount;
		if (target.scrollTop == 0) {
			amount = 0;
		} else if (target.scrollHeight - target.scrollTop == target.clientHeight) {
			amount = 1;
		} else {
			amount = (target.scrollTop + target.clientHeight * 0.5) / target.scrollHeight;
		}
    	this.updateLocationMarker(amount);
	},
	
	updateLocationMarker: function(amount, scrollDir) {
		var locationInfo = this.getLocationInfo();
		if (locationInfo) {
			var info1 = locationInfo[0];
			var info2 = locationInfo[1];

			var corpus = this.getCorpus();
			var partialFirstDoc = false;

			if (info1.position !== 0) {
				partialFirstDoc = true;
			}

			var docTokens = {};
			var totalTokens = 0;
			var showNerButton = this.getEnableEntitiesList() && this.getApplication().getEntitiesEnabled ? this.getApplication().getEntitiesEnabled() : false;
			var currIndex = info1.docIndex;
			while (currIndex <= info2.docIndex) {
				var tokens = corpus.getDocument(currIndex).get('tokensCount-lexical');
				if (tokens > this.MAX_TOKENS_FOR_NER) {
					showNerButton = false;
				}
				if (currIndex === info2.docIndex) {
					tokens = info2.position; // only count tokens up until last displayed word
				}
				if (currIndex === info1.docIndex) {
					tokens -= info1.position; // subtract missing tokens, if any
				}
				totalTokens += tokens;
				docTokens[currIndex] = tokens;
				currIndex++;
			}

			var nerParent = this.down('#nerServiceParent');
			if (showNerButton) {
				nerParent.show();
			} else {
				nerParent.hide();
			}
			
			var tokenPos = Math.round(totalTokens * amount);
			var docIndex = 0;
			var currToken = 0;
			for (var i = info1.docIndex; i <= info2.docIndex; i++) {
				docIndex = i;
				currToken += docTokens[i];
				if (currToken >= tokenPos) {
					break;
				}
			}
			var remains = (currToken - tokenPos);
			var tokenPosInDoc = docTokens[docIndex] - remains;
			
			if (partialFirstDoc && docIndex === info1.docIndex) {
				tokenPosInDoc += info1.position;
			}
				
			var fraction = tokenPosInDoc / corpus.getDocument(docIndex).get('tokensCount-lexical');

			this.down('readergraph').moveLocationMarker(docIndex, fraction, scrollDir);
		}
	},

	getLocationInfo: function() {
		var readerWords = Ext.DomQuery.select('.word', this.getInnerContainer().down('.readerContainer', true));
		var firstWord = readerWords[0];
		var lastWord = readerWords[readerWords.length-1];
		if (firstWord !== undefined && lastWord !== undefined) {
			var info1 = Voyant.data.model.Token.getInfoFromElement(firstWord);
			var info2 = Voyant.data.model.Token.getInfoFromElement(lastWord);
			return [info1, info2];
		} else {
			return null;
		}
	}
});
