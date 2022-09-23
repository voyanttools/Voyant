/*
 * @class Corpus
 * Corpus is possibly the most important class since in most cases you'll first create/load a corpus and then
 * interact with data derived from the corpus. In the simplest scenario you can create/load a corpus with a
 * corpus ID, a text string, a URL, or an array of text strings or URLs (see the {@link #constructor} and 
 * {@link #input} config for a bit more information).
 * 
 * 	new Corpus("austen"); // load an existing corpus
 * 
 * 	new Corpus("Hello Voyant!"); // load a corpus with the specified text string
 * 
 * 	new Corpus("http://hermeneuti.ca/"); // load a corpus with a URL
 * 
 * It's important to understand that the constructor actually returns a promise for a corpus, since the corpus
 * data is loaded asynchronously. All documented methods below handle the promise properly.
 * 
 * 	new Corpus("Hello Voyant!").show(); // the show method is called when the promise is filled
 * 
 * You can also handle the promise yourself using {@link Ext.promise.Promise#then then}.
 * 
 * 	new Corpus("Hello Voyant!").then(function(corpus) {
 * 		corpus.show(); // essentially the same as above (but more work:)
 * 	});
 * 
 * There are many parameters that can be specified when creating a corpus:
 * 
 * - **sources**: {@link #corpus}, {@link #input}
 * - **formats**:
 * 	- **Text**: {@link #inputRemoveFrom}, {@link #inputRemoveFromAfter}, {@link #inputRemoveUntil}, {@link #inputRemoveUntilAfter}
 * 	- **XML**: {@link #xmlAuthorXpath}, {@link #xmlCollectionXpath}, {@link #xmlContentXpath}, {@link #xmlExtraMetadataXpath}, {@link #xmlKeywordXpath}, {@link #xmlPubPlaceXpath}, {@link #xmlPublisherXpath}, {@link #xmlTitleXpath}
 * 	- **Tables**: {@link #tableAuthor}, {@link #tableContent}, {@link #tableDocuments}, {@link #tableNoHeadersRow}, {@link #tableTitle}
 * - **other**: {@link #inputFormat}, {@link #subTitle}, {@link #title}, {@link #tokenization}
 */
