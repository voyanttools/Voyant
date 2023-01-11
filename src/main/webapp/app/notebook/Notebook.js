/*
 * @class Notebook
 * A Spyral Notebook. This should never be instantiated directly.
 */
Ext.define('Voyant.notebook.Notebook', {
	alternateClassName: ["Notebook"],
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.notebook.editor.CodeEditorWrapper','Voyant.notebook.editor.TextEditorWrapper','Voyant.notebook.metadata.MetadataEditor','Voyant.notebook.StorageDialogs','Voyant.notebook.github.GitHubDialogs'],
	mixins: ['Voyant.panel.Panel','Voyant.notebook.Authenticator','Voyant.notebook.util.FormatConverter'],
	alias: 'widget.notebook',
    statics: {
    	i18n: {
    		title: "Spyral",
    		created: "Notebook Created",
    		modified: "Notebook Modified",
			saving: "Saving Notebook",
			saved: "Notebook Saved",
    		clickToEdit: "Click to edit",
    		errorLoadingNotebook: "Error loading Spyral notebook",
    		cannotLoadJson: "Unable to parse JSON input.",
    		cannotLoadJsonUnrecognized: "Unable to recognize JSON input.",
    		cannotLoadUnrecognized: "Unable to recognize input.",
			cannotLoadNotebookId: "Unable to load the Spyral Notebook. It may no longer exist.",
    		openTitle: "Open",
    		openMsg: "Paste in Notebook ID or a Spyral data file (in HTML).",
    		exportHtmlDownload: "HTML (download)",
    		errorParsingDomInput: "An error occurred while parsing the input of the document. The results might still work, except if the code contained HTML tags.",
			metadataTip: "View and Edit the notebook metadata.",
			metadataEditor: "Edit Metadata",
    		metadataReset: "Reset",
    		metadataSave: "Save Metadata",
    		metadataCancel: "Cancel",
			catalogueTip: "Search a catalogue of available notebooks.",
			preparingExport: "Preparing Export",
			notSavedWarning: "Changes to your notebook have not been saved. Are you sure you want to continue?",
			accountTip: 'View your account',
			openTip: 'Open a Spyral Notebook (by uploading a file)'
    	},
    	api: {
    		input: undefined,
    		inputEncodedBase64Json: undefined,
    		run: undefined
    	}
    },
    config: {
        /**
         * @private
		 * This is a combination of username and notebook name, separated by NOTEBOOK_ID_SEPARATOR
         */
    	notebookId: undefined,
		/**
		 * @private
		 * The name of the notebook (distinct from the notebook title)
		 */
		notebookName: undefined,
        /**
         * @private
         */
    	metadata: undefined,
        /**
         * @private
         */
    	isEdited: false,
    	/**
    	 * @private
    	 */
    	version: "3.0",
		/**
		 * @private
		 * Which solution to use for storing notebooks, either: 'voyant' or 'github'
		 */
		storageSolution: 'voyant'
	},

	NOTEBOOK_ID_SEPARATOR: '_',

	SPYRAL_ID_REGEX: /\/spyral\/(.*?@[a-z]{2})[\/_]([A-Za-z0-9-]+)\/?$/,
	SPYRAL_ID_REGEX_OLD: /\/spyral\/([\w-]+)\/?$/,

	metadataWindow: undefined,
	voyantStorageDialogs: undefined,
	githubDialogs: undefined,
	catalogueWindow: undefined,
	docsWindow: undefined,

	// holds the content of the tern docs, for passing to the code editor
	spyralTernDocs: undefined,
	ecmaTernDocs: undefined,
	browserTernDocs: undefined,
    
    /**
     * @private
     */
    constructor: function(config) {
		var handleSignIn = function() {
			parent.setMetadata(parent.getMetadata().clone()); // force metadata refresh
			parent.setIsEdited(false);
			parent.toastInfo({
				html: parent.localize('signInSuccess'),
				anchor: 'tr'
			});
		}

    	Ext.apply(config, {
    		title: this.localize('title'),
    		includeTools: {
				'help': true,
				'gear': true,
    			'save': true,
    			'saveIt': {
    				tooltip: this.localize("saveItTip"),
    				itemId: 'saveItTool',
    				xtype: 'toolmenu',
    				glyph: 'xf0c2@FontAwesome',
					callback: function(parent, menu) {
						if (menu.toolMenu) menu.toolMenu.destroy(); // need to recreate toolMenu each to register item changes
						menu.items = [];

						parent.isAuthenticated(true).then(function(isAuth) {
							if (isAuth) {
								menu.items = [{
									text: 'Save',
									xtype: 'menuitem',
									glyph: 'xf0c2@FontAwesome',
									handler: parent.showSaveDialog.bind(parent, false),
									scope: parent
								},{
									text: 'Save As...',
									xtype: 'menuitem',
									glyph: 'xf0c2@FontAwesome',
									handler: parent.showSaveDialog.bind(parent, true),
									scope: parent
								}];
							} else {
								menu.items = [
									parent.getGitHubAuthButton(handleSignIn)
								];
							}
						}, function() {
							menu.items = [
								parent.getGitHubAuthButton(handleSignIn)
							];
						}).always(function() {
							menu.showToolMenu();
						});
						/*{
							text: 'Storage',
							xtype: 'menuitem',
							menu: {
								items: [{
									text: 'Voyant',
									xtype: 'menucheckitem',
									group: 'storageSolution',
									checked: true,
									handler: this.setStorageSolution.bind(this, 'voyant'),
									scope: this
								},{
									text: 'GitHub',
									xtype: 'menucheckitem',
									group: 'storageSolution',
									checked: false,
									handler: this.setStorageSolution.bind(this, 'github'),
									scope: this
								}]
							}
						}*/
					}
    			},
    			'new': {
    				tooltip: this.localize("newTip"),
    				callback: function() {
    	    			let url = this.getBaseUrl()+"spyral/";
						this.getApplication().openUrl(url);
    				},
    				xtype: 'toolmenu',
    				glyph: 'xf067@FontAwesome',
    				scope: this
    			},
    			'open': {
    				tooltip: this.localize("openTip"),
    				xtype: 'toolmenu',
					glyph: 'xf115@FontAwesome',
					callback: function(panel, tool) {
						const storageSolution = this.getStorageSolution();
						if (storageSolution === undefined) {
						} else {
							if (storageSolution === 'github') {
								this.githubDialogs.showLoad();
							} else {
								this.voyantStorageDialogs.showLoad();
							}
						}
					},
					scope: this
    			},
    			'runall': {
    				tooltip: this.localize("runallTip"),
    				callback: this.runAll,
    				xtype: 'toolmenu',
    				glyph: 'xf04e@FontAwesome',
    				scope: this
    			},
    			'metadata': {
    				tooltip: this.localize("metadataTip"),
    				callback: this.showMetadataEditor,
					xtype: 'toolmenu',
					glyph: 'xf02c@FontAwesome',
					scope: this
    			},
                'catalogue': {
                    tooltip: this.localize("catalogueTip"),
                    callback: function() {
                        this.catalogueWindow.showWindow();
                    },
                    xtype: 'toolmenu',
                    glyph: 'xf00b@FontAwesome',
                    scope: this
                },
				'account': {
					tooltip: this.localize("accountTip"),
					xtype: 'toolmenu',
					glyph: 'xf007@FontAwesome',
					callback: function(parent, menu) {
						if (menu.toolMenu) menu.toolMenu.destroy(); // need to recreate toolMenu each time to register item changes
						menu.items = [];

						parent.isAuthenticated(true).then(function(isAuth) {
							if (isAuth) {
								parent.showAccountWindow();
							} else {
								menu.items = [
									parent.getGitHubAuthButton(handleSignIn)
								];
							}
						}, function() {
							menu.items = [
								parent.getGitHubAuthButton(handleSignIn)
							];
						}).always(function() {
							menu.showToolMenu();
						});
					}
				}
    		},
    		
			scrollable: true,
			layout: {
				type: 'vbox',
				align: 'middle',
				padding: '50 0'
			},
			defaults: {
				width: '100%',
				maxWidth: 1100
			},
    		items: [{
    			itemId: 'spyralHeader',
    			cls: 'spyral-header',
    			listeners: {
    				afterrender: function(header) {
    					Ext.tip.QuickTipManager.register({
    						  target: header.getId(),
    						  text: this.localize("clickToEdit")
    						});
    					var head = header;
    					header.getTargetEl().on("click", function(header) {
    						this.showMetadataEditor();
    						head.removeCls("editable");
    					}, this);
    					header.mon(header.getEl(), "mouseover", function() {header.addCls("editable")});
    					header.mon(header.getEl(), "mouseout", function() {header.removeCls("editable")});
    				},
    				scope: this
    			}
    		},{
    			xtype: 'container',
    			itemId: 'cells',
				defaults: {
					margin: '10 0 10 0',
					padding: '0 65 0 65'
				}
    		},{
    			itemId: 'spyralFooter',
    			cls: 'spyral-footer',
    			listeners: {
    				afterrender: function(footer) {
    					Ext.tip.QuickTipManager.register({
  						  target: footer.getId(),
  						  text: this.localize("clickToEdit")
  						});
    					var foot = footer;
    					footer.getTargetEl().on("click", function(footer) {
    						this.showMetadataEditor();
    						foot.removeCls("editable");
    					}, this);
    					footer.mon(footer.getEl(), "mouseover", function() {footer.addCls("editable")});
    					footer.mon(footer.getEl(), "mouseout", function() {footer.removeCls("editable")});
    				},
    				scope: this
    			}
    		}],
			helpToolClick: this.showDocs.bind(this),
    		listeners: {
    			afterrender: this.init,
    			notebookWrapperMoveUp: this.notebookWrapperMoveUp,
    			notebookWrapperMoveDown: this.notebookWrapperMoveDown,
    			notebookWrapperRemove: this.notebookWrapperRemove,
				notebookWrapperAdd: this.notebookWrapperAdd,
				notebookInitialized: this.notebookInitialized,
				notebookSelected: this.handleNotebookSelected,
    			scope: this
    		}
    	})

        this.callParent(arguments);
    	this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
		this.mixins['Voyant.notebook.util.FormatConverter'].constructor.apply(this, arguments);

		this.voyantStorageDialogs = new Voyant.notebook.StorageDialogs({
			notebookParent: this,
			listeners: {
				'fileLoaded': function(fileData) {
					this.checkIsEditedAndDoCallback(this, function() {
						this.loadFromString(fileData);
					});
				},
				'fileSaved': function(src, notebookId, error) {
					this.unmask();
					if (notebookId !== null) {
						var id = this.getNotebookId();
						if (!id || notebookId!=id) {
							this.setNotebookId(notebookId);
						}
						this.toastInfo({
							html: this.localize('saved'),
							anchor: 'tr'
						});
						this.setIsEdited(false);
					} else {
						// save error
						this.showError("There was an error saving your notebook:\n"+error);
					}
				},
				'saveCancelled': function() {
				},
				'close': function() {
					this.unmask();
				},
				scope: this
			}
		});

		this.githubDialogs = new Voyant.notebook.github.GitHubDialogs({
			parent: this,
			listeners: {
				'fileLoaded': function(src, {owner, repo, ref, path, file}) {
					this.githubDialogs.close();
					this.loadFromString(file);

					const id = encodeURIComponent(owner+'/'+repo+'/'+path);
					if (location.search.indexOf(id) === -1) {
						const url = this.getBaseUrl()+'spyral/?githubId='+id;
						window.history.pushState({
							url: url
						}, 'Spyral Notebook: '+id, url);
					}
				},
				'fileSaved': function(src, {owner, repo, branch, path}) {
					this.githubDialogs.close();
					this.unmask();
					this.toastInfo({
						html: this.localize('saved'),
						anchor: 'tr'
					});
					this.setIsEdited(false);

					const id = encodeURIComponent(owner+'/'+repo+'/'+path);
					if (location.search.indexOf(id) === -1) {
						const url = this.getBaseUrl()+'spyral/?githubId='+id;
						window.history.pushState({
							url: url
						}, 'Spyral Notebook: '+id, url);
					}
				},
				'saveCancelled': function(src) {
					this.unmask();
				},
				scope: this
			}
		});

		this.catalogueWindow = new Voyant.notebook.Catalogue({
			listeners: {
				notebookSelected: this.handleNotebookSelected,
				scope: this
			}
		});
    },
    
    init: function() {
		window.onbeforeunload = function() {
			if (this.getIsEdited()) {
				return ''; // return any string to prompt the browser to warn the user they have unsaved changes
			}
		}.bind(this);

		// need to load docs first
		Ext.Promise.all([
			Ext.Ajax.request({url: this.getApplication().getBaseUrlFull()+'resources/spyral/docs/spyral.json'}),
			Ext.Ajax.request({url: this.getApplication().getBaseUrlFull()+'resources/spyral/docs/ecmascript.json'}),
			Ext.Ajax.request({url: this.getApplication().getBaseUrlFull()+'resources/spyral/docs/browser.json'})
		]).then(function(responses) {
			this.spyralTernDocs = Ext.JSON.decode(responses[0].responseText);
			this.ecmaTernDocs = Ext.JSON.decode(responses[1].responseText);
			this.browserTernDocs = Ext.JSON.decode(responses[2].responseText);

			this.loadFromQueryParams();
		}.bind(this), function() {
			this.loadFromQueryParams();
		}.bind(this));

		this.retrieveAccountInfo();
    },
    
    
    reset: function() {
		this.getScrollable().scrollTo(0, 0);
		this.getScrollable().trackingScrollTop = 0;
		this.getScrollable().trackingScrollLeft = 0;

		this.setMetadata(new Spyral.Metadata());
		this.voyantStorageDialogs.reset();
    	var cells = this.getComponent("cells");
    	cells.removeAll();
	},

	showSaveDialog: function(saveAs) {
		this.mask(this.localize('saving'));
		
		this.getMetadata().setDateNow('modified');
		this.getMetadata().set({userId: this.accountInfo.id});

		this.updateCachedOutput().then(function(result) {	
		}, function(err) {
			console.warn('Error updating cached results');
		}).finally(function() {
			var data = this.generateExportJson();
			var metadata = this.generateExportMetadata(this.getMetadata());
	
			var storageSolution = this.getStorageSolution();
			
			if (!saveAs && storageSolution === 'voyant' && this.getNotebookId() !== undefined) {
				this.voyantStorageDialogs.doSave({
					notebookName: this.getNotebookName(),
					data: data,
					metadata: metadata
				});
			} else {
				if (storageSolution === 'github') {
					this.githubDialogs.showSave(data);
				} else {
					this.voyantStorageDialogs.showSave(data, metadata, saveAs ? undefined : this.getNotebookName());
				}
			}
		}.bind(this));
	},

	updateCachedOutput: function() {
		return Ext.Promise.all(this.query('notebookrunnableeditorwrapper').map(function(cmp) {
			return cmp.results.updateCachedOutput();
		}));
	},

	exportToolClick: function(panel) {
		panel.mask(panel.localize('preparingExport'));
		panel.updateCachedOutput().finally(function() {
			panel.unmask();
			panel.mixins['Voyant.util.Toolable'].exportToolClick.call(this, panel);
		});
	},
	
	// override toolable method
	getExportUrl: function(asTool) {
		return location.href; // we just provide the current URL
	},

	// override toolable method
	exportBiblio: function() {
		var date = new Date();
		var url = this.getExportUrl();
		var metadata = this.getMetadata();
		var author = metadata.author;
		var title = metadata.title;
		Ext.Msg.show({
			title: this.localize('exportBiblioTitle'),
			message: '<fieldset><legend>MLA</legend>'+
			'<div class="x-selectable">'+
			author+'. "'+title+'." '+
			'<i>Spyral - Voyant Tools</i>, Development led by Stéfan Sinclair and Geoffrey Rockwell. '+Ext.Date.format(date,'Y')+'. Web. '+Ext.Date.format(date,'j M Y')+'. &lt;'+url+'&gt;.'+
			'</div></fieldset><br >'+
			'<fieldset><legend>Chicago</legend>'+
			'<div class="x-selectable">'+
			author+', "'+title+'", '+
			'<i>Spyral - Voyant Tools</i>, Development led by Stéfan Sinclair and Geoffrey Rockwell. Accessed '+Ext.Date.format(date,'F j, Y')+', '+url+'.'+
			'</div></fieldset><br >'+
			'<fieldset><legend>APA</legend>'+
			'<div class="x-selectable">'+
			author+'. ('+Ext.Date.format(date,'Y')+"). "+title+'. '+
			'<i>Spyral - Voyant Tools</i>, Development led by Stéfan Sinclair and Geoffrey Rockwell. Retrieved '+Ext.Date.format(date,'F j, Y')+', from '+url+
			'</div></fieldset>',
			buttons: Ext.Msg.OK,
			icon: Ext.Msg.INFO
		})
	},

	loadFromQueryParams: function() {
		var queryParams = Ext.Object.fromQueryString(document.location.search, true);
		var doRun = Ext.isDefined(queryParams.run);

		var spyralIdMatches = this.SPYRAL_ID_REGEX.exec(location.pathname);
		var spyralIdMatchesOld = this.SPYRAL_ID_REGEX_OLD.exec(location.pathname);

		var isGithub = Ext.isDefined(queryParams.githubId);
		
		if ("inputJsonArrayOfEncodedBase64" in queryParams) {
			let json = Ext.decode(decodeURIComponent(atob(queryParams.inputJsonArrayOfEncodedBase64)));
			json.forEach(function(block, index) {
				let text = block;
				if (text.trim().indexOf("<")==0) {
					if (index === 0) {
						// assume first text block is metadata
						this.setMetadata(new Spyral.Metadata({
							title: text
						}));
					} else {
						this.addText(text);
					}
				} else {
					this.addCode(text);
				}
			}, this);
		} else if (spyralIdMatches) {
			this.loadFromId(spyralIdMatches[1]+this.NOTEBOOK_ID_SEPARATOR+spyralIdMatches[2]);
			this.setStorageSolution('voyant');
		} else if (spyralIdMatchesOld) {
			this.loadFromId(spyralIdMatchesOld[1]);
			this.setStorageSolution('voyant');
		} else if (isGithub) {
			this.githubDialogs.loadFileFromId(queryParams.githubId);
			this.setStorageSolution('github');
		} else {
			this.addNew();
			this.setIsEdited(false);
		}
		
		if (doRun) {
			var me = this;
			Ext.defer(function() {
				me.runAll()
			}, 100)
		}
	},
	
	loadFromString: function(text) {
		text = text.trim();
		if (text.indexOf("{") === 0) {
			this.loadFromJson(text);
		} else if (this.SPYRAL_ID_REGEX.test('/spyral/'+text)) {
			var spyralIdMatches = this.SPYRAL_ID_REGEX.exec('/spyral/'+text);
			this.loadFromId(spyralIdMatches[1]+this.NOTEBOOK_ID_SEPARATOR+spyralIdMatches[2]);
		} else if (text.indexOf("<") !== 0 || text.indexOf("spyral") === -1) {
			return Ext.Msg.show({
				title: this.localize('errorLoadingNotebook'),
				msg: this.localize('cannotLoadUnrecognized'),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR
			});
		} else {
			Ext.batchLayouts(function() {
				this.reset();
				this.setNotebookId(undefined);
				try {
					this.importFromHtml(text); // old format
				} catch (e) {
					Ext.Msg.show({
						title: this.localize('errorLoadingNotebook'),
						msg: this.localize('cannotLoadUnrecognized'),
						buttons: Ext.MessageBox.OK,
						icon: Ext.MessageBox.ERROR
					});
				}
			}, this);
		}
		return true;
    },

	loadFromJson: function(text) {
		var json;
		try {
			json = JSON.parse(text)
		} catch(e) {
			return Ext.Msg.show({
				title: this.localize('errorLoadingNotebook'),
				msg: this.localize('cannotLoadJson')+"<br><pre style='color: red'>"+e+"</pre>",
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR
			});
		}

		if (!json.cells || !json.metadata) {
			return Ext.Msg.show({
				title: this.localize('errorLoadingNotebook'),
				msg: this.localize('cannotLoadJsonUnrecognized'),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR
			});
		}

		Ext.batchLayouts(function() {
			this.reset();
			this.setMetadata(new Spyral.Metadata(json.metadata));

			var cells2Init = [];
			json.cells.forEach(function(cell) {
				var cell2Init = undefined;
				switch(cell.type) {
					case 'text':
						this.addText(cell.content, undefined, cell.cellId);
						break;
					case 'code':
						cell2Init = this.addCode(cell.content, undefined, cell.cellId);
						break;
					case 'data':
						cell2Init = this.addData(cell.content, undefined, cell.cellId);
						break;
				}
				if (cell2Init) {
					cell2Init.on('initialized', function() {
						var cellIndex = cells2Init.indexOf(cell2Init);
						if (cellIndex !== -1) {
							cells2Init.splice(cellIndex, 1);
							if (cells2Init.length === 0) {
								this.fireEvent('notebookInitialized', this);
							}
						} else {
							console.error('unknown cell initialized', cell2Init);
						}
					}.bind(this));
					cells2Init.push(cell2Init);
				}
			}, this);
		}, this);
	},
    
    loadFromId: function(id) {
    	this.mask(this.localize("loading"));
    	var me = this;
    	Spyral.Load.trombone({
	    	 tool: 'notebook.GitNotebookManager',
	    	 action: 'load',
	    	 id: id,
	    	 noCache: 1
    	}).then(function(json) {
    		me.unmask();
			if (json.notebook.success) {
				me.loadFromString(json.notebook.data);
				if (json.notebook.id && json.notebook.id !== me.getNotebookId()) {
					me.setNotebookId(json.notebook.id);
				}
				me.setIsEdited(false);
			} else {
				Ext.Msg.show({
					title: me.localize('errorLoadingNotebook'),
					msg: json.notebook.error,
					buttons: Ext.MessageBox.OK,
					icon: Ext.MessageBox.ERROR
				});
			}
    	}).catch(function(err) {
			me.unmask();
			Ext.Msg.show({
				title: me.localize('errorLoadingNotebook'),
				msg: me.localize('cannotLoadNotebookId'),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR
			});
		});
    },

	checkIsEditedAndDoCallback: function(source, callback) {
		if (this.getIsEdited()) {
			Ext.Msg.show({
				title: this.localize('openTitle'),
				message: this.localize('notSavedWarning'),
				buttons: Ext.Msg.YESNO,
				icon: Ext.Msg.QUESTION,
				fn: function(btn) {
					if (btn==='yes') {
						callback.call(source);
					}
				},
				scope: this

			});
		} else {
			callback.call(source);
		}
	},

	handleNotebookSelected: function(source, notebookId, callback) {
		this.checkIsEditedAndDoCallback(source, function() {
			callback.call(source);
			this.loadFromId(notebookId);
		}.bind(this));
	},
    
    runUntil: function(upToCmp) {
    	var containers = [];
    	Ext.Array.each(this.query("notebookrunnableeditorwrapper"), function(item) {
			containers.push(item);
    		if (upToCmp && upToCmp===item) {return false;}
    	}, this);
    	this._run(containers);
    },
    
    runFrom: function(fromCmp) {
    	var containers = [], matched = false;
    	Ext.Array.each(this.query("notebookrunnableeditorwrapper"), function(item) {
    		if (fromCmp && fromCmp===item) {matched=true;}
    		if (matched) {
    			containers.push(item);
    		}
    	}, this);
    	this._run(containers);
    },
    
    runAll: function() {
    	var containers = [];
    	Ext.Array.each(this.query("notebookrunnableeditorwrapper"), function(item) {
			containers.push(item);
    	}, this);
    	this._run(containers);
    },
    
    _run: function(containers, prevVars) {
    	if (containers.length>0) {
    		var container = containers.shift();
			var me = this;
    		container.run(prevVars).then(function(result) {
				// check for and remove older duplicates
				var newVars = container.getVariables();
				if (prevVars === undefined) {
					prevVars = [];
				}
				newVars.forEach(function(newVar) {
					for (var i = 0; i < prevVars.length; i++) {
						var prevVar = prevVars[i];
						if (newVar.name === prevVar.name) {
							// console.log('removing duplicate var:', prevVar.name);
							prevVars.splice(i, 1);
							break;
						}
					}
				});
				prevVars = prevVars.concat(newVars);
				
				Ext.defer(me._run, 100, me, [containers, prevVars]);
			}, function(error) {
				// console.log('nb error', error);
			});
    	} else {
			 // the notebook has finished running
			this.updateTernServerVariables(this.getNotebookVariables());
			this.fireEvent('notebookRun', this);
		}
	},

	notebookInitialized: function() {
		// run all data cells
		// var containers = [];
    	// Ext.Array.each(this.query("notebookdatawrapper"), function(item) {
		// 	containers.push(item);
    	// }, this);
    	// this._run(containers, []);
	},

	updateTernServerVariables: function(varsToAdd, varsToRemove) {
		if (Voyant.notebook.editor.CodeEditor.ternServer) {
			if (varsToRemove) {
				varsToRemove.forEach(function(theVar) {
					Voyant.notebook.editor.CodeEditor.ternServer.server.delFile(theVar.name);
				})
			}
			if (varsToAdd === undefined) {
				console.warn('updateTernServerVariables: no varsToAdd!');
			} else {
				varsToAdd.forEach(function(theVar) {
					if (theVar.isSpyralClass) {
						// many Spyral classes are created via helper methods, e.g. loadCorpus
						// therefore add text that initializes the variable using the class constructor
						// ensuring that the tern server is aware of the variable name and type
						var ternText = 'var '+theVar.name+' = new '+theVar.isSpyralClass+'()';
						Voyant.notebook.editor.CodeEditor.ternServer.server.addFile(theVar.name, ternText);
					} else {
						Spyral.Util.blobToString(theVar.value).then(function(blobStr) {
							var ternText = 'var '+theVar.name+' = '+blobStr;
							Voyant.notebook.editor.CodeEditor.ternServer.server.addFile(theVar.name, ternText);
						});
					}
				});
			}
		}
	},

	getNotebookVariables: function(upToCmp) {
		var variables = [];

		Ext.Array.each(this.query("notebookrunnableeditorwrapper"), function(item) {
			if (upToCmp && upToCmp===item) {return false;} // NB upToCmp exits earlier here than in runUntil

			if (item.getIsRun()) {
				var newVars = item.getVariables();
				newVars.forEach(function(newVar) {
					for (var i = 0; i < variables.length; i++) {
						var prevVar = variables[i];
						if (newVar.name === prevVar.name) {
							variables.splice(i, 1); // remove older duplicate var
							break;
						}
					}
				});

				variables = variables.concat(newVars);
			}
		});

		return variables;
	},

	getNotebookBlocks: function(upToCmp) {
		var blocks = [];

		Ext.Array.each(this.query("notebookrunnableeditorwrapper"), function(item) {
			if (upToCmp && upToCmp===item) {return false;} // NB upToCmp exits earlier here than in runUntil

			blocks.push(item.getInput());
		});

		return blocks;
	},


	
	addNew: function() {
		// TODO metadata defaults
		this.setMetadata(new Spyral.Metadata({
			title: "Spyral Notebook",
			language: "English"
		}));
		this.addText("<p>This is a Spyral Notebook, a dynamic document that combines writing, code and data in service of reading, analyzing and interpreting digital texts.</p><p>Spyral Notebooks are composed of text cells (like this one) and code cells (like the one below). You can click on the cells to edit them and add new cells by clicking add icon that appears in the left column when hovering over a cell.</p>");
		this.addCode('');
	},
    
	addText: function(block, index, cellId) {
		return this._add(block, index, 'notebooktexteditorwrapper', cellId);
	},
 
	addCode: function(block, index, cellId, config) {
		config = config || {};
		config.docs = [this.ecmaTernDocs, this.browserTernDocs, this.spyralTernDocs];
		return this._add(block, index, 'notebookcodeeditorwrapper', cellId, config);
	},

	addData: function(block, index, cellId, config) {
		return this._add(block, index, 'notebookdatawrapper', cellId, config);
	},
		
	_add: function(block, index, xtype, cellId, config) {
		if (Ext.isString(block)) {
			block = {input: block}
		}
		var cells = this.getComponent("cells");
		index = (typeof index === 'undefined') ? cells.items.length : index;
		cellId = (typeof cellId === 'undefined') ? Spyral.Util.id() : cellId;
		return cells.insert(index, Ext.apply(block, {
			xtype: xtype,
			index: index,
			cellId: cellId
		}, config))
	},

    
	notebookWrapperMoveUp: function(wrapper) {
		var cells = this.getComponent("cells");
		var i = cells.items.findIndex('id', wrapper.id);
		if (i==0) {
			Ext.Msg.show({
				title: this.localize('error'),
				msg: this.localize('cannotMoveHigher'),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
		}
		else {
			cells.move(i, i-1);
			this.redoOrder();
		}
	},
	
	notebookWrapperMoveDown: function(wrapper) {
		var cells = this.getComponent("cells");
		var i = cells.items.findIndex('id', wrapper.id);
		if (i==cells.items.getCount()-1) {
			Ext.Msg.show({
				title: this.localize('error'),
				msg: this.localize('cannotMoveLower'),
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.WARNING
			});
		}
		else {
			cells.move(i, i+1);
			this.redoOrder();
		}
	},
	
	notebookWrapperRemove: function(wrapper) {
		var cells = this.getComponent("cells");
		cells.remove(wrapper);
		if (cells.items.length==0) {
			this.addText("(Click to edit).")
		}
		this.redoOrder();
	},
	
	notebookWrapperAdd: function(wrapper, e) {
		var cells = this.getComponent("cells");
		var i = cells.items.findIndex('id', wrapper.id);
		var runnable = wrapper.getXTypes(wrapper).indexOf('notebookrunnableeditorwrapper') !== -1;
		var cmp;
		if ((!runnable && !e.hasModifier()) || (runnable && e.hasModifier())) {
			cmp = this.addCode('',i+1);
		} else {
			cmp = this.addText('',i+1);
		}
		cmp.getTargetEl().scrollIntoView(this.getTargetEl(), null, true, true);
		this.redoOrder();
	},

	redoOrder: function() {
		this.query("notebookeditorwrapper").forEach(function(cmp, i) {
			cmp.setIndex(i);
		})
		this.setIsEdited(true);
	},
    
    applyIsEdited: function(val) {
    	// TODO: perhaps setup autosave
    	if (this.rendered) {
        	// this.getHeader().down("#saveItTool").setDisabled(val === false);
        	if (!val) {
        		this.query("notebookcodeeditor").forEach(function(editor) {
        			editor.setIsChangeRegistered(false);
        		})
        		this.query("notebooktexteditor").forEach(function(editor) {
        			editor.setIsEditRegistered(false);
        		})
        	}
    	}
		return val;
    },
    
	applyNotebookId: function (id) {
		if (this.isConfiguring === false) { // don't (re)set url during initial config as this will clear the url's notebook id
			let url = this.getBaseUrl()+"spyral/";
			if (id) {
				if (id.indexOf(this.NOTEBOOK_ID_SEPARATOR) === -1) {
					// old ID system
					this.setNotebookName(id);
				} else {
					const notebookName = id.split(this.NOTEBOOK_ID_SEPARATOR)[1];
					this.setNotebookName(notebookName);
				}
				url += id.replace(this.NOTEBOOK_ID_SEPARATOR, '/')+"/";
			}
			window.history.pushState({
				url: url
			}, '', url);
		}

		return id;
    },

	applyMetadata: function(metadata) {
		if (metadata !== undefined) {
			// remove tags from old notebooks
			metadata.title = metadata.title.replace(/<\/?\w+.*?>/g, '');
			metadata.description = metadata.description.replace(/<\/?\w+.*?>/g, '');
			
			// set user info if logged in
			if (this.isAuthenticated() && metadata.userId === '' && metadata.author === '') {
				metadata.userId = this.accountInfo.id;
				metadata.author = this.accountInfo.name;
			}
		}
		
		return metadata;
	},
		
	updateMetadata: function() {
		var metadata = this.getMetadata();
		document.title = metadata.title+' - Spyral';

		this.getComponent("spyralHeader").update(this.getInnerHeaderHtml());
		this.getComponent("spyralFooter").update(this.getInnerFooterHtml());

		if (this.metadataEditor) {
			this.metadataEditor.loadMetadata(metadata);
		}

		this.setIsEdited(true);
	},

	showMetadataEditor: function() {
		if (this.metadataWindow === undefined) {
			var me = this;
			
			this.metadataEditor = Ext.create('widget.metadataeditor', {
				anchor: '100%'
			});
			this.metadataWindow = Ext.create('Ext.window.Window', {
				title: this.localize('metadataEditor'),
				autoScroll: true,
				width: 600,
				closeAction: 'hide',
				layout: 'anchor',
				items: this.metadataEditor,
				buttons: [{
					text: this.localize('metadataCancel'),
					ui: 'default-toolbar',
					handler: function() {
						this.up('window').close();
					}
				},{
					text: this.localize('metadataReset'),
					ui: 'default-toolbar',
					handler: function() {
						me.metadataEditor.reset();
					}
				},{
					text: this.localize('metadataSave'),
					handler: function() {
						var form = me.metadataEditor.getForm();
						var values = form.getValues();
						values.catalogue = values.catalogue === 'true'; // convert to boolean
						me.getMetadata().set(values);
						me.updateMetadata();
						this.up('window').close();
					}
				}]
			});
		}

		var metadata = this.getMetadata();
		if (metadata === undefined) {
			metadata = new Spyral.Metadata();
			this.setMetadata(metadata);
		}

		this.metadataEditor.loadMetadata(metadata);

		this.metadataWindow.show();
	},

	showDocs: function() {
		if (this.docsWindow === undefined) {
			this.docsWindow = Ext.create('Voyant.notebook.util.DocsWindow');
		}
		this.docsWindow.showDocs();
	},

	showDocsForClassMethod: function(docClass, docMethod) {
		if (this.docsWindow === undefined) {
			this.docsWindow = Ext.create('Voyant.notebook.util.DocsWindow');
		}
		this.docsWindow.showDocsForClassMethod(docClass, docMethod);
	},

	handleDocLink: function(link) {
		if (this.docsWindow === undefined) {
			this.docsWindow = Ext.create('Voyant.notebook.util.DocsWindow');
		}
		this.docsWindow.handleDocLink(link);
	}
});