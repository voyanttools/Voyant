/**
 * The Summary panel provides an overview of a corpus, and the content will depend on whether the corpus includes one document or many.
 * You can work with the summary programmatically using {@link Spyral.Corpus#summary}.
 *
 * @example
 *
 *   let config = {
 *     "limit": null,
 *     "numberOfDocumentsForDistinctiveWords": null,
 *     "start": null,
 *     "stopList": null,
 *   };
 *
 *   loadCorpus("austen").tool("Summary", config);
 *
 * @class Summary
 * @tutorial summary
 * @memberof Tools
 */
Ext.define('Voyant.panel.Summary', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.summary',
    statics: {
    	i18n: {
			readabilityIndex: 'Readability Index:',
			docsDensityTip: 'ratio of unique words in this document',
			avgWordsPerSentenceTip: 'average words per sentence in this document',
			readabilityTip: 'the Coleman-Liau readability index for this document'
    	},
    	api: {
    		
    		/**
    		 * @memberof Tools.Summary
			 * @instance
			 * @property {stopList}
			 * @default
    		 */
    		stopList: 'auto',
    		
    		/**
			 * @memberof Tools.Summary
			 * @instance
			 * @property {start}
			 * @default
			 */
    		start: 0,
    		
    		
    		/**
    		 * @memberof Tools.Summary
			 * @instance
			 * @property {limit}
			 * @default
    		 */
    		limit: 5,
    		
    		/**
			 * @memberof Tools.Summary
    		 * @instance
    		 * @property {Number} numberOfDocumentsForDistinctiveWords The number of items to include in the list of distinctive words (similar to the limit parameter but specific to distinctive words).
    		 */
    		numberOfDocumentsForDistinctiveWords: 10
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	options: [{xtype: 'stoplistoption'},{xtype: 'categoriesoption'}]
    },
    autoScroll: true,
    cls: 'corpus-summary',
    
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		items: {
    			itemId: 'main',
    			cls: 'main',
    			margin: 10
    		},
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
        			fieldLabel: this.localize('items'),
        			labelWidth: 40,
        			width: 120,
        			xtype: 'slider',
	            	increment: 5,
	            	minValue: 5,
	            	maxValue: 59,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(this.getApiParam("limit"))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({limit: newvalue});
	            			this.loadSummary();
	            		},
	            		scope: this
	            	}
                }]
    		}]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
    	this.on("afterrender", function() {
        	this.body.addListener('click', function(e) {
    			var target = e.getTarget(null, null, true);
    			if (target && target.dom.tagName == 'A') {
    				if (target.hasCls('document-id')) {
    					var docId = target.getAttribute('val', 'voyant');
    					var doc = this.getCorpus().getDocuments().getById(docId);
    					this.dispatchEvent('documentsClicked', this, [doc]);
    				} else if (target.hasCls('corpus-type')) {
    					this.dispatchEvent('termsClicked', this, [target.getHtml()]);
    				} else if (target.hasCls('document-type')) {
    					this.dispatchEvent('documentIndexTermsClicked', this, [{
    						term: target.getHtml(),
    						docIndex: target.getAttribute("docIndex", 'voyant')
    					}]);
    				}
    			}
    		}, this);
    	})
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		if (this.rendered) {
    			this.loadSummary();
    		}
    		else {
    			this.on("afterrender", function() {
    				this.loadSummary();
    			}, this)
    		}

    	});
    	
    	// if we have a corpus, load it
    	if (config && config.corpus) {
    		this.fireEvent('loadedCorpus', this, config.corpus);
    	}
    	
    	this.on("resize", function() {
    		var available = this.getWidth()-200;
    		this.query("sparklineline").forEach(function(spark) {
    			if (spark.getWidth()>available) {
    				spark.setWidth(available);
    			}
    		})
    	}, this)
    },
    
    loadSummary: function() {
    	
    	var me = this;
    	
    	var main = this.queryById('main');
    	
    	main.removeAll();
    	main.add({
			cls: 'section',
    		html: this.getCorpus().getString()
    	});
    	
    	var docs = this.getCorpus().getDocuments().getRange();
    	var limit = this.getApiParam('limit');
    	
    	if (docs.length>1) {
    		
        	var docsLengthTpl = new Ext.XTemplate('<tpl for="." between="; "><a href="#" onclick="return false" class="document-id" voyant:val="{id}" data-qtip="{title}">{shortTitle}</a><span style="font-size: smaller"> (<span class="info-tip" data-qtip="{valTip}">{val}</span>)</span></a></tpl>')

        	var sparkWidth;
        	if (docs.length<25) {sparkWidth=docs.length*4;}
        	else if (docs.length<50) {sparkWidth=docs.length*2;}
        	else if (docs.length>100) {
        		var available  = main.getWidth()-200;
        		sparkWidth = available < docs.length ? docs.length : available;
        	}
        	
        	var numberOfTerms = this.localize('numberOfTerms');

			// document length
			docs.sort(function(d1, d2) {return d2.getLexicalTokensCount()-d1.getLexicalTokensCount()});
			main.add(this.showSparklineSection(
				function(doc) { return doc.getLexicalTokensCount(); },
				this.localize('docsLength'), this.localize('longest'), this.localize('shortest'),
				docs, limit, docsLengthTpl, sparkWidth, this.localize('numberOfTerms')
			));
        	
			// vocabulary density
    		docs.sort(function(d1, d2) {return d2.getLexicalTypeTokenRatio()-d1.getLexicalTypeTokenRatio()});
			main.add(this.showSparklineSection(
				function(doc) { return Ext.util.Format.number(doc.getLexicalTypeTokenRatio(),'0.000'); },
				this.localize('docsDensity'), this.localize('highest'), this.localize('lowest'),
				docs, limit, docsLengthTpl, sparkWidth, this.localize('docsDensityTip')
			));
 
        	// words per sentence
    		docs.sort(function(d1, d2) {return d2.getAverageWordsPerSentence()-d1.getAverageWordsPerSentence()});
			main.add(this.showSparklineSection(
				function(doc) { return Ext.util.Format.number(doc.getAverageWordsPerSentence(),'0.0'); },
				this.localize('averageWordsPerSentence'), this.localize('highest'), this.localize('lowest'),
				docs, limit, docsLengthTpl, sparkWidth, this.localize('avgWordsPerSentenceTip')
			));

    	} else { // single document, we can still show word density and average words per sentence
    		var doc = docs[0];
    		if (doc) {
            	main.add({
            		cls: 'section',
            		html:"<b>"+this.localize("docsDensity")+"</b> "+Ext.util.Format.number(doc.getLexicalTypeTokenRatio(),'0.000')
            	});    		
            	main.add({
            		cls: 'section',
            		html: "<b>"+this.localize("averageWordsPerSentence")+"</b> "+Ext.util.Format.number(doc.getAverageWordsPerSentence(),'0.0')
            	});    		
    		}
    	}

		// readability
		this.getCorpus().getReadability().then(function(data) {
			docs.forEach(function(doc) {
				var readDoc = data.find(function(dataDoc) {
					return dataDoc.docId === doc.getId();
				});
				if (readDoc) {
					doc.set('readability', readDoc.readability);
				}
			});

			var sectionIndex = main.items.length-2;
			if (docs.length>1) {
				docs.sort(function(d1, d2) {return d2.get('readability')-d1.get('readability')});
				main.insert(sectionIndex, me.showSparklineSection(function(doc) {
					return Ext.util.Format.number(doc.get('readability'),'0.000');
				}, me.localize('readabilityIndex'), me.localize('highest'), me.localize('lowest'), docs, limit, docsLengthTpl, sparkWidth, me.localize('readabilityTip')));
			} else {
				main.insert(sectionIndex, {
					cls: 'section',
					html: '<b>'+me.localize('readabilityIndex')+'</b> '+ Ext.util.Format.number(docs[0].get('readability'),'0.000')
				});
			}
		})
		
    	
    	main.add({
    		cls: 'section',
			items: [{
				html: this.localize("mostFrequentWords"),
				cls: 'header'
			},{
				cls: 'contents',
				html: '<ul><li></li></ul>'
			}],
    		listeners: {
    			afterrender: function(container) {
    				container.mask(me.localize("loading"));
    				me.getCorpus().getCorpusTerms().load({
    					params: {
    						limit: me.getApiParam('limit'),
    						stopList: me.getApiParam('stopList'),
    						forTool: 'summary'
    					},
    					callback: function(records, operation, success) {
    						if (success && records && records.length>0) {
    							container.unmask();
								var contentsEl = container.down('panel[cls~=contents]').getTargetEl().selectNode('li');
    							Ext.dom.Helper.append(contentsEl,
			   	        			 new Ext.XTemplate('<tpl for="." between="; "><a href="#" onclick="return false" class="corpus-type keyword" voyant:recordId="{id}">{term}</a><span style="font-size: smaller"> ({val})</span></tpl>')
			   	        		 		.apply(records.map(function(term) {
			   	        		 			return {
				   	        		 			id: term.getId(),
				   	        		 			term: term.getTerm(),
				   	        		 			val: term.getRawFreq()
			   	        		 			}
		   	        		 		}))
		   	        		 	)
    						}
    					}
    				})
    			}
    		}
    	})
    	
    	if (docs.length>1) {
        	main.add({
        		cls: 'section',
				items: [{
					html: this.localize("distinctiveWords"),
					cls: 'header'
				},{
					cls: 'contents',
					html: '<ol></ol>'
				}],
        		itemId: 'distinctiveWords',
        		listeners: {
        			afterrender: function(container) {
        				me.showMoreDistinctiveWords();
        			}
        		},
        		scope: this
        	})
    	}
    	
    },

	showSparklineSection: function(docDataFunc, headerText, topText, bottomText, docs, limit, docsLengthTpl, sparkWidth, valueTip) {
		var me = this;
		return {
			cls: 'section',
			items: [{
				layout: 'hbox',
				align: 'bottom',
				items: [{
					html: headerText,
					cls: 'header'
				}, {
					xtype: 'sparklineline',
					values: this.getCorpus().getDocuments().getRange().map(function(doc) {return docDataFunc.call(me, doc)}),
					tipTpl: new Ext.XTemplate('{[this.getDocumentTitle(values.x,values.y)]}', {
						getDocumentTitle: function(docIndex, len) {
							return '('+len+') '+this.panel.getCorpus().getDocument(docIndex).getTitle()
						},
						panel: me 
					}),
					height: 16,
					width: sparkWidth
				}]
			},{
				cls: 'contents',
				html: '<ul><li>'+topText+" "+docsLengthTpl.apply(docs.slice(0, docs.length>limit ? limit : parseInt(docs.length/2)).map(function(doc) {return {
					id: doc.getId(),
					shortTitle: doc.getShortTitle(),
					title: doc.getTitle(),
					val: docDataFunc.call(me, doc),
					valTip: valueTip
				}}))+'</li>'+
					'<li>'+bottomText+" "+docsLengthTpl.apply(docs.slice(-(docs.length>limit ? limit : parseInt(docs.length/2))).reverse().map(function(doc) {return {
						id: doc.getId(),
						shortTitle: doc.getShortTitle(),
						title: doc.getTitle(),
						val: docDataFunc.call(me, doc),
						valTip: valueTip
					}}))+'</li>'
			}]
		}
	},
     
    showMoreDistinctiveWords: function() {
    	var distinctiveWordsContainer = this.queryById('distinctiveWords');
    	var list = distinctiveWordsContainer.getTargetEl().selectNode("ol");
    	var count = Ext.dom.Query.select("li:not(.more)", list).length;
    	var numberOfDocumentsForDistinctiveWords = parseInt(this.getApiParam('numberOfDocumentsForDistinctiveWords'));
    	var range = this.getCorpus().getDocuments().getRange(count, count+numberOfDocumentsForDistinctiveWords-1);
    	if (range && Ext.isArray(range)) {
    		var docIndex = [];
    		range.forEach(function(doc) {
    			docIndex.push(doc.getIndex())
    		})
    		if (docIndex.length>0) {
    			this.getCorpus().getDocumentTerms().load({
    				addRecords: true,
    				params: {
    					docIndex: docIndex,
    					perDocLimit: parseInt(this.getApiParam("limit")),
    					limit: numberOfDocumentsForDistinctiveWords*parseInt(this.getApiParam("limit")),
						stopList: this.getApiParam('stopList'),
    					sort: 'TFIDF',
    					dir: 'DESC',
    					forTool: 'summary'
    				},
    				scope: this,
    				callback: function(records, operation, success) {
    					var docs = {};
    					if (success && records && Ext.isArray(records)) { // TODO: why wouldn't we have records here?
    						records.forEach(function(r, index, array) {
    							var i = r.getDocIndex();
    							if (!(i in docs)) {docs[i]=[]};
    							docs[i].push({
    								id: r.getId(),
    								docIndex: r.getDocIndex(),
    								type: r.getTerm(),
    								val: Ext.util.Format.number(r.get('rawFreq'),'0,000'),
    								docId: r.get('docId')
    							});

    						});
    						var len;
    						docIndex.forEach(function(index) {
    							if (docs[index]) {
        							var doc = this.getCorpus().getDocument(index);
        							len = docs[index].length; // declare for template
        		    				Ext.dom.Helper.append(list, {tag: 'li', 'voyant:index': String(index), html: 
        		    					'<a href="#" onclick="return false" class="document-id document-id-distinctive" voyant:val="'+doc.get('id')+'">'+doc.getShortTitle()+'</a>'+
        		    					this.localize('colon')+ " "+new Ext.XTemplate(this.localize('documentType')).apply({types: docs[index]})+'.'
        		    				});
    							}
    						}, this);
    						distinctiveWordsContainer.updateLayout()
    						len = numberOfDocumentsForDistinctiveWords;
    						remaining = this.getCorpus().getDocuments().getTotalCount() - count - docIndex.length;
    						if (remaining>0) {
        	    				var tpl = new Ext.Template(this.localize('moreDistinctiveWords'));
        						var more = Ext.dom.Helper.append(list, {tag: 'li', cls: 'more', html: tpl.apply([len>remaining ? remaining : len,remaining])}, true);
        						more.on("click", function() {
        							more.remove();
        							this.showMoreDistinctiveWords();
        						}, this)
    						}
    					}
    				}
    			});
    		}
    	}
    },

	// override because the doc sparklines are mostly useless as exports
	getExportVisualization: function() {
		return false;
	},

	getExtraDataExportItems: function() {
		return [{
			name: 'export',
			inputValue: 'dataAsTsv',
			boxLabel: this.localize('exportGridCurrentTsv')
		}];
	},

	exportDataAsTsv: function(panel, form) {
		var value = '';
		var sections = panel.query('panel[cls~=section]');
		sections.forEach(function(sp) {
			var sectionData = '';
			var header = sp.down('panel[cls~=header]');
			var contents = sp.down('panel[cls~=contents]');
			if (header) {
				sectionData += header.getEl().dom.textContent + "\n";
				if (contents) {
					contents.getEl().select('li').elements.forEach(function(li) {
						sectionData += li.textContent.replace(/:/, ":\t").replace(/\)[,;]/g, ")\t") + "\n";
					});
				}
			} else {
				sectionData = sp.getEl().dom.textContent + "\n";
			}
			value += sectionData + "\n";
		});
		Ext.Msg.show({
			title: panel.localize('exportDataTitle'),
			message: panel.localize('exportDataTsvMessage'),
			buttons: Ext.Msg.OK,
			icon: Ext.Msg.INFO,
			prompt: true,
			multiline: true,
			value: value
		});
	}
});