Ext.define('Voyant.data.model.Corpus', {
	alternateClassName: ["Corpus"],
    mixins: ['Voyant.util.Transferable','Voyant.util.Localization'],
    transferable: ['loadCorpusTerms','loadTokens','getPlainText','getText','getWords','getString','getLemmasArray'],
//    transferable: ['getSize','getId','getDocument','getDocuments','getCorpusTerms','getDocumentsCount','getWordTokensCount','getWordTypesCount','getDocumentTerms'],
	requires: ['Voyant.util.ResponseError','Voyant.data.store.CorpusTerms','Voyant.data.store.Documents'/*,'Voyant.panel.Documents'*/],
    extend: 'Ext.data.Model',
    config: {
    	
    	/**
    	 * @cfg {String} corpus The ID of a previously created corpus.
    	 * 
    	 * A corpus ID can be used to try to retrieve a corpus that has been previously created.
    	 * Typically the corpus ID is used as a first string argument, with an optional second
    	 * argument for other parameters (especially those to recreate the corpus if needed).
    	 * 
    	 * 		new Corpus("goldbug");
    	 * 
    	 * 		new Corpus("goldbug", {
    	 *			// if corpus ID "goldbug" isn't found, use the input
    	 * 			input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
    	 * 			inputRemoveUntil: 'THE GOLD-BUG',
    	 * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
    	 * 		});
    	 */
    	
    	/**
    	 * @cfg {String/String[]} input Input sources for the corpus.
    	 * 
    	 * The input sources can be either normal text or URLs (starting with `http`).
    	 * 
    	 * Typically input sources are specified as a string or an array in the first argument, with an optional second argument for other parameters.
    	 * 
    	 * 		new Corpus("Hello Voyant!"); // one document with this string
    	 * 
    	 * 		new Corpus(["Hello Voyant!", "How are you?"]); // two documents with these strings
    	 * 
    	 * 		new Corpus("http://hermeneuti.ca/"); // one document from URL
    	 * 
    	 * 		new Corpus(["http://hermeneuti.ca/", "https://en.wikipedia.org/wiki/Voyant_Tools"]); // two documents from URLs
    	 * 
    	 * 		new Corpus("Hello Voyant!", "http://hermeneuti.ca/"]); // two documents, one from string and one from URL
    	 * 
    	 * 		new Corpus("https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt", {
    	 * 			inputRemoveUntil: 'THE GOLD-BUG',
    	 * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
    	 * 		});
    	 * 
    	 * 		// use a corpus ID but also specify an input source if the corpus can't be found
    	 * 		new Corpus("goldbug", {
    	 * 			input: "https://gist.githubusercontent.com/sgsinclair/84c9da05e9e142af30779cc91440e8c1/raw/goldbug.txt",
    	 * 			inputRemoveUntil: 'THE GOLD-BUG',
    	 * 			inputRemoveFrom: 'FOUR BEASTS IN ONE'
    	 * 		});
    	 */
    	
    	/**
    	 * @cfg {String} inputFormat The input format of the corpus (the default is to auto-detect).
    	 * 
    	 * The auto-detect format is usually reliable and inputFormat should only be used if the default
    	 * behaviour isn't desired. Most of the relevant values are used for XML documents:
    	 * 
    	 * - **DTOC**: Dynamic Table of Contexts XML format
    	 * - **HTML**: Hypertext Markup Language
    	 * - **RSS**: Really Simple Syndication XML format
    	 * - **TEI**: Text Encoding Initiative XML format
    	 * - **TEICORPUS**: Text Encoding Initiative Corpus XML format
    	 * - **TEXT**: plain text
    	 * - **XML**: treat the document as XML (sometimes overridding auto-detect of XML vocabularies like RSS and TEI)
    	 * 
    	 * Other formats include **PDF**, **MSWORD**, **XLSX**, **RTF**, **ODT**, and **ZIP** (but again, these rarely need to be specified).
    	 */
    	
    	/**
    	 * @cfg {String} tableDocuments Determine what is a document in a table (the entire table, by row, by column); only used for table-based documents.
    	 * 
    	 * Possible values are:
    	 * 
    	 * - **undefined or blank** (default): the entire table is one document
    	 * - **rows**: each row of the table is a separate document
    	 * - **columns**: each column of the table is a separate document
    	 * 
    	 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
    	 */
    	
    	/**
    	 * @cfg {String} tableContent Determine how to extract body content from the table; only used for table-based documents.
    	 * 
    	 * Columns are referred to by numbers, the first is column 1 (not 0).
    	 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
    	 * 
    	 * Some examples:
    	 * 
    	 * - **1**: use column 1
    	 * - **1,2**: use columns 1 and 2 separately
    	 * - **1+2,3**: combine columns 1 and two and use column 3 separately
    	 * 
    	 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
    	 */
    	
    	/**
    	 * @cfg {String} tableAuthor Determine how to extract the author from each document; only used for table-based documents.
    	 * 
    	 * Columns are referred to by numbers, the first is column 1 (not 0).
    	 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
    	 * 
    	 * Some examples:
    	 * 
    	 * - **1**: use column 1
    	 * - **1,2**: use columns 1 and 2 separately
    	 * - **1+2,3**: combine columns 1 and two and use column 3 separately
    	 * 
    	 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
    	 */
    	
    	/**
    	 * @cfg {String} tableTitle Determine how to extract the title from each document; only used for table-based documents.
    	 * 
    	 * Columns are referred to by numbers, the first is column 1 (not 0).
    	 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
    	 * 
    	 * Some examples:
    	 * 
    	 * - **1**: use column 1
    	 * - **1,2**: use columns 1 and 2 separately
    	 * - **1+2,3**: combine columns 1 and two and use column 3 separately
    	 * 
    	 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
    	 */
    	
    	/**
    	 * @cfg {String} tableContent Determine how to extract body content from the table; only used for table-based documents.
    	 * 
    	 * Columns are referred to by numbers, the first is column 1 (not 0).
    	 * You can specify separate columns by using a comma or you can combined the contents of columns/cells by using a plus sign.
    	 * 
    	 * Some examples:
    	 * 
    	 * - **1**: use column 1
    	 * - **1,2**: use columns 1 and 2 separately
    	 * - **1+2,3**: combine columns 1 and two and use column 3 separately
    	 * 
    	 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
    	 */
    	
    	/**
    	 * @cfg {String} tableNoHeadersRow Determine if the table has a first row of headers; only used for table-based documents.
    	 * 
    	 * Provide a value of "true" if there is no header row, otherwise leave it blank or undefined (default).
    	 * 
    	 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tables).
    	 */
    	
    	/**
    	 * @cfg {String} tokenization The tokenization strategy to use
    	 * 
    	 * This should usually be undefined, unless specific behaviour is required. These are the valid values:
    	 * 
    	 * - **undefined or blank**: use the default tokenization (which uses Unicode rules for word segmentation)
    	 * - **wordBoundaries**: use any Unicode character word boundaries for tokenization
    	 * - **whitespace**: tokenize by whitespace only (punctuation and other characters will be kept with words)
    	 * 
    	 * See also [Creating a Corpus Tokenization](#!/guide/corpuscreator-section-tokenization).
    	 */
    	
    	/**
    	 * @cfg {String} xmlContentXpath The XPath expression that defines the location of document content (the body); only used for XML-based documents.
    	 * 
    	 * 		new Corpus("<doc><head>Hello world!</head><body>This is Voyant!</body></doc>", {
    	 * 			 xmlContentXpath: "//body"
    	 * 		}); // document would be: "This is Voyant!"
    	 * 
    	 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
    	 */
    	
    	/**
    	 * @cfg {String} xmlTitleXpath The XPath expression that defines the location of each document's title; only used for XML-based documents.
    	 * 
    	 * 		new Corpus("<doc><title>Hello world!</title><body>This is Voyant!</body></doc>", {
    	 * 			 xmlTitleXpath: "//title"
    	 * 		}); // title would be: "Hello world!"
    	 * 
    	 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
    	 */

    	/**
    	 * @cfg {String} xmlAuthorXpath The XPath expression that defines the location of each document's author; only used for XML-based documents.
    	 * 
    	 * 		new Corpus("<doc><author>Stéfan Sinclair</author><body>This is Voyant!</body></doc>", {
    	 * 			 xmlAuthorXpath: "//author"
    	 * 		}); // author would be: "Stéfan Sinclair"
    	 * 
    	 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
    	 */
    	
    	/**
    	 * @cfg {String} xmlPubPlaceXpath The XPath expression that defines the location of each document's publication place; only used for XML-based documents.
    	 * 
    	 * 		new Corpus("<doc><pubPlace>Montreal</pubPlace><body>This is Voyant!</body></doc>", {
    	 * 			 xmlPubPlaceXpath: "//pubPlace"
    	 * 		}); // publication place would be: "Montreal"
    	 * 
    	 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
    	 */

    	/**
    	 * @cfg {String} xmlPublisherXpath The XPath expression that defines the location of each document's publisher; only used for XML-based documents.
    	 * 
    	 * 		new Corpus("<doc><publisher>The Owl</publisher><body>This is Voyant!</body></doc>", {
    	 * 			 xmlPublisherXpath: "//publisher"
    	 * 		}); // publisher would be: "The Owl"
    	 * 
    	 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
    	 */

    	/**
    	 * @cfg {String} xmlKeywordXpath The XPath expression that defines the location of each document's keywords; only used for XML-based documents.
    	 * 
    	 * 		new Corpus("<doc><keyword>text analysis</keyword><body>This is Voyant!</body></doc>", {
    	 * 			 xmlKeywordXpath: "//keyword"
    	 * 		}); // publisher would be: "text analysis"
    	 * 
    	 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
    	 */
    	
    	/**
    	 * @cfg {String} xmlCollectionXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
    	 * 
    	 * 		new Corpus("<doc><collection>documentation</collection><body>This is Voyant!</body></doc>", {
    	 * 			 xmlCollectionXpath: "//collection"
    	 * 		}); // publisher would be: "documentation"
    	 * 
    	 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
    	 */
    	
    	/**
    	 * @cfg {String} xmlGroupByXpath The XPath expression that defines the location of each document's collection name; only used for XML-based documents.
    	 * 
    	 * 		new Corpus("<doc><sp s='Juliet'>Hello!</sp><sp s='Romeo'>Hi!</sp><sp s='Juliet'>Bye!</sp></doc>", {
    	 * 			 xmlDocumentsXPath: '//sp',
    	 *           xmlGroupByXpath: "//@s"
    	 * 		}); // two docs: "Hello! Bye!" (Juliet) and "Hi!" (Romeo)
    	 * 
    	 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
    	 */
    	
    	/**
    	 * @cfg {String} xmlExtraMetadataXpath A value that defines the location of other metadata; only used for XML-based documents.
    	 * 
    	 * 		new Corpus("<doc><tool>Voyant</tool><phase>1</phase><body>This is Voyant!</body></doc>", {
    	 * 			 xmlExtraMetadataXpath: "tool=//tool\nphase=//phase"
    	 * 		}); // tool would be "Voyant" and phase would be "1"
    	 * 
    	 * Note that `xmlExtraMetadataXpath` is a bit different from the other XPath expressions in that it's
    	 * possible to define multiple values (each on its own line) in the form of name=xpath.
    	 * 
    	 * See also [Creating a Corpus with XML](#!/guide/corpuscreator-section-xml).
    	 */
    	
    	/**
    	 * @cfg {String} xmlExtractorTemplate Pass the XML document through the XSL template located at the specified URL before extraction (this is ignored in XML-based documents).
    	 * 
    	 * This is an advanced parameter that allows you to define a URL of an XSL template that can
    	 * be called *before* text extraction (in other words, the other XML-based parameters apply
    	 * after this template has been processed).
    	 */

    	/**
    	 * @cfg {String} inputRemoveUntil Omit text up until the start of the matching regular expression (this is ignored in XML-based documents).
    	 * 
    	 * 		new Corpus("Hello world! This is Voyant!", {
    	 * 			 inputRemoveUntil: "This"
    	 * 		}); // document would be: "This is Voyant!"
    	 * 
    	 * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
    	 */
    	
    	/**
    	 * @cfg {String} inputRemoveUntilAfter Omit text up until the end of the matching regular expression (this is ignored in XML-based documents).
    	 * 
    	 * 		new Corpus("Hello world! This is Voyant!", {
    	 * 			 inputRemoveUntilAfter: "world!"
    	 * 		}); // document would be: "This is Voyant!"
    	 * 
    	 * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
    	 */
    	
    	/**
    	 * @cfg {String} inputRemoveFrom Omit text from the start of the matching regular expression (this is ignored in XML-based documents).
    	 * 
    	 * 		new Corpus("Hello world! This is Voyant!", {
    	 * 			 inputRemoveFrom: "This"
    	 * 		}); // document would be: "Hello world!"
    	 * 
    	 * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
    	 */
    	
    	/**
    	 * @cfg {String} inputRemoveFromAfter Omit text from the end of the matching regular expression (this is ignored in XML-based documents).
    	 * 
    	 * 		new Corpus("Hello world! This is Voyant!", {
    	 * 			 inputRemoveFromAfter: "world!"
    	 * 		}); // document would be: "Hello world!"
    	 * 
    	 * See also [Creating a Corpus with Text](#!/guide/corpuscreator-section-text).
    	 */
    	
    	/**
    	 * @cfg {String} subTitle A sub-title for the corpus.
    	 * 
    	 * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a subtitle for later use.
    	 */
    	
    	/**
    	 * @cfg {String} title A title for the corpus.
    	 * 
    	 * This is currently not used, except in the Dynamic Table of Contexts skin. Still, it may be worth specifying a title for later use.
    	 */
    	 
    	 /**
    	 * @cfg {String} curatorTsv a simple TSV of paths and labels for the DToC interface
    	 *
    	 * The DToC skin allows curation of XML tags and attributes in order to constrain the entries shown in the interface or to provide friendlier labels. This assumes plain text unicode input with one definition per line where the simple XPath expression is separated by a tab from a label.
    	 *
    	 *   	 p    	 paragraph
    	 *   	 ref[@target*="religion"]    	 religion
    	 *
    	  * For more information see the DToC documentation on [Curating Tags](http://cwrc.ca/Documentation/public/index.html#DITA_Files-Various_Applications/DToC/CuratingTags.html)
    	 */
    	 
    	
    	
    	documentsStore: undefined
    },
    statics: {
    	i18n: {}
    },
    fields: [
         {name: 'documentsCount', type: 'int'},
         {name: 'lexicalTokensCount', type: 'int'},
         {name: 'lexicalTypesCount', type: 'int'},
         {name: 'createdTime', type: 'int'},
         {name: 'createdDate', type: 'date', dateFormat: 'c'},
         {name: 'title', type: 'string'},
         {name: 'subTitle', type: 'string'},
         {name: 'languagueCodes', type: 'string'}
    ],
    
	/**
     * Create a promise for a new Corpus with relevant data loaded.
     * 
     * The typical usage in Spyral is to call {@link #assign} in a first code block:
     * 
     * 		new Corpus("Hello Voyant!").assign("corpus");
     * 
     * Then use the named variable in a subsequent code block:
     * 
     * 	  corpus.show();
     * 
     * Alternatively, the returned promise can be chained with {@link Ext.promise.Promise#then then}
     * and a function argument that receives the Corpus as an argument.
     * 
     * 	var corpus;
     * 	new Corpus("Hello Voyant!").then(function(data) {
     * 		corpus = data;
     * 		corpus.show();
     * 	});
     * 
     * The following scenarios are possible for the config argument:
     * 
     * - a string that looks like a corpus ID (not a URL and no spaces): treated as a {@link #corpus} config
     * - a string that doesn't look like a corpus ID: treated as an {@link #input} config
     * - an array of strings: treated as an array of {@link #input} config values
     * - an object: treated a normal config object
     * 
     * As such, these two constructions do the same thing:
     * 
     * 	new Corpus("Hello World!");
     * 	new Corpus({input: "Hello World!"});
	 * @param  {String|String[]|Object} source The source document(s) as a text string, a URL, an array of text strings and URLs, or a config object.
     * @param {String|String[]|Object} [config] An additional config to use with the source.
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return a Corpus but a promise to return a Corpus when it's finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * Corpus as an argument, as per the example above).
	 */
	constructor : function(source, config) {
		source = source || {};
		config = config || {};
				
		this.callParent([]); // only send config, not source
		
		var dfd = new Ext.Deferred();
		
		if (Ext.isString(source)) { // a string could be a corpus ID or an input string (text or URL)
			if (/\s/.test(source)==false && source.indexOf(":")==-1) { // looks like a corpus ID
				Ext.apply(config, {
					corpus: source
				});
			} else { // looks like input (text or URL)
				Ext.apply(config, {
					input: source
				});
			}
		} else if (Ext.isArray(source)) { // assume we have an array of texts or URLs
			Ext.apply(config, {
				input: source
			});
		} else if (Ext.isObject(source)) { // copy the source to the config
			Ext.apply(config, source);
		} else {
			Voyant.application.showError(this.localize("badDataTypeCorpus")+": ("+ (typeof source)+") "+source);
			Ext.defer(function() {
				dfd.reject(this.localize("badDataTypeCorpus")+": ("+ (typeof source)+") "+source)
			}, 50, this);
			return dfd.promise;
		}
		
		if (Ext.isObject(config)) {
			
			if (!config.corpus && !config.input && !config.inlineData) {
				Voyant.application.showError(this.localize("noCorpusOrInput")+": "+config);
				Ext.defer(function() {
					dfd.reject(this.localize("noCorpusOrInput")+": "+config)
				}, 50, this);
				return dfd.promise;
			}
			
			Ext.apply(config, {tool: 'corpus.CorpusMetadata'})

			var me = this;
			var promise = Ext.Ajax.request({
				url: Voyant.application.getTromboneUrl(),
				params: config
			}).then(function(response) {
				me.set(Ext.JSON.decode(response.responseText).corpus.metadata);
				// removed calls to set title and subtitle which should now be in metadata
				if (config.title || config.subTitle) {
					me.set('title', config.title);
					me.set('subTitle', config.subTitle);
				} else {
					// (removed calls for title and subtitle which should now be part of metadata
				}
				
				return me;
			}, function(response){
				Voyant.application.showResponseError(me.localize('failedCreateCorpus'), response);
				dfd.reject(me.localize('failedCreateCorpus'));
			}).then(function(corpus) {
				if (corpus.getDocumentsCount()==0) {
					Voyant.application.showError(me.localize("thisCorpus")+" "+me.localize("isEmpty")+".");
				}
				if (!('docsLimit' in config) || (config.docsLimit!==false && config.docsLimit>0)) {
					me.getDocuments().load({
						params: {
							limit: ('docsLimit' in config) ? config.docsLimit : me.getDocumentsCount()
						},
						callback: function(records, operation, success) {
							if (success) {
								me.setDocumentsStore(this);
								dfd.resolve(corpus)
							} else {
								dfd.reject(operation)
							}
						}
					})
				} else {
					dfd.resolve(corpus)
				}
			})
			return dfd.promise
		} else {
			Voyant.application.showError(this.localize("badDataTypeCorpus")+": ("+ (typeof config)+") "+config);
			Ext.defer(function() {
				dfd.reject(this.localize("badDataTypeCorpus")+": ("+ (typeof config)+") "+config)
			}, 50, this);
			return dfd.promise;
		}
	},
	
	getId: function() {
		// overrides the getId() function from the model to handle promises
    	return this.get('id');		
	},
	
	
	getAliasOrId: function() {
		// overrides the getId() function from the model to handle promises
    	return (this.get('alias') || this.get('id'));		
	},
	
	/**
     * Create a promise for {@link Voyant.data.store.CorpusTerms Corpus Terms}.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the {@link Voyant.data.store.CorpusTerms Corpus Terms} as an argument.
     * 
     * 	new Corpus("Hello Voyant!").loadCorpusTerms().then(function(corpusTerms) {
     * 		corpusTerms.show();
     * 	});
     * 
     * @param {Number/Object} config
     * 
     * - when this is a number, it's the maximum number of corpus terms to load (see {@link Voyant.data.store.CorpusTerms#limit})
     * - otherwise this is a regular config object
     * 
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return corpus terms but a promise to return a corpus terms when they're finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * corpus terms as an argument, as per the example above).
	 */
	loadCorpusTerms: function(config) {
		var dfd = new Ext.Deferred();
		config = config || {};
		if (Ext.isNumber(config)) {
			config = {limit: config};
		}
		Ext.applyIf(config, {
			limit: 0
		})
		var corpusTerms = this.getCorpusTerms();
		corpusTerms.load({
			params: config,
			callback: function(records, operation, success) {
				if (success) {
					dfd.resolve(corpusTerms)
				} else {
					dfd.reject(operation)
				}
			}
		})
		return dfd.promise
	},
	
	/**
     * Create a promise for {@link Voyant.data.store.Tokens Tokens}.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the {@link Voyant.data.store.Tokens Tokens} as an argument.
     * 
     * 	new Corpus("Hello Voyant!").loadTokens().then(function(tokens) {
     * 		tokens.show();
     * 	});
     * 
     * @param {Number/Object} config
     * 
     * - when this is a number, it's the maximum number of corpus terms to load (see {@link Voyant.data.store.CorpusTerms#limit})
     * - otherwise this is a regular config object
     * 	- **limit**: the maximum number of tokens to return (default is no limit)
     * 	- **perDocLimit**: the maximum number of tokens to return per document
     * 	- **start**: where to start (when pageing, default is 0)
     * 	- **noOthers**: determine if only word tokens are returned (default is false)
     * 	- **withPosLemmas**: try to populate pos (part-of-speech) tags and lemmas (only works in English for now)
     * 	- **docIndex**: a comma-separated list of integers of document indices
     * 	- **docId**: a comma-separated list of document IDs
     * 	- **stopList**: the ID of an existing stopList resource or an array of words to skip
     * 	- **whitelist**: the ID of an existing whitelist resource or an array of words to keep
     * 
     * 
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return tokens but a promise to return tokens when they're finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * tokens as an argument, as per the example above).
	 */
	loadTokens: function(config) {
		var dfd = new Ext.Deferred();
		config = config || {};
		if (Ext.isNumber(config)) {
			config = {limit: config};
		}
		Ext.applyIf(config, {
			limit: 0
		})
		var tokens = this.getTokens();
		tokens.load({
			params: config,
			callback: function(records, operation, success) {
				if (success) {
					dfd.resolve(tokens)
				} else {
					dfd.reject(operation)
				}
			}
		})
		return dfd.promise
	},
	
	getCorpusTerms: function(config) {
		return Ext.create("Voyant.data.store.CorpusTerms", Ext.apply(config || {}, {corpus: this}));
	},
	
	getTokens: function(config) {
		return Ext.create("Voyant.data.store.Tokens", Ext.apply(config || {}, {corpus: this}));
	},
	
	each: function(fn, scope) {
		this.getDocuments().each(function(doc, i) {
			fn.call(scope || doc, doc, i);
		})
	},
	
	map: function(fn, scope) {
		return this.getDocuments().getRange().map(function(doc, i) {
			return fn.call(scope || doc, doc, i)
		}, scope || this)
	},
	
	getCorpusCollocates: function(config) {
		return Ext.create("Voyant.data.store.CorpusCollocates", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocumentQueryMatches: function(config) {
		// not expected to be called before corpus is defined
		return Ext.create("Voyant.data.store.DocumentQueryMatches", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocumentTerms: function(config) {
		return Ext.create("Voyant.data.store.DocumentTerms", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocumentEntities: function(config) {
		return Ext.create("Voyant.data.store.DocumentEntities", Ext.apply(config || {}, {corpus: this}));
	},
	
	loadContexts: function(config) {
		var dfd = new Ext.Deferred();
		config = config || {};
		if (Ext.isNumber(config)) {
			config = {limit: config};
		}
		Ext.applyIf(config, {
			limit: 0
		})
		var contexts = this.getContexts();
		contexts.load({
			params: config,
			callback: function(records, operation, success) {
				if (success) {
					dfd.resolve(contexts)
				} else {
					dfd.reject(operation)
				}
			}
		})
		return dfd.promise
	},
	
	getContexts: function(config) {
		return Ext.create("Voyant.data.store.Contexts", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocuments: function(config) {
		return this.getDocumentsStore() ? this.getDocumentsStore() : Ext.create("Voyant.data.store.Documents", Ext.apply(config || {}, {corpus: this}));
	},
	
	getDocument: function(config) {
		if (this.getDocumentsStore()) {
			if (config instanceof Voyant.data.model.Document) {
				return config;
			}
			else if (Ext.isNumeric(config)) {
				return this.getDocumentsStore().getAt(parseInt(config))
			}
			else if (Ext.isString(config)) {
				return this.getDocumentsStore().getById(config)
			}
		}
		return this.getDocumentsStore().getDocument(config);
	},
	
	getDocumentsCount: function() {
		return this.get('documentsCount');
	},
	
	getWordTokensCount: function() {
    	return this.get('lexicalTokensCount');
	},
	
	getWordTypesCount: function() {
    	return this.get('lexicalTypesCount');
	},
	
	getCreatedTime: function() {
    	return this.get('createdTime');		
	},
	
	requiresPassword: function() {
		var noPasswordAccess = this.getNoPasswordAccess();
		return noPasswordAccess=='NONE' || noPasswordAccess=='NONCONSUMPTIVE';
	},
	
	getNoPasswordAccess: function() {
		// overrides the getId() function from the model to handle promises
    	return this.get('noPasswordAccess');		
	},
	
	getTitle: function() {
		return this.get('title');		
	},
	
	getSubTitle: function() {
		return this.get('subTitle');		
	},
	
	getRelatedWords : function(config) {
		return Ext.create("Voyant.data.store.RelatedTerms", Ext.apply(config || {}, {corpus: this}))
	},
	
	loadRelatedWords : function(config) {
		var dfd = new Ext.Deferred();
		config = config || {};
		if (Ext.isNumber(config)) {
			config = {limit: config};
		}
		Ext.applyIf(config, {
			limit: 0
		})
		var relatedTerms = this.getRelatedWords();
		relatedTerms.load({
			params: config,
			callback: function(records, operation, success) {
				if (success) {
					dfd.resolve(records)
				} else {
					dfd.reject(operation.error.response);
				}
			}
		})
		return dfd.promise
	},
		
	/**
     * Create a promise for a text representation of all the document bodies in the corpus.
     * 
     * This does NOT necessarily return the full original document, but rather the body or main
     * content, as extracted by Voyant. You can also request a {@link #plainText} version with
     * the tags stripped.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the text as an argument.
     * 
     * 	new Corpus("http://hermeneuti.ca").getText().then(function(text) {
     * 		show(text.replace(/</g, "&lt;")); // show the markup 
     * 	});
     * 
     * @param {Number/Object} config
     * 
     * - when this is a number, it's the maximum number of words to fetch (though there may be any number of other tokens, like punctuation and space (but no tags).
     * - otherwise this is a regular config object that can contain the following:
     * 	 - `limit`: a limit on the total number of words (by default there's no limit)
     * 	 - `perDocLimit`: a limit on the number of words to fetch for each document (by default there's no limit)
     * 	 - `start`: start at this word index for each document
     * 	 - `stopList`: the ID of an existing stopList resource or an array of words to skip
     * 	 - `whitelist`: the ID of an existing whitelist resource or an array of words to keep
     * 
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return text but a promise to return text when it's finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * text as an argument, as per the example above).
	 */
	getText: function(config) {
		var dfd = new Ext.Deferred();
		config = config || {};
		if (Ext.isNumber(config)) {
			config = {limit: config}
		} else if (Ext.isString(config)) {
			config = {limit: parseInt(config)}
		};
		Ext.applyIf(config, {
			limit: 0,
			outputFormat: "text",
			template: "docTokens2text"
		});
		Ext.apply(config, {
			tool: 'corpus.DocumentTokens',
			corpus: this.getAliasOrId()
		});
		Ext.Ajax.request({
			url: Voyant.application.getTromboneUrl(),
			params: config,
			success: function(response, opts) {
				var text = response.responseText.trim();
				if (config.transformCase) {
					if (config.transformCase.indexOf("lower")>-1) {
						text = text.toLowerCase();
					} else if (config.transformCase.indexOf("upper")>-1) {
						text = text.toUpperCase();
					}
				}
				dfd.resolve(text);
			},
			failure: function(response, opts) {
				dfd.reject(response);
			},
			scope: this
		})
		return dfd.promise
    },
    
	/**
     * Create a promise for a plain text representation of all the text in the corpus.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the text as an argument.
     * 
     * 	new Corpus("http://hermeneuti.ca").getPlainText().then(function(text) {
     * 		show(text.trim().replace(/\s+/g, " ").substr(-150)); // show the end 
     * 	});
     * 
     * @param {Number/Object} config
     * 
     * - when this is a number, it's the maximum number of words to fetch (though there may be any number of other tokens, like punctuation and space (but no tags).
     * - otherwise this is a regular config object – see {@link #getText} for more details.
     * 
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return text but a promise to return text when it's finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * text as an argument, as per the example above).
	 */
    getPlainText: function(config) {
		config = config || {};
		if (Ext.isNumber(config)) {
			config = {limit: config}
		} else if (Ext.isString(config)) {
			config = {limit: parseInt(config)}
		}
		Ext.apply(config, {
			template: "docTokens2plainText"
		});
		return this.getText(config);
    },

	/**
     * Create a promise for a string containing just the words from the corpus.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the text as an argument.
     * 
     * 	new Corpus("http://hermeneuti.ca").getWords().then(function(words) {
     * 		show(words); // show the words 
     * 	});
     * 
     * @param {Number/Object} config
     * 
     * - when this is a number, it's the maximum number of words to fetch (though there may be any number of other tokens, like punctuation and space (but no tags).
     * - otherwise this is a regular config object – see {@link #getText} for more details.
     * 
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return the words but a promise to return words when it's finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * words as a string argument, as per the example above).
	 */
    getWords: function(config) {
		config = config || {};
		if (Ext.isNumber(config)) {
			config = {limit: config}
		} else if (Ext.isString(config)) {
			config = {limit: parseInt(config)}
		};
		Ext.applyIf(config, {
			template: "docTokens2words"
		});
		return this.getText(config);
    },
	
	/**
     * Create a promise for a string containing just the words from the corpus.
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the text as an argument.
     * 
     * 	new Corpus("http://hermeneuti.ca").getWords().then(function(words) {
     * 		show(words); // show the words 
     * 	});
     * 
     * @param {Number/Object} config
     * 
     * - when this is a number, it's the maximum number of words to fetch (though there may be any number of other tokens, like punctuation and space (but no tags).
     * - otherwise this is a regular config object – see {@link #getText} for more details.
     * 
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return the words but a promise to return words when it's finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * words as a string argument, as per the example above).
	 */
    getWordsArray: function(config) {
		var dfd = new Ext.Deferred();
		this.getWords(config).then(function(text) {
			dfd.resolve(text.split(" "));
		})
		return dfd.promise
    },
    
	/**
     * Create a promise for an array of lemmas from the corpus (only works for English).
     * 
     * The typical usage is to chain the returned promise with {@link Ext.promise.Promise#then then} and
     * provide a function that receives the lemmas as an argument.
     * 
	 * 	new Corpus("Hello world, I like Spyral notebooks!", {language: "en"}).getLemmasArray().then(function(lemmas) {
			show(lemmas.join(", "))
	 *  });
     * 
     * @param {Number/Object} config
     * 
     * - when this is a number, it's the maximum number of words to fetch (though there may be any number of other tokens, like punctuation and space (but no tags).
     * - otherwise this is a regular config object – see {@link #getText} for more details.
     * 
	 * @returns {Ext.promise.Promise} *Important*: This doesn't immediately return the words but a promise to return words when it's finished loading
	 * (you should normally chain the promise with {@link Ext.promise.Promise#then then} and provide a function that receives the
	 * words as a string argument, as per the example above).
	 */
    getLemmasArray: function(config) {
    	config = config || {};
		var dfd = new Ext.Deferred();
		Ext.applyIf(config, {
			template: "docTokens2lemmas",
			withPosLemmas: true,
			noOthers: true
		})
		this.getWords(config).then(function(text) {
			var lemmas = text.split(" ").map(function(word) {return word.substring(0, word.indexOf("/"))})
			dfd.resolve(lemmas);
		})
		return dfd.promise
    },

	/**
	 * Get the readability index for the documents in this corpus.
	 * @param {String} indexType Which index to use: 'automated', 'coleman-liau', 'dale-chall', 'fog', 'lix', 'smog'
	 * @param {Object} config A config object to limit the results to certain documents, using docIndex or docId keys
	 * 
	 * @returns {Ext.promise.Promise}
	 */
	 getReadability: function(indexType, config) {
		indexType = indexType === undefined ? 'coleman-liau' : indexType;
		config = config || {};
		
		var tool = 'corpus.';
		switch (indexType) {
			case 'automated':
				tool += 'DocumentAutomatedReadabilityIndex';
				break;
			case 'coleman-liau':
				tool += 'DocumentColemanLiauIndex';
				break;
			case 'dale-chall':
				tool += 'DocumentDaleChallIndex';
				break;
			case 'fog':
				tool += 'DocumentFOGIndex';
				break;
			case 'lix':
				tool += 'DocumentLIXIndex';
				break;
			case 'smog':
				tool += 'DocumentSMOGIndex';
				break;
		}

		Ext.apply(config, {
			corpus: this.getId(),
			tool: tool
		});

		var dfd = new Ext.Deferred();

		var corpus = this.getId();
		Ext.Ajax.request({
			url: Voyant.application.getTromboneUrl(),
			params: config
		}).then(function(response) {
			var data = Ext.JSON.decode(response.responseText);
			// remove extraneous json data
			var parentKey;
			for (var key in data) {
				if (key.indexOf('document') === 0) {
					parentKey = key;
					break;
				}
			}
			if (parentKey) {
				var indexKey;
				for (var subkey in data[parentKey]) {
					indexKey = subkey;
					break;
				}
				var readabilityKey = indexKey.substring(0,indexKey.length-2); // assume the indexKey ends in Indexes, so remove the "es"
				var indexData = data[parentKey][indexKey].map(function(item) {
					return {
						docIndex: item.docIndex,
						docId: item.docId,
						text: item.text,
						readability: item[readabilityKey] // standardize the key for the readability score
					}
				})
				dfd.resolve(indexData);
			} else {
				dfd.reject();
			}
		}, function(response){
			dfd.reject();
		});

		return dfd.promise;
	},
    
    /**
	 * Returns a one-line summary of this corpus.
	 * 
	 * @method getString
	 * @param {boolean} [withID] Includes the corpus ID in parentheses at the end, if true.
	 */
    getString: function(withID) {
		var size = this.getDocumentsCount();
		var message = this.localize('thisCorpus');
		if (size==0) {message += ' '+this.localize('isEmpty')+'.';}
		else {
			message+=' ';
			if (size>1) {
				message+=new Ext.XTemplate(this.localize('hasNdocuments')).apply({count: Ext.util.Format.number(size,"0,000")});
			}
			else {
				message+=this.localize('has1document');
			}
			message+=' '+new Ext.XTemplate(this.localize('widthNwordsAndNTypes')).apply({words: Ext.util.Format.number(this.getWordTokensCount(),"0,000"), types: Ext.util.Format.number(this.getWordTypesCount(),"0,000")})+'.'
			message+=" "+this.localize('created')+" ";
			var createdDate = this.get('createdDate');
			var now = new Date();
			if (Ext.Array.each([
		    				['year', Ext.Date.YEAR],
		    				['month', Ext.Date.MONTH],
		    				['day', Ext.Date.DAY],
		    				['hour', Ext.Date.HOUR],
		    				['minute', Ext.Date.MINUTE],
		    				['second', Ext.Date.SECOND]
		    	], function(time) {
        			if (Ext.Date.diff(createdDate, now, time[1])>(time[0]=='second' ? 1 : 0)) {
        				var count = Ext.Date.diff(createdDate, now, time[1]);
        				message+="<span class='info-tip' data-qtip='"+Ext.Date.format(createdDate, "Y-m-d, H:i:s")+"'>";
        				if (count==1) {message+=new Ext.XTemplate(this.localize(time[0]+'Ago')).apply({count: count, date: createdDate})}
        				else {message+=new Ext.XTemplate(this.localize(time[0]+'sAgo')).apply({count: count, date: createdDate})}
        				message+="</span>";
        				return false
        			}
				}, this
			)===true) { // if array returns true, none of the conditions matched, so say now
				message+=this.localize('now');
			}
			message+='.';
			
			message+='';
		}
		if (withID===true) {message+=' ('+this.getId()+")";}
		return message;
    }
    
    

});