/**
 * TermsRadio is a visualization that depicts the change of the frequency of words in a corpus (or within a single document).
 *
 * @example
 *
 *   let config = {
 *    "bins": 5,
 *    "limit": null,
 *    "query": null,
 *    "slider": null,
 *    "speed": null,
 *    "stopList": null,
 *    "visibleBins": null,
 *    "yAxisScale": null
 *   };
 *
 *   loadCorpus("austen").tool("termsradio", config);
 *
 *
 * @class TermsRadio
 * @tutorial termsradio
 * @memberof Tools
 * @author Mark Turcato
 * @author Andrew MacDonald
 */
Ext.define('Voyant.panel.TermsRadio', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.termsradio',
	config: {
		/**
		 * @private
		 */
    	options: [{xtype: 'stoplistoption'},{xtype: 'categoriesoption'}],
		/**
		 * @private
		 */
		speed: 50,
		/**
		 * @private
		 */
		termsRadio: undefined
	},
    statics: {
    	i18n: {
    	},
    	api: {
    		/**
			 * @memberof Tools.TermsRadio
			 * @instance
			 * @property {bins}
			 * @default
    		 */
    		bins: 5,
    	
    		/**
			 * @memberof Tools.TermsRadio
			 * @instance
			 * @property {Number} visibleBins How many segments or documents to show at once (default is 5).
    		 * Note that this often works in parallel with the {@link #bins} value.
			 * @default
    		 */
    		visibleBins: 5,
    		
    		/**
			 * @memberof Tools.TermsRadio
    		 * @instance
    		 * @property {String[]} docIdType The document type(s) to restrict results to.
    		 * @default null
    		 * @private
    		 */
    		docIdType: null,
    		
    		/**
    		 * @memberof Tools.TermsRadio
			 * @instance
			 * @property {limit}
			 * @default
    		 */
    		limit: 50,
    	
    		/**
        	 * @instance
        	 * @property mode What mode to operate at, either document or corpus.
        	 * @choices document, corpus
    		 * @private
        	 */
    		mode: null,
    		
    		/**
			 * @memberof Tools.TermsRadio
        	 * @instance
        	 * @property {Number} position The current shifted position of the visualization.
        	 * @default 0
    		 * @private
        	 */
    		position: 0,
    		
    		/**
			 * @memberof Tools.TermsRadio
    		 * @instance
    		 * @property {String[]} selectedWords The words that have been selected.
    		 * @default null
    		 * @private
    		 */
    		selectedWords: [],
    		
			/**
			 * @memberof Tools.TermsRadio
			 * @instance
			 * @property {stopList}
			 * @default
			 */
    		stopList: 'auto',
    		
    		/**
    		 * @memberof Tools.TermsRadio
			 * @instance
			 * @property {query}
    		 */
    		query: null,
    		
    		/**
			 * @memberof Tools.TermsRadio
    		 * @instance
    		 * @property {String} yAxisScale The scale for the y axis. Options are: 'log' or 'linear'.
    		 * @default log
    		 */
    		yAxisScale: 'log',
    			
			/**
			 * @memberof Tools.TermsRadio
			 * @instance
			 * @property {Number} speed How fast to animate the visualization.
			 * @default
			 */
    		speed: 50,
    		
    		/**
			 * @memberof Tools.TermsRadio
    		 * @instance
    		 * @property {Boolean} slider Whether to show the slider.
    		 * @default true
    		 */
    		slider: undefined
    	},
    	glyph: 'xf201@FontAwesome'
    }
	
	/**
	 * @private
	 */
	,constructor: function(config) {
		
		var onLoadHandler = function(mode, store, records, success, operation) {
			this.setApiParams({mode: mode});

			this.getTermsRadio().loadRecords(records);
			
			var query = this.getApiParam('query');
			// check for no results
			if (query) {
				if (records.length==0 || (records.length==1 && records[0].getRawFreq()==0)) {
					this.toastInfo({
						html: this.localize("termNotFound"),
						align: 'bl'
					});
				} else {
					this.getTermsRadio().highlightQuery(query, true);
				}
			}
		};
		
		this.corpusStore = Ext.create("Voyant.data.store.CorpusTerms", {
			listeners : {
				load: {
					fn : onLoadHandler.bind(this, 'corpus'),
					scope : this
				}
			}
		});
		
		this.documentStore = Ext.create("Voyant.data.store.DocumentTerms", {
			listeners : {
				load: {
					fn : onLoadHandler.bind(this, 'document'),
					scope : this
				}
			}
		});
		
		Ext.apply(config, {
			title: this.localize('title'),
			legendMenu: Ext.create('Ext.menu.Menu', {
				items: [
        			{text: '', itemId: 'remove', glyph: 'xf068@FontAwesome'}
        		]
        	}),
			tbar: new Ext.Toolbar({
                overflowHandler: 'scroller',
				items: {
					xtype: 'legend',
					store: new Ext.data.JsonStore({
						fields : ['name', 'mark', 'selector']
					}),
					listeners: {
						itemclick: function(view, record, el, index) {
							var term = record.get('name');
							if (this.getTermsRadio().isTermSelected(term)) {
								this.getTermsRadio().doTermDeselect(term);
							} else {
								this.getTermsRadio().doTermSelect(term);
							}
						},
						itemcontextmenu: function(view, record, el, index, event) {
							event.preventDefault();
			            	var xy = event.getXY();
			            	
			            	var term = record.get('name');
			            	var text = (new Ext.Template(this.localize('removeTerm'))).apply([term]);
		            		this.legendMenu.queryById('remove').setText(text);
		            		
		            		this.legendMenu.on('click', function(menu, item) {
		            			if (item !== undefined) {
		            				this.getTermsRadio().doTermDeselect(term, true);
		            			}
		            		}, this, {single: true});
		            		this.legendMenu.showAt(xy);
						},
						scope: this
					}
				}
			}),
			bbar: {
                overflowHandler: 'scroller',
	            items: [{
	            	xtype: 'querysearchfield'
	            },{
	    			glyph: 'xf04b@FontAwesome', // start with play button, which means we're paused
	    			itemId: 'play',
	    			handler: function(btn) {
	    				var playing = btn.glyph=="xf04c@FontAwesome";
	    				if (playing) {
	    					this.getTermsRadio().continueTransition = false;
	    					this.mask(this.localize("completingTransition"))
	    					btn.setPlaying(false)
	    				}
	    				else {
	    					this.getTermsRadio().toggleRightCheck();
	    					btn.setPlaying(true);
	    				}
	    			},
	    			scope: this,
	    			setPlaying: function(bool) {
	    				this.setGlyph(bool ? "xf04c@FontAwesome" : "xf04b@FontAwesome")
	    			}
	    		},{
	    			glyph: 'xf0e2@FontAwesome',
//	    			text: this.localize('reset')
	    			tooltip : this.localize('resetTip'),
	    			listeners : {
	    				click : {fn : function() {
	    					this.queryById("play").setPlaying(false);
							this.getTermsRadio().shiftCount = 0;
							this.getTermsRadio().prepareData();
							this.getTermsRadio().redraw();
    					}				
	    					,scope : this
	    				}
	    			}
	    		},{
	    			xtype: 'label',
	    			forId: 'terms',
	    			text: this.localize('terms')
	    		},{
	    			xtype: 'slider',
	    			itemId: 'terms',
	    			hideLabel: true,
	    			width : 60,
	    			increment : 5,
	    			minValue : 5,
	    			maxValue : 100,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("limit")))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({limit: newvalue});
	            			this.loadStore();
	            		},
	            		scope: this
	            	}
	    		},{
	    			xtype: 'label',
	    			forId: 'speed',
	    			text: this.localize('speed')
	    		},{
	    			xtype: 'slider',
	    			itemId: 'speed',
	    			hideLabel: true,
	    			width : 60,
	    			increment : 5,
	    			minValue : 5,
	    			maxValue : 100,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("speed")))
	            			this.setSpeed(slider.getValue())
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({speed: newvalue});
	            			this.setSpeed(newvalue)
	            		},
	            		scope: this
	            	}
	    		},{
	    			xtype: 'label',
	    			itemId: 'visibleSegmentsLabel',
	    			forId: 'visibleBins',
	    			text: this.localize('visibleSegments')
	    		},{
	    			xtype: 'slider',
	    			itemId: 'visibleBins',
	    			hideLabel: true,
	    			width : 60,
	    			increment : 1,
	    			minValue : 1,
	    			maxValue : 100,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("visibleBins")))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({visibleBins: newvalue});
							this.numVisPoints = newvalue;
							this.loadStore();
							
							if (this.numVisPoints == this.getCorpus().getDocumentsCount()) {
								this.getTermsRadio().hideSlider();
							} else if (this.getApiParam("slider") != 'false'){
								this.getTermsRadio().showSlider();
							}
	            		},
	            		scope: this
	            	}
	    		},{
	    			xtype: 'label',
	    			itemId: 'segmentsLabel',
	    			forId: 'segments',
	    			text: this.localize('segments')
	    		},{
	    			xtype: 'slider',
	    			itemId: 'segments',
	    			hideLabel: true,
	    			width : 60,
	    			increment : 1,
	    			minValue : 1,
	    			maxValue : 100,
	            	listeners: {
	            		afterrender: function(slider) {
	            			slider.setValue(parseInt(this.getApiParam("bins")))
	            		},
	            		changecomplete: function(slider, newvalue) {
	            			this.setApiParams({bins: newvalue});
							this.numDataPoints = newvalue;
							this.loadStore();
							var visibleBins = this.queryById('visibleBins');
							visibleBins.setMaxValue(newvalue) // only relevant for doc mode
	            		},
	            		scope: this
	            	}
	    		}]
			}
		});
		
		// need to add option here so we have access to localize
		this.config.options.push({
			xtype: 'combo',
			queryMode : 'local',
			triggerAction : 'all',
			forceSelection : true,
			editable : false,
			fieldLabel : this.localize('yScale'),
			labelAlign : 'right',
			name : 'yAxisScale',
			valueField : 'value',
			displayField : 'name',
			store: new Ext.data.JsonStore({
				fields : ['name', 'value'],
				data   : [{
					name : this.localize('linear'),   value: 'linear'
				},{
					name : this.localize('log'),  value: 'log'
				}]
			}),
			listeners: {
				afterrender: function(combo) {
					combo.setValue(this.getApiParam('yAxisScale'));
				},
				scope: this
			}
		});
		
		this.callParent(arguments);
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
		
		this.on('boxready', function(component) {
			var sliderParam = this.getApiParam('slider');
			var showSlider = sliderParam === undefined ? true : sliderParam === 'true';
			var config = {
				parent: this,
				container: this.body,
				showSlider: showSlider
			};
			this.setTermsRadio(new TermsRadio(config));
		}, this);
		
		/**
		 * @event corpusTypesSelected
		 * @type listener
		 * @private
		 */
		this.addListener('corpusTermsClicked', function(src, terms){
			if (this.getCorpus().getDocumentsCount() > 1) {
        		terms.forEach(function(term) {
        			var t = term.getTerm();
        			this.setApiParams({query: t});
        			this.loadStore();
        		}, this);
			}
		});
		
		this.addListener('documentTermsClicked', function(src, terms){
			if(src && src.xtype==this.xtype) {return false;}
			
			terms.forEach(function(term) {
    			var t = term.getTerm();
    			this.setApiParams({query: t});
    			this.loadStore();
    		}, this);
		});
		
		this.on('query', function(src, query){
			this.fireEvent("termsClicked", src, query);
	    });
		
		this.on("termsClicked", function(src, terms) {
			// TODO load term distribution data
			terms.forEach(function(term) {
				var queryTerm;
    			if (Ext.isString(term)) {queryTerm = term;}
    			else if (term.term) {queryTerm = term.term;}
    			else if (term.getTerm) {queryTerm = term.getTerm();}
    			
    			// TODO handling for multiple terms
    			this.setApiParams({query: queryTerm});
    			this.loadStore();
    		}, this);
    	});
		
		this.on("loadedCorpus", function(src, corpus) {
    		this.documentStore.setCorpus(corpus);
    		this.corpusStore.setCorpus(corpus);
    		
    		var params = this.getApiParams();
			params.withDistributions = true;
			if (params.type) {
				delete params.limit;
			}
			var store;
			
			var docsCount = this.getCorpus().getDocumentsCount();
			var segments = this.queryById("segments");
			var visibleBins = this.queryById("visibleBins");
			if (params.mode=='document' || docsCount == 1) {
				this.setApiParam("mode", "document");
				store = this.documentStore;
				visibleBins.setMaxValue(segments.getValue())
			} else {
				this.setApiParam("mode", "corpus");
				delete params.bins;
				store = this.corpusStore;
				segments.hide();
				this.queryById("segmentsLabel").hide();
				var visibleBins = this.queryById("visibleBins");
				visibleBins.setMaxValue(docsCount);
				if (parseInt(this.getApiParam("visibleBins")>docsCount)) {
					visibleBins.setValue(docsCount);
				}
			}
			
			// select top 3 words
			store.on('load', function(store, records) {
				for (var i = 0; i < 3; i++) {
					var r = records[i];
					if (r) {
						this.getTermsRadio().highlightRecord(r, true);
					}
				}
			}, this, {single: true});
			store.load({params: params});
    	}, this);		
	}
	
    ,loadStore: function () {
    	this.queryById('play').setPlaying(false);
		var params = this.getApiParams();
		params.withDistributions = true;
		if(this.getApiParam('mode') === 'document') { 
			this.documentStore.load({params: params});
		}
		if(this.getApiParam('mode') === 'corpus') {
			delete params.bins;
			this.corpusStore.load({params: params});
		}
	}
    
});
