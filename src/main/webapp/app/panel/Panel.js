/**
 * The base class for Voyant tool panels.
 * 
 * @class Panel
 */
Ext.define('Voyant.panel.Panel', {
	mixins: ['Voyant.util.Localization','Voyant.util.Api','Voyant.util.Toolable','Voyant.util.DetailedError'],
	requires: ['Voyant.widget.QuerySearchField','Voyant.widget.StopListOption','Voyant.categories.CategoriesOption','Voyant.widget.TotalPropertyStatus'],
	alias: 'widget.voyantpanel',
	statics: {
		i18n: {
		},
		config: {
			corpusValidated: false
		},
		// typedefs for commonly used API params
		/**
		 * @typedef {String} StopList A comma-separated list of words, a named list or a URL to a plain text list, one word per line.
		 * By default this is set to 'auto' which auto-detects the document's language and loads an appropriate list (if available for that language). Set this to blank to not use the default stopList.
		 * For more information see the <a href="#!/guide/stopwords">Stopwords documentation</a>.
		 */

		/**
		 * @typedef {String|String[]} Query A query or array of queries (queries can be separated by a comma).
		 * For query syntax, see the <a href="#!/guide/search">search documentation</a>.
		 */

		/**
		 * @typedef {String|String[]} DocId The document ID(s) to restrict the results to.
		 */

		/**
		 * @typedef {Number|Number[]} DocIndex The document index(es) to restrict the results to.
		 */

		/**
		 * @typedef {String} Categories The categories ID to use. For more information see the <a href="#!/guide/categories">Categories documentation</a>.
		 */

		/**
		 * @typedef {Number} Bins The number of "bins" to divide the result into.
		 */

		/**
		 * @typedef {Number} Start The index of the item to start the results at.
		 */

		/**
		 * @typedef {Number} Limit The number of items to limit the result to.
		 */

		/**
		 * @typedef {Number} Context The number of terms to consider on each side of the keyword.
		 */

		/**
		 * @typedef {String} WithDistributions Determines whether to show "raw" or "relative" frequencies (those are the two valid values).
		 * The default value is "relative" (unless there's only one document in the corpus, in which case raw frequencies are shown).
		 */

		/**
		 * @typedef {String} TermColors Which term colors to show in the grid.
		 * By default this is set to 'categories' which shows the term color only if it's been assigned by a category.
		 * The other alternatives are 'terms' which shows all terms colors, and '' or undefined which shows no term colors.
		 */

		/**
		 * @typedef {String|String[]} Columns One or more column data indexes to display, separated by a comma.
		 * Use this to modify the default set of visible columns.
		 */

		/**
		 * @typedef {String} SortColumn The column to sort the results by
		 */

		/**
		 * @typedef {String} SortDir The direction in which to sort the results: 'asc' or 'desc'
		 */
		api: {
			/**
			 * @memberof Panel
			 * @property {String} corpus The ID of the corpus to use.
			 */
			corpus: undefined,

			/**
			 * @memberof Panel
			 * @property {String|String[]} input Use to directly provide input, instead of specifying a corpus. Can be: one or more URLs, one or more chunks of text.
			 */
			input: undefined,

			/**
			 * @memberof Panel
			 * @property {String} inputFormat The input format of the provided input (the default is auto-detect).
			 */
			inputFormat: undefined,
			
			/**
			 * @memberof Panel
			 * @property {String} subtitle Specify a subtitle to display in the tool's header.
			 */
			subtitle: undefined
		}
	},
	config: {
		corpus: undefined
	},
	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		this.mixins['Voyant.util.Toolable'].constructor.apply(this, arguments);
		if (!this.glyph) {
			this.glyph = Ext.ClassManager.getClass(this).glyph
		}
		
		this.on("afterrender", function() {
			if (this.getXType()!='facet' && this.getApiParam('subtitle') && this.getTitle()) {
				this.setTitle(this.getTitle()+" <i style='font-size: smaller;'>"+this.getApiParam('subtitle')+"</i>")
			}
			if (this.isXType("grid")) {
				this.on('boxready', function() {
					var columns = this.getApiParam('columns');
					if (columns !== undefined) {
						if (Array.isArray(columns) === false) {
							columns = columns.split(',');
						}
						if (columns.length > 0) {
							var anyMatch = false;
							this.getColumns().forEach(function(gcol) {
								var match = columns.indexOf(gcol.dataIndex) !== -1;
								anyMatch = match || anyMatch;
								gcol.setVisible(match);
							});
							if (!anyMatch) {
								this.getColumns().forEach(function(gcol) {
									gcol.setVisible(gcol.initialConfig.hidden !== undefined ? !gcol.initialConfig.hidden : true);
								});
							}
						}
					}
				}, this);
				
				this.getSelectionModel().on("selectionchange", function(store, records) {
//					console.warn(records, this.selectedRecordsToRemember)
//					this.selectedRecordsToRemember = records;
				}, this);
				this.getStore().on("beforeload", function() {
					this.selectedRecordsToRemember = this.getSelection();
				}, this)
				this.getStore().on("load", function(store, records) {
					if (Ext.Array.from(this.selectedRecordsToRemember).length>0) {
						// combine contents of store with contents of remembered items, filtering out duplicates
						var seen = {}
						var mergedRecords = Ext.Array.merge(this.selectedRecordsToRemember, records).filter(function(item) {
							if (!(item.getId() in seen)) {
								seen[item.getId()]=true;
								return true
							} else {
								return false;
							}
						});
						if (store.isBufferedStore) {
							if (store.currentPage==1) {
								store.data.addAll(mergedRecords);
								store.totalCount = mergedRecords.length;
								store.fireEvent('refresh', store);
							}
						} else {
							store.loadRecords(mergedRecords);
							this.getSelectionModel().select(this.selectedRecordsToRemember);
							store.fireEvent('refresh', store);
							this.selectedRecordsToRemember = [];
						}
					}
				}, this);
			}
		}, this);
		
		this.on({
			loadedCorpus: {
				fn: function(src, corpus) {
		    		// make sure API is updated if we had a corpus and it's changed, this should be registered first, so hopefully be fired before tools receive notification
		    		this.setApiParam("corpus", corpus.getAliasOrId());
					this.setCorpus(corpus);
				},
				priority: 999, // very high priority
				scope: this
			}
		});
	},
	
	getApplication: function() {
		return Voyant.application;
	},
	
	getBaseUrl: function() {
		return this.getApplication().getBaseUrl();
	},
	
	openUrl: function(url) {
		this.getApplication().openUrl.apply(this, arguments);
	},
	
	getTromboneUrl: function() {
		return this.getApplication().getTromboneUrl();
	},
	
	dispatchEvent: function() {
		var application = this.getApplication();
		application.dispatchEvent.apply(application, arguments);
	},
	
	showError: function(config, response) {
		if (Ext.isString(config)) {
			config = {
				message: config
			}
		}
		Ext.applyIf(config, {
			title: this.localize("error")+" ("+this.localize("title")+")"
		})
		this.getApplication().showError(config, response)
	},
	
	showResponseError: function(config, response) {
		this.getApplication().showResponseError(config, response)
	},
	
	toastError: function(config) {
		if (Ext.isString(config)) {
			config = {html: config}
		}
		Ext.applyIf(config, {
			glyph: 'xf071@FontAwesome',
			title: this.localize("error")
		})
		this.toast(config);
	},
	
	toastInfo: function(config) {
		if (Ext.isString(config)) {
			config = {html: config}
		}
		Ext.applyIf(config, {
			glyph: 'xf05a@FontAwesome',
			title: this.localize("info")
		})
		this.toast(config);
	},
	
	toast: function(config) {
		if (Ext.isString(config)) {
			config = {html: config}
		}
		Ext.applyIf(config, {
			 slideInDuration: 500,
			 shadow: true,
			 align: 'b',
			 anchor: this.getTargetEl()			
		})
		Ext.toast(config);
	},

	/**
	 * Checks to see if we have access to this corpus, first by checking the application's
	 * access setting for the corpus, then by checking the corpus setting.
	 * @private
	 */
	hasCorpusAccess: function(corpus) {
		var app = this.getApplication();
		var corpusAccess = app.getCorpusAccess();  // undefined: corpus is unprotected, ACCESS: user entered the access password, ADMIN: user entered there admin password, LIMITED: no password entered
		if (corpusAccess === 'ADMIN' || corpusAccess === 'ACCESS') return true;
		if (!corpus) {
			corpus = this.getCorpus();
			if (!corpus) {
				corpus = app.getCorpus();
			}
		}
		return corpus.getNoPasswordAccess() === 'NORMAL'; // NORMAL: corpus is unprotected, NONE: corpus cannot be accessed except by password, NONCONSUMPTIVE: limited access without password
	},
	
	/**
	 * Checks to see if the user can modify the corpus.
	 * @private
	 */
	hasModifyCorpusAccess: function(corpus) {
		var allowDownload = this.getApplication().getAllowDownload();
		if (!allowDownload) return false;

		var allowInput = this.getApplication().getAllowInput();
		if (!allowInput) return false;

		var corpusAccess = this.getApplication().getCorpusAccess();
		var noPasswordAccess = corpus.getNoPasswordAccess();
		
		var canModify = (corpusAccess === undefined && noPasswordAccess === 'NORMAL') || corpusAccess === 'ADMIN';
		
		return canModify;
	}
});