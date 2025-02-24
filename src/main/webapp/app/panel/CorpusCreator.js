Ext.define('Voyant.panel.CorpusCreator', {
	extend: 'Ext.form.Panel',
	requires: ['Ext.form.field.File'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.corpuscreator',
	isConsumptive: true,
    statics: {
    	i18n: {
			corpusSortInitialOrder: 'initial order',
			dtocIndexDoc: 'DToC Index Document',
			textEncoding: 'Text Encoding',
			groupByColumn: 'Group By Column',
			groupByColumnText: 'Specify a column (or columns) by which to group documents. Only applicable when extracting documents from cells in each row.'
    	},
    	api: {
    		inputFormat: undefined,
    		language: undefined,
    		xmlDocumentsXpath: undefined,
    		xmlGroupByXpath: undefined,
    		xmlContentXpath: undefined,
    		xmlTitleXpath: undefined,
    		xmlAuthorXpath: undefined,
    		xmlPubDateXpath: undefined,
    		xmlPublisherXpath: undefined,
    		xmlPubPlaceXpath: undefined,
    		xmlKeywordXpath: undefined,
    		xmlCollectionXpath: undefined,
    		xmlExtraMetadataXpath: undefined,
    		htmlGroupByQuery: undefined,
    		htmlDocumentsQuery: undefined,
    		htmlContentQuery: undefined,
    		htmlTitleQuery: undefined,
    		htmlAuthorQuery: undefined,
    		htmlPubDateQuery: undefined,
    		htmlPublisherQuery: undefined,
    		htmlPubPlaceQuery: undefined,
    		htmlKeywordsQuery: undefined,
    		htmlCollectionQuery: undefined,
    		htmlExtraMetadataQuery: undefined,
    		//jsonGroupByPointer: undefined,
    		jsonDocumentsPointer: undefined,
    		jsonContentPointer: undefined,
    		jsonTitlePointer: undefined,
    		jsonAuthorPointer: undefined,
    		jsonPubDatePointer: undefined,
    		jsonPublisherPointer: undefined,
    		jsonPubPlacePointer: undefined,
    		jsonKeywordsPointer: undefined,
    		jsonCollectionPointer: undefined,
    		jsonExtraMetadataPointer: undefined,
			encoding: undefined,
    		tokenization: undefined,
    		adminPassword: undefined,
    		accessPassword: undefined,
    		noPasswordAccess: undefined,
    		tableDocuments: undefined,
			tableGroupBy: undefined,
    		tableContent: undefined,
    		tableTitle: undefined,
    		tableAuthor: undefined,
			tablePubDate: undefined,
			tablePublisher: undefined,
			tablePubPlace: undefined,
			tableKeywords: undefined,
			tableCollection: undefined,
			tableExtraMetadata: undefined,
    		title: undefined,
    		subTitle: undefined,
    		inputRemoveFrom: undefined,
    		inputRemoveFromAfter: undefined,
    		inputRemoveUntil: undefined,
    		inputRemoveUntilAfter: undefined,
    		sort: undefined,
			dtocIndexDoc: -1
    	}
    },
    
    constructor: function(config) {
        this.callParent(arguments);
        config = config || {};
        var me = this;
    	this.mixins['Voyant.panel.Panel'].constructor.call(this, 
			Ext.apply(config, {
				includeTools: {
					gear: true,
					help: true,
					language: this.getLanguageToolMenu()
				}
			})
    	);
    	
    },
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
    		title: this.localize('title'),
    		width: 800,
    		frame: true,
    		padding: 10,
    		style: {
    		    borderColor: '#aaa',
    		    borderStyle: 'solid'
    		},
    		frameHeader: true,
    		layout: {
    			type: 'vbox',
    			align: 'stretch'
    		},
	    	dockedItems: [{
	    		xtype: 'toolbar',
                overflowHandler: 'scroller',
                dock: 'bottom',
    	    	buttonAlign: 'right',
	    		items: [{
	    			text: me.localize('Open'),
                    glyph: 'xf115@FontAwesome', // not visible
	    			tooltip: me.localize('SelectExisting'),
	    			hidden: this.getCorpus()!=undefined,
	    			handler: function() {
	    				Ext.create('Ext.window.Window', {
	    				    title: me.localize('Open'),
	    				    layout: 'fit',
	    				    modal: true,
	    				    items: {
	    				        xtype: 'form',
	    				        submitEmptyText: false,
	    				        items: {
	    				        	xtype: 'corpusselector',
									margin: 10
	    				        },
	    				        buttons: [
	    				        	{
	    				        		text: me.localize('Open'),
	    			                    glyph: 'xf00c@FontAwesome',
	    				        		handler: function(btn) {
	    				        			var form = btn.up('form').getForm();
	    				        			var corpus = btn.up('form').getForm().getValues().corpus;
	    				        			if (corpus!='') {
	    				        				me.loadCorpus({corpus: corpus});
		    				        			btn.up('window').close();
	    				        			}
	    				        			else {
	    				    	        		Ext.Msg.show({
	    				    	        		    title: me.localize('SelectExisting'),
	    				    	        		    message: me.localize('PleaseSelectExisting'),
	    				    	        		    buttons: Ext.Msg.OK,
	    				    	        		    icon: Ext.Msg.ERROR
	    				    	        		});
	    				        			}
	    				        		},
	    				        		flex: 1
	    				            },{
	    				        		text: me.localize('cancel'),
	    			                    glyph: 'xf00d@FontAwesome',
	    				        		flex: 1,
	    				        		handler: function(btn) {
	    				        			btn.up('window').close();
	    				        		}
	    				        	}
	    				        ]
	    				    }
	    				}).show();
	    			}
	    		},{
    	        	xtype: 'fileuploadfield',
                    glyph: 'xf093@FontAwesome',
    	        	name: 'upload',
        	    	buttonOnly: true,
        	    	hideLabel: true,
		            ui: 'default-toolbar',
        	    	buttonText: me.localize('Upload'),
        	    	listeners: {
        	    		render: function(filefield) {
        	    			filefield.fileInputEl.dom.setAttribute('multiple', true);
        		        	Ext.tip.QuickTipManager.register({
       		                 target: filefield.getEl(),
       		                 text: me.localize('UploadLocal')
       		             	});
        	            },
        	            beforedestroy: function(cmp) {
	                		Ext.tip.QuickTipManager.unregister(cmp.getEl());
	                	},
        	            change: function(filefield, value) {
        	            	if (value) {
            	            	var form = filefield.up('form').getForm();
            	            	if (form.isValid()) {
            	            		var files = filefield.fileInputEl.dom.files;
            	            		var badFilesRe = /\.(png|gif|jpe?g|mp[234a]|mpeg|exe|wmv|avi|ppt|mpg|tif|wav|mov|psd|wma|ai|bmp|pps|aif|pub|dwg|indd|swf|asf|mbd|dmg|flv)$/i;
            	            		var goodFilesRe = /\.(txt|pdf|html?|xml|docx?|rtf|pages|epub|odt|zip|jar|tar|gz|ar|cpio|bzip2|bz2|gzip|csv|tsv|xlsx?)$/i;
            	            		var badFiles = [];
            	            		var unknownFiles = [];
            	            		for (var i = 0, len = files.length; i<len; i++) {
            	            			var filename = files[i].name;
            	            			if (badFilesRe.test(filename)) {
            	            				badFiles.push(filename.split("/").pop());
            	            			}
            	            			else if (!goodFilesRe.test(filename)) {
            	            				unknownFiles.push(filename.split("/").pop());
            	            			}
            	            		}
            	            		if (badFiles.length>0 || unknownFiles.length>0) {
            	            			var file = filefield;
            	            			Ext.Msg.show({
            	            				title: me.localize("fileTypesWarning"),
            	            				icon: Ext.MessageBox.ERROR,
            	            				message: me.localize('fileTypesMessage')+'<ul>' +
            	            					(badFiles.length > 0 ? ('<li>'+me.localize("badFiles") + badFiles.slice(0, 5).join(", ") + (badFiles.length>5 ? '…' : '') + '</li>') : '') +
            	            					(unknownFiles.length>0 ? ('<li>' +me.localize("unknownFiles") + unknownFiles.slice(0, 5).join(", ") + (unknownFiles.length>5 ? '…' : '') +'</li>') : '')+
            	            					'</ul>'+me.localize('sureContinue'),
            	            				buttons: Ext.Msg.YESNO,
            	            				fn: function(btn) {
            	            			        if (btn === 'yes') {
            	            			        	me.loadForm(form);
            	            			        }
            	            			        else {
            	            			        	file.reset(); // make sure we can trigger a change next time
            	            			        	file.fileInputEl.dom.setAttribute('multiple', true);
            	            			        }
            	            			    },
            	            				scope: form
            	            			});
            	            		}
            	            		else {
            	            			me.loadForm(form);
            	            		}
            	            	}
        	            	}
        	            }
        	    	}
	    		},'->', {
	    	    	xtype: 'button',
					scale: 'small',
        			glyph: 'xf00d@FontAwesome',
	    	    	text: this.localize('cancel'),
	    	    	hidden: this.getCorpus()==undefined,
	    	    	handler: function(btn) {
	    	        	var win = this.up("window");
	    	        	if (win && win.isFloating()) {
	    	        		win.close();
	    	        	}
	    	    	}
	    	    }, {
	    	    	xtype: 'button',
	    	    	scale: this.getCorpus()==undefined ? 'large' : 'small',
                    glyph: 'xf00c@FontAwesome',
	    	    	text: this.localize('reveal'),
	    	    	ui: 'default',
	    	    	width: 200,
	    	    	handler: function(btn) {
	    	        	var input = btn.up('form').down('#input').getValue();
	    	        	if (input !== '') {
	    	        		var api = me.getApiParams();
							delete api.corpus;
	    	            	delete api.view;
	    	            	delete api.stopList;
	    	        		if (api.inputFormat && input.trim().indexOf("<")!==0) {
	    	        			Ext.Msg.confirm(me.localize('error'), me.localize('errorNotXmlContinue'), function(buttonId) {
	    	        				if (buttonId=='yes') {
				    	        		me.loadCorpus(Ext.apply(api, {input: input}));
	    	        				}
	    	        			}, me);
	    	        		}
	    	        		else {
		    	        		me.loadCorpus(Ext.apply(api, {input: input}));
	    	        		}
	    	        	}
	    	        	else {
	    	        		Ext.Msg.show({
	    	        		    title: me.localize('noTextProvided'),
	    	        		    message: me.localize('pleaseProvideText'),
	    	        		    buttons: Ext.Msg.OK,
	    	        		    icon: Ext.Msg.ERROR
	    	        		});
	    	        	}
	    	    	}
	    	    }]
	    	}],
	    	items: [{
	    		html: this.getInitialConfig().addTextLabel,
	    		hidden: this.getInitialConfig().addTextLabel==undefined
	    	},{
//	    		layout: 'fit',
	    		height: 100,
    	    	xtype: 'textareafield',
    	    	itemId: 'input',
    	    	emptyText: this.localize('emptyInput')
	    	}]
        });
        
        me.on("boxready", function(panel) {
        	var app = this.getApplication();
        	if (app.getAllowInput() === false) {
				panel.getDockedItems().forEach(function(docked) {
					panel.removeDocked(docked);
				})
        		panel.removeAll();
				panel.add({
					xtype: 'container',
					html: "<p>"+panel.localize('noAllowInputMessage')+"</p>"
				});
        	}
        });

        me.callParent(arguments);
        
    },
    
    loadForm: function(form) {
    	var params = {tool: this.getCorpus() ? 'corpus.CorpusMetadata' : 'corpus.CorpusCreator'};
		var apiParams = this.getApiParams();
    	if (this.getCorpus()) {
    		Ext.apply(params, {
    			corpus: this.getCorpus().getId(),
    			addDocuments: true
    		})
    	} else {
			delete apiParams.corpus;
		}
    	delete apiParams.view;
    	delete apiParams.stopList;
    	Ext.apply(params, apiParams);
    	var view = this.getApplication().getViewport();
		view.mask(this.localize('uploadingCorpus'));
		// hide win so we can see uploading mask
		var win = this.up("window");
    	if (win && win.isFloating()) {
    		win.hide();
    	}
		form.submit({
			url: this.getTromboneUrl(),
			params: params,
			failure: function(form, action) { // we always fail because of content-type
            	view.unmask();
				if (action.result && (action.result.corpus || action.result.stepEnabledCorpusCreator)) {
					var corpusParams = {corpus: action.result.corpus ? action.result.corpus.metadata.id : action.result.stepEnabledCorpusCreator.storedId};
					Ext.applyIf(corpusParams, apiParams); // adding title & subTitle here
					this.setCorpus(undefined)
					this.loadCorpus(corpusParams);
				} else {
					this.showResponseError("Unable to load corpus.", action.response)
				}
			},
			scope: this
		});
    },
   
    loadCorpus: function(params) {
    	if (this.getCorpus()) {
    		Ext.apply(params, {
    			corpus: this.getCorpus().getId(),
    			addDocuments: true
    		})
    	};
    	
    	var win = this.up("window");
    	if (win && win.isFloating()) {
    		win.close();
    	}
    	
		this.getApplication().loadCorpusFromParams(params);
    },
    
    showOptionsClick: function(panel) {
    	var me = panel;
    	if (me.optionsWin === undefined) {
			var langCodes = ['bo'].concat(Object.keys(Voyant.widget.StopListOption.stoplists).filter(function(code) { return code !== 'mu'; })).sort();
			var langArray = langCodes.map(function(code) { return [code, me._localizeClass(Voyant.widget.StopListOption, code)] });
			langArray.unshift(['', me._localizeClass(Voyant.widget.StopListOption, 'auto')]);
    		me.optionsWin = Ext.create('Ext.window.Window', {
    			title: me.localize('gearWinTitle'),
    			closeAction: 'hide',
//    			width: 500,
    			layout: 'fit',
    			bodyPadding: 10,
    			anchor: '100% 100%',
//    			shrinkWrap: 3,
    			items: [{
    				xtype: 'form',
    				defaultType: 'textfield',
        			maxHeight: me.getApplication().getViewport().getHeight()-120,
        			scrollable: true,
    				fieldDefaults: {
    					labelAlign: 'right',
    					labelWidth: 110,
    					width: 350
    				},
    				items: [
						{
						    xtype:'combo',
						    fieldLabel: me.localize('inputFormat'),
						    labelWidth: 90, // try to align with fieldset
						    name: 'inputFormat',
						    queryMode:'local',
						    store:[['',me.localize('inputFormatAuto')],['dtoc','DToC: Dynamic Table of Contexts'],['TEI',"TEI: Text Encoding Initative"],['TEI',"TEI Corpus"],['RSS',"Really Simple Syndication: RSS"]],
						    value: '',
						    listeners: {
						    	afterrender: {
						    		fn: function(combo) {
						    			var inputFormat = this.getApiParam('inputFormat');
						    			if (inputFormat) {
						    				combo.setValue(inputFormat);
						    			}
						    		},
						    		scope: me
						    	},
								change: {
									fn: function(combo, newval, oldval) {
										var dtocIndexDocField = combo.up('form').down('[name=dtocIndexDoc]');
										if (newval === 'dtoc') {
											dtocIndexDocField.show();
										} else {
											dtocIndexDocField.hide();
										}
									},
									scope: me
								}
						    }
						},{
							xtype: 'container',
							html: '<p><i>'+new Ext.Template(me.localize('advancedOptionsText')).applyTemplate([me.getBaseUrl()+'docs/tutorial-corpuscreator.html'])+'</i></p>',
							width: 375
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/tutorial-corpuscreator.html#titles' target='voyantdocs'>"+me.localize('corpusOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
	                            {
	    							xtype: 'container',
	    							html: '<p><i>'+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('corpusTitle'),
									name: 'title'
								},{
									fieldLabel: me.localize('corpusSubTitle'),
									name: 'subTitle'
								},{
									fieldLabel: me.localize("corpusSort"),
									name: 'sort',
								    xtype:'combo',
								    queryMode:'local',
								    store:[['',me.localize('corpusSortAuto')],['TITLEASC',me.localize('corpusSortTitle')],['AUTHORASC',me.localize('corpusSortAuthor')],['PUBDATEASC',me.localize('corpusSortPubDate')],['NOCHANGE', me.localize('corpusSortInitialOrder')]],
								    value: '',
								    listeners: {
								    	afterrender: {
								    		fn: function(combo) {
								    			var inputFormat = this.getApiParam('sort');
								    			if (inputFormat) {
								    				combo.setValue(inputFormat);
								    			}
								    		},
								    		scope: me
								    	}
								    }
								},{
									fieldLabel: me.localize('dtocIndexDoc'),
									name: 'dtocIndexDoc',
									xtype: 'numberfield',
									value: -1,
									minValue: -1,
									maxValue: 99,
									width: 180,
									hidden: true
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/tutorial-corpuscreator.html#text' target='voyantdocs'>"+me.localize('textOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
	                            {
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("textOptionsText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('inputRemoveUntil'),
									name: 'inputRemoveUntil'
								},{
									fieldLabel: me.localize('inputRemoveUntilAfter'),
									name: 'inputRemoveUntilAfter'
								},{
									fieldLabel: me.localize('inputRemoveFrom'),
									name: 'inputRemoveFrom'
								},{
									fieldLabel: me.localize('inputRemoveFromAfter'),
									name: 'inputRemoveFromAfter'
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/tutorial-corpuscreator.html#xml' target='voyantdocs'>"+me.localize('xmlOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
	                            {
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("xmlOptionsText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('xpathContent'),
									name: 'xmlContentXpath'
								},{
									fieldLabel: me.localize('xpathTitle'),
									name: 'xmlTitleXpath'
								},{
									fieldLabel: me.localize('xpathAuthor'),
									name: 'xmlAuthorXpath'
								},{
									fieldLabel: me.localize('xpathDocuments'),
									name: 'xmlDocumentsXpath'
								},{
									fieldLabel: me.localize('xpathGroupBy'),
									name: 'xmlGroupByXpath'
								},{
									xtype: 'fieldset',
			                        title: me.localize('xmlAdditionalOptions'),
			                        collapsible: true,
			                        collapsed: true,
			                        defaultType: 'textfield',
			                        items: [{
										fieldLabel: me.localize('xpathPubDate'),
										name: 'xmlPubDateXpath'
									},{
										fieldLabel: me.localize('xpathPublisher'),
										name: 'xmlPublisherXpath'
									},{
										fieldLabel: me.localize('xpathPubPlace'),
										name: 'xmlPubPlaceXpath'
									},{
										fieldLabel: me.localize('xpathKeywords'),
										name: 'xmlKeywordXpath'
									},{
										fieldLabel: me.localize('xpathCollection'),
										name: 'xmlCollectionXpath'
									},{
										xtype: 'textareafield',
										grow: true,
										fieldLabel: me.localize('xpathExtra'),
										name: 'xmlExtraMetadataXpath'
									}]
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/tutorial-corpuscreator.html#html' target='voyantdocs'>"+me.localize('htmlOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
	                            {
	    							xtype: 'container',
	    							html: '<p><i>'+new Ext.Template(me.localize('htmlOptionsText')).applyTemplate([me.getBaseUrl()+'docs/tutorial-corpuscreator.html#html'])+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('xpathContent'),
									name: 'htmlContentQuery'
								},{
									fieldLabel: me.localize('xpathTitle'),
									name: 'htmlTitleQuery'
								},{
									fieldLabel: me.localize('xpathAuthor'),
									name: 'htmlAuthorQuery'
								},{
									fieldLabel: me.localize('xpathDocuments'),
									name: 'htmlDocumentsQuery'
								},{
									fieldLabel: me.localize('xpathGroupBy'),
									name: 'htmlGroupByQuery'
								},{
									xtype: 'fieldset',
			                        title: me.localize('xmlAdditionalOptions'),
			                        collapsible: true,
			                        collapsed: true,
			                        defaultType: 'textfield',
			                        items: [{
										fieldLabel: me.localize('xpathPubDate'),
										name: 'htmlPubDateQuery'
									},{
										fieldLabel: me.localize('xpathPublisher'),
										name: 'htmlPublisherQuery'
									},{
										fieldLabel: me.localize('xpathPubPlace'),
										name: 'htmlPubPlaceQuery'
									},{
										fieldLabel: me.localize('xpathKeywords'),
										name: 'htmlKeywordsQuery'
									},{
										fieldLabel: me.localize('xpathCollection'),
										name: 'htmlCollectionQuery'
									},{
										xtype: 'textareafield',
										grow: true,
										fieldLabel: me.localize('xpathExtra'),
										name: 'htmlExtraMetadataQuery'
									}]
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/tutorial-corpuscreator.html#json' target='voyantdocs'>"+me.localize('jsonOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
	                            {
	    							xtype: 'container',
	    							html: '<p><i>'+new Ext.Template(me.localize('jsonOptionsText')).applyTemplate([me.getBaseUrl()+'docs/tutorial-corpuscreator.html#json'])+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('xpathContent'),
									name: 'jsonContentPointer'
								},{
									fieldLabel: me.localize('xpathTitle'),
									name: 'jsonTitlePointer'
								},{
									fieldLabel: me.localize('xpathAuthor'),
									name: 'jsonAuthorPointer'
								},{
									fieldLabel: me.localize('xpathDocuments'),
									name: 'jsonDocumentsPointer'
								},/*{ 
									// groupBy is tricky because documents are combined in ways that may conflict 
									// with the other extraction options (especially since Pointer expects absolute
		 							// addresses from root). So for now we'll skip.
									fieldLabel: me.localize('xpathGroupBy'),
									name: 'jsonGroupByPointer'
								},*/{
									xtype: 'fieldset',
			                        title: me.localize('xmlAdditionalOptions'),
			                        collapsible: true,
			                        collapsed: true,
			                        defaultType: 'textfield',
			                        items: [{
										fieldLabel: me.localize('xpathPubDate'),
										name: 'jsonPubDatePointer'
									},{
										fieldLabel: me.localize('xpathPublisher'),
										name: 'jsonPublisherPointer'
									},{
										fieldLabel: me.localize('xpathPubPlace'),
										name: 'jsonPubPlacePointer'
									},{
										fieldLabel: me.localize('xpathKeywords'),
										name: 'jsonKeywordsPointer'
									},{
										fieldLabel: me.localize('xpathCollection'),
										name: 'jsonCollectionPointer'
									},{
										xtype: 'textareafield',
										grow: true,
										fieldLabel: me.localize('xpathExtra'),
										name: 'jsonExtraMetadataPointer'
									}]
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/tutorial-corpuscreator.html#tables' target='voyantdocs'>"+me.localize('tableOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [{
	    							xtype: 'container',
	    							html: '<p><i>'+new Ext.Template(me.localize('tableOptionsText')).applyTemplate([me.getBaseUrl()+'docs/tutorial-corpuscreator.html#tables'])+'</i></p>',
	    							width: 375
	                        	},{
								    xtype:'combo',
									fieldLabel: me.localize('tableDocuments'),
								    name: 'tableDocuments',
								    queryMode:'local',
								    store:[['',me.localize('tableDocumentsTable')],['rows',me.localize('tableDocumentsRows')],['columns',me.localize("tableDocumentsColumns")]],
								    forceSelection:true,
								    value: ''
								},{
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("tableNoHeadersRowText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize("tableNoHeadersRow"),
									xtype: 'checkboxfield',
									name: 'tableNoHeadersRow',
									inputValue: "true"
								},{
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("tableContentText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('tableContent'),
									validator: function(val) {return me.validatePositiveNumbersCsv.call(me, val)},
									name: 'tableContent'
								},{
									xtype: 'container',
									html: '<p><i>'+me.localize('groupByColumnText')+'</i></p>',
									width: 375
								},{
									fieldLabel: me.localize('groupByColumn'),
									validator: function(val) {return me.validatePositiveNumbersCsv.call(me, val)},
									name: 'tableGroupBy'
								},{
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("tableMetadataText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('tableAuthor'),
									validator: function(val) {return me.validatePositiveNumbersCsv.call(me, val)},
									name: 'tableAuthor'
								},{
									fieldLabel: me.localize('tableTitle'),
									validator: function(val) {return me.validatePositiveNumbersCsv.call(me, val)},
									name: 'tableTitle'
								},{
									xtype: 'fieldset',
			                        title: me.localize('xmlAdditionalOptions'),
			                        collapsible: true,
			                        collapsed: true,
			                        defaultType: 'textfield',
			                        items: [{
										fieldLabel: me.localize('xpathPubDate'),
										name: 'tablePubDate'
									},{
										fieldLabel: me.localize('xpathPublisher'),
										name: 'tablePublisher'
									},{
										fieldLabel: me.localize('xpathPubPlace'),
										name: 'tablePubPlace'
									},{
										fieldLabel: me.localize('xpathKeywords'),
										name: 'tableKeywords'
									},{
										fieldLabel: me.localize('xpathCollection'),
										name: 'tableCollection'
									},{
										xtype: 'textareafield',
										grow: true,
										fieldLabel: me.localize('xpathExtra'),
										name: 'tableExtraMetadata'
									}]
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/tutorial-corpuscreator.html#processing' target='voyantdocs'>"+me.localize('processingOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        items: [
								{
								    xtype:'combo',
								    fieldLabel: me.localize("language"),
								    name: 'language',
								    queryMode:'local',
								    store: langArray,
								    forceSelection:true,
								    value: ''
								},{
								    xtype:'combo',
								    fieldLabel: me.localize('tokenization'),
								    name: 'tokenization',
								    queryMode:'local',
								    store:[['',me.localize('tokenizationAuto')],['wordBoundaries',me.localize("tokenizationWordBoundaries")],['whitespace',me.localize("tokenizationWhitespace")]],
								    forceSelection:true,
								    value: ''
								},{
									xtype:'combo',
									fieldLabel: me.localize('textEncoding'),
									name: 'encoding',
									queryMode:'local',
									store:[['','Auto'],['ISO-8859-1', 'ISO-8859-1 (Latin 1)'],['UTF-8', 'UTF-8'],['UTF-16BE', 'UTF-16BE'],['UTF-16LE', 'UTF-16LE'],['windows-1252', 'Windows-1252 (ANSI)']],
									forceSelection:false,
									value: ''
								}
							]
						},{
	        				xtype: 'fieldset',
	                        title: "<a href='"+me.getBaseUrl()+"docs/tutorial-corpuscreator.html#access-management' target='voyantdocs'>"+me.localize('accessOptions')+"</a>",
	                        collapsible: true,
	                        collapsed: true,
	                        defaultType: 'textfield',
	                        items: [
	                            {
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("accessOptionsText")+'</i></p>',
	    							width: 375
	                            },{
									fieldLabel: me.localize('adminPassword'),
									name: 'adminPassword'
								},{
									fieldLabel: me.localize('accessPassword'),
									name: 'accessPassword'
								},{
	    							xtype: 'container',
	    							html: '<p><i>'+me.localize("accessModeWithoutPasswordText")+'</i></p>',
	    							width: 375
	                            },{
								    xtype:'combo',
									fieldLabel: me.localize('accessModeWithoutPassword'),
								    name: 'noPasswordAccess',
								    queryMode:'local',
								    store:[['',me.localize('accessModeNonConsumptive')],['none',me.localize("accessModeNone")]],
								    forceSelection:true,
								    value: ''
								}
							]
						}
						
					]
    			}],
    			buttons: [{
    				text: me.localize('ok'),
    				handler: function(button, event) {
    					var win = button.findParentByType('window');
    					var form = win.down('form');
    					if (form.isValid()) {
        					var params = form.getValues();
        					me.setApiParams(params);
        					win.hide();
    					}
    					else {
    						me.showError({
    							message: me.localize("invalidForm")
    						})
    					}
    				}
    			},{
    				text: me.localize('cancel'),
    				handler: function(button, event) {
    					button.findParentByType('window').hide();
    				}
    			}]
    		});
    	}
    	me.optionsWin.showAt((me.getApplication().getViewport().getWidth()/2)-200,10);
    },
    
    validatePositiveNumbersCsv: function(val) {
    	val = val.trim();
    	if (val.length>0) {
        	if (/[^\d,+ ]/.test(val)) {
        		return this.localize("numbersCommasOnly");
        	}
        	if (/\d\s+\d/.test(val)) {
        		return this.localize("numbersNeedCommas");
        	}
        	var numbers = val.split(/\s*[,+]\s*/), number;
        	for (var i=0, len=numbers.length; i<len; i++) {
        		number = numbers[i];
        		if (number.length==0) {
        			return this.localize("numberEmpty")
        		}
        		if (parseInt(number)==0) {
        			return this.localize("numberZero")
        		}
        	}
    	}
    	return true;
	}
    
});