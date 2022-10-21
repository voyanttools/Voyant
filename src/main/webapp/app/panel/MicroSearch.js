Ext.define('Voyant.panel.MicroSearch', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.microsearch',
    statics: {
    	i18n: {
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	},
		glyph: 'xf1ea@FontAwesome'
    },
    config: {
    	/**
    	 * @private
    	 */
    	options: [{xtype: 'stoplistoption'},{xtype: 'categoriesoption'}],
    	
    	/**
    	 * @private
    	 */
    	maxTokens: 0,
    	
    	/**
    	 * @private
    	 */
    	tokensPerSegment: 0,
    	
    	/**
    	 * @private
    	 */
    	maxVerticalLines: 0,
    	
    	/**
    	 * @private
    	 */
    	maxSegments: 0
    },
    constructor: function(config ) {

    	Ext.apply(this, {
    		title: this.localize('title'),
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
                	xtype: 'querysearchfield'
                }]
    		}]
    	});

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
        // create a listener for corpus loading (defined here, in case we need to load it next)
    	this.on('loadedCorpus', function(src, corpus) {
    		if (this.rendered) {
    			this.initialize();
    		}
    		else {
    			this.on("afterrender", function() {
    				this.initialize();
    			}, this)
    		}

    	});
    	
    	this.on('query', function(src, query) {
    		this.setApiParam('query', query);
    		this.updateSearchResults();
    	})
    	
    },
    
    initialize: function() {

    	var el = this.getTargetEl(), corpus = this.getCorpus();
    	
		var lineSize = 5; // pixels, including margins below and above
		this.setMaxVerticalLines(Math.floor((el.getHeight() - 10 /* margin of 5px */) / lineSize));
		
		// max segments
		var gutterSize = 10;
		var corpusSize = corpus.getDocumentsCount();
		var gutter = corpusSize * gutterSize;
		var columnSize = Math.floor((el.getWidth() - gutter - 10 /* margin of 5px */) / corpusSize);
		if (columnSize>200) {columnSize=200;}
		var segmentWidth = 3; // each segment is 3 pixels
		var maxSegmentsPerLine = Math.floor(columnSize / segmentWidth);
		if (maxSegmentsPerLine<1) {maxSegmentsPerLine=1;}
		
		// and the answer is...
		this.setMaxSegments(maxSegmentsPerLine * this.getMaxVerticalLines());
		
		var documentsStore = corpus.getDocuments();
		this.setMaxTokens(documentsStore.max('tokensCount-lexical'));

		this.setTokensPerSegment(this.getMaxTokens() < this.getMaxSegments() ? 1 : Math.ceil(this.getMaxTokens()/this.getMaxSegments()));
		

		var canvas = "<table cellpadding='0' cellspacing='0' style='height: 100%'><tr>";
		this.segments = [];
		documentsStore.each(function(document) {
			docIndex = document.getIndex();
			canvas+='<td style="overflow: hidden; vertical-align: top; width: '+columnSize+'px;">'+
				'<div class="docLabel" style="white-space: nowrap; width: '+columnSize+'px;" data-qtip="'+document.getFullLabel()+'">'+document.getFullLabel()+"</div>"+
				'<canvas style="display: block;" width="'+columnSize+'" height="'+el.getHeight()+'" id="'+this.body.id+'-'+docIndex+'">'+
				'</td>';
			if (docIndex+1<corpusSize) {canvas+='<td style="width: '+gutterSize+'px;">&nbsp;</td>';}
		}, this);
		canvas+='</tr></table>';
		el.update(canvas);
		
		this.updateSearchResults();
		
    	if (!this.getApiParam('query')) {
    		var me = this;
    		return this.getCorpus().loadCorpusTerms({limit: 1, stopList: this.getApiParam('stopList'), categories: this.getApiParam("categories")}).then(function(corpusTerms) {
    			var term = corpusTerms.getAt(0).getTerm();
    			var q = me.down('querysearchfield');
    			q.addValue(new Voyant.data.model.CorpusTerm({term: term}));
    			me.fireEvent("query", me, [term])
    		});
    	}

    },
    
    updateSearchResults: function() {
    	query = this.getApiParam('query');
    	
		// draw background
		this.getCorpus().getDocuments().each(function(document) {
			var distributions = this.redistributeDistributions(document, new Array(this.getMaxSegments()));
			this.drawDocumentDistributions(document, null, distributions);
		}, this);

    	if (Ext.Array.from(query).length > 0) {
    		this.mask(this.localize('loading'))
    		this.getCorpus().getDocumentTerms().load({
    			params: {
    				query: Ext.Array.from(query),
        			withDistributions: 'relative',
        			bins: this.getMaxSegments(),
        			categories: this.getApiParam('categories')
    			},
    			callback: function(records, operation, success) {
    				this.unmask();
    				var max = 0;
					var min = Number.MAX_VALUE;
					var docs = [];
    				records.forEach(function(record) {
    					var doc = this.getCorpus().getDocument(record.getDocIndex());
    					var distributions = this.redistributeDistributions(doc, record.getDistributions());
    					var m = Ext.Array.max(distributions);
    					if (m>max) {max=m;}
    					distributions.forEach(function(d) {
    						if (d && d<min) {
    							min = d;
    						}
    					})
						if (docs[record.getDocIndex()] === undefined) {
							docs[record.getDocIndex()] = {};
						}
						docs[record.getDocIndex()][record.getTerm()] = this.redistributeDistributions(doc, record.getDistributions());
    				}, this);
    				docs.forEach(function(termDistributions, i) {
						for (var term in termDistributions) {
							var distributions = termDistributions[term];
                    		this.drawDocumentDistributions(this.getCorpus().getDocument(i), term, distributions, min || Ext.Array.min(distributions), max || Ext.Array.max(distributions));
						}
    				}, this)
    			},
    			scope: this
    		})
    	}
    },
    
    redistributeDistributions: function(doc, distributions) {
		var segments = Math.ceil(doc.getLexicalTokensCount() / this.getTokensPerSegment());

		// redistribute if needed, we'll take the mean of the distribution values to maintain comparison across segments
    	if (distributions.length>segments) {
    		var newdistributions = [];
    		for (var i=0; i<distributions.length; i++) {
    			var a = parseInt(i*segments/distributions.length);
    			if (newdistributions[a]) {newdistributions[a].push(distributions[i])}
    			else {newdistributions[a]=[distributions[i]];}
    		}
			distributions = newdistributions
    		for (var i=0; i<distributions.length; i++) {
    			distributions[i] = Ext.Array.mean(distributions[i]);
    		}
    	}
    	return distributions;
    },
    
    drawDocumentDistributions: function(doc, term, distributions, min, max) {
    	var canvas = this.getTargetEl().dom.querySelector("#"+this.body.id+"-"+doc.getIndex());
    	var c = canvas.getContext('2d');
    	var x = 0, w = canvas.clientWidth, y = 0;
		
		var isBlank = term === null;
		var color = [230, 230, 230];
		if (!isBlank) {
			color = this.getApplication().getColorForTerm(term);
		}

    	for (var j=0; j<distributions.length;j++) {
			if (isBlank) {
				c.fillStyle = "rgb(230,230,230)";
				c.fillRect(x,y,3,3);
			} else if (distributions[j]) {
				var alpha = ((distributions[j]-min)*.7/(max-min))+.3;
				c.fillStyle = "rgba("+color[0]+","+color[1]+","+color[2]+","+alpha+")";
				c.fillRect(x,y,3,3);
			}
    		x+=3;
    		if (x>=w) {x=0; y+=5}
    	}
    	
    }
});