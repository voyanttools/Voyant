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
						align: 'middle'
					},
					items: [{
						xtype: 'container',
						width: 800,
						html: '<div id="voyantCorpusMessage" style="text-align: center; margin-top: -10px; margin-bottom: 10px;">Alert: We will be deleting unused corpora on August 15th. Check <a href="https://ggle.in/VoyantAlert" target="_blank">https://ggle.in/VoyantAlert</a> to learn more.</div>'
					},{
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
						html: "<div id='voyantServerMessage' style='font-style: italic; text-align: center; margin-top: 10px;'></div>"
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
		if (Ext.util.Cookies.get('storageMsg') === null) {
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
		var message = `<p><b style="font-weight: bold">Alert: Deleting Older Unused Corpora on Voyant Tools</b></p>
		<p>We will be deleting all corpora that haven't been used in over a year on <b style="font-weight: bold">August 15th</b>.</p>
		<p>Due to storage constraints on our server we have to delete unused corpora. If you don't want an older corpus deleted, load it in Voyant and click a few buttons to update its "last access date".<br/>For more information visit: <a href="https://ggle.in/VoyantAlert" target="_blank">https://ggle.in/VoyantAlert</a></p>
		<p><b style="font-weight: bold">Warning: the corpora that we delete will be unrecoverable!</b></p>`;
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