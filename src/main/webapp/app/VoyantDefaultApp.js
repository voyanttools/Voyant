Ext.define('Voyant.VoyantDefaultApp', {
	extend : 'Voyant.VoyantCorpusApp',
	mixins: ['Voyant.util.Api'],
	name : 'VoyantDefaultApp',
	constructor: function() {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
        this.callParent(arguments);
	},
	statics: {
		i18n: {
			serverMessage: ' '
		},
		api: {
			view: 'corpusset',
			stopList: 'auto',
			panels: undefined,
			rtl: undefined
		}
	},
	config: {
		showServerMessage: 'false'
	},
	
	listeners: {
    	loadedCorpus: function(src, corpus) {
    		this.viewport.down('voyantheader').collapse();
    		this.viewport.down('#toolsContainer').setActiveItem(1);
    		var corpusId = this.getCorpusId && this.getCorpusId() ? this.getCorpusId() : undefined;
    		if (window.history.pushState && !corpusId) {
    			// add the corpusId to the url
    			var corpusId = corpus.getAliasOrId();
        		var queryParams = Ext.Object.fromQueryString(document.location.search);
        		
    			var url = this.getBaseUrl()+'?corpus='+corpusId;
    			for (var key in queryParams) {
    				if (key !== 'corpus') {
    					var vals = Ext.isString(queryParams[key]) ? [queryParams[key]] : queryParams[key];
    					if (Ext.isArray(vals)) {
    						vals.forEach(function(val) {
    	    					url += '&'+key+'='+val;
    						})
    					}
    				}
    			}
    			window.history.pushState({
    				corpus: corpusId
    			}, 'Corpus: '+corpusId, url);
    		}
    	}
	},
	getViewComponent: function() {
		return this.viewport.down('#toolsContainer-main')
	},
	launch: function() {
		var queryParams = Ext.Object.fromQueryString(document.location.search) || {};
		var view = this.getApiParam('view', 'CorpusSet');
		var xtype = view.toLowerCase();
		if (!Ext.ClassManager.getByAlias("widget."+xtype) || queryParams.noskin) {
			Ext.Msg.show({
			    title: this.localize('noViewErrorTitle'),
			    message: new Ext.Template(this.localize(queryParams.noskin ? 'noViewKnownErrorTpl' : 'noViewErrorTpl')).apply({
			    	view: queryParams.noskin ? queryParams.noskin : view,
			    	additional: queryParams.noskin && queryParams.noskin == 'convert' ? this.localize(queryParams.noskin+'SkinMsg') : ''
			    }),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.ERROR
			});
			xtype = 'corpusset'; // switch to default view
		}

		this.viewport = Ext.create('Ext.container.Viewport', {
		    layout: 'border',
		    rtl: (this.getApiParam('rtl')!==undefined || Voyant.util.Localization.LANGUAGE=="ar" || Voyant.util.Localization.LANGUAGE=="he"),
		    items: [{
		    	xtype: 'voyantheader',
		    	region: 'north'
		    },{
		        region: 'south',
		        xtype: 'voyantfooter'
		    },{
		    	region: 'center',
		    	layout: 'card',
		    	itemId: 'toolsContainer',
				activeItem: 0,
				items: [{
					xtype : 'container',
					layout: {
						type: 'vbox',
						pack: 'center',
						align: 'center'
					},
					items: [{
						xtype: 'corpuscreator'
					},{
						xtype: 'container',
						width: 800,
						html: ""+
						"<div id='voyantIs' style='font-style: italic; text-align: center; margin-top: 10px;'>"+
							"<div>"+this.localize('voyantIs')+"</div>"+
							(this.localize('translatedBy').indexOf("English") == -1 ? "<div>"+this.localize('translatedBy')+"</div>" : "")+
							(this.getCorpusCreatorText && this.getCorpusCreatorText().trim().length>0 ?  "<div id='corpusCreatorText'>"+this.getCorpusCreatorText()+"</div>" : "")+
						"</div>"
					},{
						xtype: 'container',
						width: 800,
						html: ""+
						"<div id='voyantServerMessage' style='font-style: italic; text-align: center; margin-top: 10px;'></div>"
					}]	
				},{
					layout: 'fit',
					itemId: 'toolsContainer-main',
					items: {
						xtype: xtype
					}
				}]
		    }]
		});
		if (this.getShowServerMessage() === 'true') {
			this.getServerMessage();
		}
		var doShowStorageMsg = Ext.util.Cookies.get('storageMsg');
		if (doShowStorageMsg === null) {
			this.showStorageMsg();
		}
		this.callParent(arguments);
	},
	getServerMessage: function() {
		$.get('trombone', {
			fetchData: 'https://raw.githubusercontent.com/wiki/voyanttools/voyant/Announcements.md'
		}, function(data) {
			var converter = new showdown.Converter();
			var html = converter.makeHtml(data);
			var cleanHtml = DOMPurify.sanitize(html);
			$('#voyantServerMessage').html(cleanHtml);
		}, 'text')
		.fail(function() {
			console.log('failed to fetch server message')
		});
	},
	showStorageMsg: function() {
		var message = `<p>
		The current Voyant Server has been in operation for three years now and our cached data is overflowing and starting to cause serious problems. Because of this, we have reluctantly decided to remove all datasets that have not been used in over a year.
		</p><p>
		Anytime a user accesses a resource, the "last access date" of that resource is reset to the current date. In order to guarantee that your resource is not deleted we ask that everyone simply load their Voyant Visualization or link in any web browser and click a few buttons to change something. This will reset the "last access date" for that resource and prevent it from being marked for deletion.
		</p><p>
		Moving forward, we have plans to implement a more robust system for Voyant Consortium members to be able to distinguish between temporary and permanent resources. Explanations about this new system will be shared with Consortium members and as part of our newsletter. However, until that feature is finished, we have no choice but to rely on file access dates to identify which resources are being used and which are not. Users of Voyant are encouraged to sign up for a free membership in the Consortium. (The Consortium site is at <a href="https://voyant-tools.info" target="_blank">voyant-tools.info</a>)</p>`;
		var title = 'Attention!';
		Ext.toast({
			html: message,
			title: title,
			align: 'b',
			width: '100%',
			paddingY: 0,
			shadow: 'frame',
			autoClose: false,
			buttonAlign: 'center',
			buttons: [{
				text: 'I understand',
				handler: function(btn) {
					Ext.util.Cookies.set('storageMsg', 'true', Ext.Date.add(new Date(), Ext.Date.YEAR, 1));
					btn.up('window').close();
				}
			}]
		})
	}
});