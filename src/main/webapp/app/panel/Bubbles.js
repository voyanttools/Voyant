// assuming Bubblelines library is loaded by containing page (via voyant.jsp)
/**
 * Bubbles is a playful visualization of term frequencies by document.
 *
 * @example
 *
 * let config = {
 * 	speed: 20,
 * };
 *
 * loadCorpus("austen").tool("bubbles", config);
 *
 * @class Bubbles
 * @tutorial bubbles
 * @memberof Tools
 */
Ext.define('Voyant.panel.Bubbles', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.bubbles',
    statics: {
    	i18n: {
    	},
    	api: {
    		/**
			 * @memberof Tools.Bubbles
    		 * @instance
    		 * @property {stopList}
			 * @default
    		 */
    		stopList: 'auto',
    		
			/**
			 * @memberof Tools.Bubbles
			 * @instance
			 * @property {docIndex}
			 */
    		docIndex: 0,
    		
			/**
			 * @memberof Tools.Bubbles
			 * @instance
			 * @property {limit}
			 * @default
			 */
    		limit: 100,
    		
			/**
			 * @memberof Tools.Bubbles
			 * @instance
			 * @property {Boolean} audio Whether or not to play audio
			 * @default
			 */
    		audio: false,
    		
			/**
			 * @memberof Tools.Bubbles
			 * @instance
			 * @property {Number} speed How fast to play the visualization
			 * @default
			 */
    		speed: 30
    			
    			
    	},
    	glyph: 'xf06e@FontAwesome'
	},
	config: {
    	options: {xtype: 'stoplistoption'},
    	audio: false
	},
	
	corpusLoaded: false,
	processingLoaded: false,
	bubblesAppCode: undefined,
	
	bubbles: undefined,
	oscillator: undefined,
	gainNode: undefined,
	
	
    constructor: function() {

    	this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);
    	Ext.apply(this, {
    		title: this.localize('title'),
			html: '<canvas style="width: 100%; height: 100%"></canvas>',
    		dockedItems: [{
                dock: 'bottom',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [{
	            	xtype: 'documentselectorbutton',
	            	singleSelect: true
	            },{
					xtype: 'slider',
					fieldLabel: this.localize('speed'),
					labelAlign: 'right',
					labelWidth: 40,
					width: 100,
					increment: 1,
					minValue: 1,
					maxValue: 60,
					value: 30,
					listeners: {
	                	render: function(cmp) {
	                		cmp.setValue(parseInt(this.getApiParam("speed")));
	                		if (this.bubbles) {this.bubbles.frameRate(cmp.getValue())}
	                		this.setAudio(cmp.getValue());
	    		        	Ext.tip.QuickTipManager.register({
	    		        		target: cmp.getEl(),
	   		                 	text: this.localize('speedTip')
	    		        	});
	                		
	                	},
	                	beforedestroy: function(cmp) {
	                		Ext.tip.QuickTipManager.unregister(cmp.getEl());
	                	},
	                    changecomplete: function(cmp, val) {
	                    	this.setApiParam('speed', val);
	                		if (this.bubbles) {this.bubbles.frameRate(val)}
	                    },
	                    scope: this
					}
				},{
	                xtype: 'checkbox',
	                boxLabel: this.localize('sound'),
	                listeners: {
	                	render: function(cmp) {
	                		cmp.setValue(this.getApiParam("audio")===true ||  this.getApiParam("audio")=="true");
	                		this.setAudio(cmp.getValue());
	    		        	Ext.tip.QuickTipManager.register({
	    		        		target: cmp.getEl(),
	   		                 	text: this.localize('soundTip')
	    		        	});
	                		
	                	},
	                	beforedestroy: function(cmp) {
	                		Ext.tip.QuickTipManager.unregister(cmp.getEl());
	                	},
	                    change: function(cmp, val) {
	                    	this.setApiParam('audio', val);
	                    	this.setAudio(val);
	                    },
	                    scope: this
	                }
	            },{xtype: 'tbfill'}, {
	    			xtype: 'tbtext',
	    			html: this.localize('adaptation') //https://www.m-i-b.com.ar/letters/en/
	    		}]
    		}]
    	});
        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
    	
		this.on('boxready', function() {
			this.loadBubbles();
		})

    	this.on('loadedCorpus', function(src, corpus) {
    		this.corpusLoaded = true;
			if (this.bubbles) {
				this.loadDocument();
			} else {
				this.loadBubbles();
			}
    	}, this);
    	
    	this.on("resize", function() {
    		if (this.bubbles) {
    			this.bubbles.size(this.body.getWidth(),this.body.getHeight());
    		}
    	});
    	
    	this.on("documentselected", function(src, doc) {
    		this.setApiParam('docIndex', this.getCorpus().getDocument(doc).getIndex());
    		this.loadDocument();
    	})
    },
    
    setAudio: function(val) {
    	if (this.gainNode) {this.gainNode.gain.value=val ? 1 : 0;}
    	this.callParent(arguments)
    },

    handleCurrentTerm: function(term) {
    	if (this.oscillator) {this.oscillator.frequency.value = this.terms[term] ? parseInt((this.terms[term]-this.minFreq) * 2000 / (this.maxFreq-this.minFreq)) : 0;}
    },
    
    handleDocFinished: function() {
    	if (this.gainNode) {this.gainNode.gain.value = 0;}
    	var index = parseInt(this.getApiParam('docIndex'));
    	if (index+1<this.getCorpus().getDocumentsCount()) {
    		this.setApiParam('docIndex', index+1);
    		this.loadDocument();
    	}
    },
    
    loadDocument: function() {
    	var me = this, doc = this.getCorpus().getDocument(parseInt(this.getApiParam('docIndex')));
    	// if we're not in a tab panel, set the document title as part of the header
    	if (!this.up("tabpanel")) {
        	this.setTitle(this.localize('title') + " <span class='subtitle'>"+doc.getFullLabel()+"</span>");
    	}

    	doc.loadDocumentTerms(Ext.apply(this.getApiParams(["stopList"]), {
			forTool: 'bubbles',
    		limit: 100
    	})).then(function(documentTerms) {
    		me.terms = {};
    		documentTerms.each(function(documentTerm) {
    			me.terms[documentTerm.getTerm()] = documentTerm.getRawFreq();
    		})
    		var values = Object.keys(me.terms).map(function(k){return me.terms[k]});
    		me.minFreq = Ext.Array.min(values);
    		me.maxFreq = Ext.Array.max(values);
    		me.getCorpus().loadTokens({whiteList: Object.keys(me.terms), noOthers: true, limit: 0, docIndex: me.getApiParam('docIndex')}).then(function(tokens) {
    			var words = [];
        		tokens.each(function(token) {
    				words.push(token.getTerm().toLowerCase());
        		})
        		me.bubbles.setLines([doc.getTitle(),words.join(" ")]);
        		me.bubbles.loop();
        		me.oscillator.frequency.value = 150;
        		me.gainNode.gain.value = me.getAudio() ? 1 : 0;
    		})
    	})
    },

	loadBubbles: function() {
		if (this.bubbles === undefined && this.processingLoaded && this.bubblesAppCode !== undefined && this.getTargetEl() !== undefined) {
			var canvas = this.getTargetEl().dom.querySelector('canvas');
			this.bubbles = new Processing(canvas, this.bubblesAppCode);
			this.bubbles.size(this.getTargetEl().getWidth(),this.getTargetEl().getHeight());
			this.bubbles.frameRate(this.getApiParam('speed'));
			this.bubbles.bindJavascript(this);
			this.bubbles.noLoop();
			
			this.bubblesAppCode = undefined;

			if (this.corpusLoaded) {
				this.loadDocument();
			}
		}
	},
    
    initComponent: function() {
    	// make sure to load script
		Ext.Loader.loadScript({
			url: this.getBaseUrl()+"resources/processingjs/processing.min.js",
			onLoad: function() {
				this.processingLoaded = true;
				this.loadBubbles();
			},
			scope: this
		});

		Ext.Ajax.request({
			url: this.getBaseUrl()+'resources/bubbles/bubbles.pjs',
			success: function(data) {
				this.bubblesAppCode = data.responseText;
				this.loadBubbles();
			},
			scope: this
		})
		
		var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		
		this.oscillator = audioCtx.createOscillator();
		this.gainNode = audioCtx.createGain();
		this.oscillator.connect(this.gainNode);
		this.gainNode.connect(audioCtx.destination);
		this.oscillator.frequency.value = 0;
		this.oscillator.start();
		this.gainNode.gain.value = 0;

    	this.callParent(arguments);
    }
});