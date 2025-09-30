Ext.define('Voyant.notebook.editor.button.Export', {
	extend: 'Ext.menu.Item',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.notebookwrapperexport',
	statics: {
		i18n: {
			text: 'Export',
			tip: 'Export',
			exportTitle: 'Export',
			exportOpen: 'Export content into new window',
			exportDownload: 'Download file to your machine',
			exportCorpus: 'Open Corpus in Voyant Tools',
			cancelTitle: 'Cancel'
		},
		exportWin: undefined,
		getExportWindow: function(instance) {
			if (this.exportWin === undefined) {
				this.exportWin = Ext.create('Ext.window.Window', {
					title: instance.localize('exportTitle'),
					closeAction: 'hide',
					modal: true,
					width: 250,
					bodyPadding: 5,
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					defaults: {
						xtype: 'button'
					},
					items: [{
						itemId: 'corpus',
						text: instance.localize('exportCorpus'),
						glyph: 'xf08e@FontAwesome',
						margin: '0 0 5 0',
						hidden: true
					},{
						itemId: 'open',
						text: instance.localize('exportOpen'),
						glyph: 'xf08e@FontAwesome',
						margin: '0 0 5 0',
					},{
						itemId: 'download',
						preventDefault: false,
						text: instance.localize('exportDownload'),
						glyph: 'xf019@FontAwesome',
						handler: function(btn) {
							btn.up('window').close();
						}
					}],
					buttons: [{
						text: instance.localize('cancelTitle'),
						glyph: 'xf00d@FontAwesome',
						handler: function(btn) {
							btn.up('window').close();
						}
					}]
				});
			}

			var wrapper = Voyant.notebook.editor.EditorWrapper.currentEditor;
			if (wrapper === undefined) {
				var results = Voyant.notebook.editor.SandboxWrapper.currentResults;
				var notebook = results.up('notebook');
				Ext.Array.each(notebook.query("notebookrunnableeditorwrapper"), function(item) {
					if (item.results === results) {
						wrapper = item;
						return false;
					}
				});
				if (wrapper === undefined) {
					console.warn('wrapper not found!');
					return;
				}
			}

			var outputPromise = null;
			var mode = wrapper.getMode();
			if (mode === 'file' || mode === 'corpus' || mode === 'table') {
				outputPromise = wrapper.cachedInput.getBlob();
			} else {
				outputPromise = wrapper.results.updateCachedOutput().then(function() {
					return Ext.Promise.resolve(wrapper.getOutput());
				});
			}

			var notebook = wrapper.up('notebook');
			var notebookId = notebook.getNotebookId() || 'spyral';

			var dfd = new Ext.Deferred();
			outputPromise.then(function(output) {
				var input = wrapper.getInput();
	
				var corpusButton = this.exportWin.down('#corpus');
				var openButton = this.exportWin.down('#open');
				corpusButton.setHidden(true);
				openButton.setHidden(false);

				var fileName;
				var fileType;
				var fileContent;
				if (mode === 'file' || mode === 'corpus') {
					openButton.setHidden(true);
					if (mode === 'file') {
						fileName = input.fileName;
					} else {
						fileName = 'SpyralCorpus-'+input.corpusId;
					}
					fileType = output.type;
					fileContent = output;
				} else if (mode === 'javascript' || mode === 'table') {
					// corpus check
					if (Spyral.Util.isObject(output) && output.hasOwnProperty('corpusid') && Spyral.Util.isString(output.corpusid)) {
						corpusButton.setHidden(false);
						corpusButton.setHandler(function(btn) {
							var url = Voyant.application.getBaseUrlFull()+'?corpus='+output.corpusid;
							window.open(url);
						});
					}
	
					if (Spyral.Util.isUndefined(output)) {
						// code output is either a document or hasn't been run yet
						// try getContent fallback
						output = wrapper.getContent().output;
					}
					
					if (Spyral.Util.isObject(output) || Spyral.Util.isArray(output)) {
						fileName = notebookId+'_'+wrapper.getCellId()+'.json';
						fileType = 'application/json';
						fileContent = JSON.stringify(output);
					} else if (Spyral.Util.isNode(output) || (Spyral.Util.isString(output) && output.match(/<\/?\w+.*?>/g) !== null)) {
						fileName = notebookId+'_'+wrapper.getCellId()+'.html';
						fileType = 'text/html';
						if (Spyral.Util.isString(output)) {
							fileContent = output;
						} else {
							fileContent = new XMLSerializer().serializeToString(output);
						}
					} else {
						fileName = notebookId+'_'+wrapper.getCellId()+'.txt';
						fileType = 'text/plain';
						fileContent = output;
					}
				} else {
					fileName = notebookId+'_'+wrapper.getDataName()+'.'+mode;
					fileType = 'text/'+mode;
					fileContent = input;
					if (mode === 'json') {
						fileType = 'application/json';
					} else if (mode === 'text') {
						fileName = notebookId+'_'+wrapper.getDataName()+'.txt';
						fileType = 'text/plain';
					}
				}
				
				var file = new File([fileContent], fileName, {lastModified: new Date().getTime(), type: fileType});
	
				this.exportWin.down('#open').setHandler(function(btn) {
					var myWindow = window.open();
					myWindow.document.write(fileContent);
					myWindow.document.close();
					myWindow.focus();
					btn.up('window').close();
				});
	
				this.exportWin.addListener('show', function() {
					var url = URL.createObjectURL(file);
					this.exportWin.down('#download').getEl().set({
						download: fileName,
						href: url
					});
				}, this, { single: true });

				dfd.resolve(this.exportWin);

			}.bind(this), function(err) {
				dfd.reject(err);
			});

			return dfd.promise;
		}
	},
	constructor: function(config) {
		Ext.apply(config, {
			text: this.localize('text'),
			// tooltip: this.localize('tip')
		})
		this.callParent(arguments);
	},
	glyph: 'xf08e@FontAwesome',
	handler: function(cmp) {
		Voyant.notebook.editor.button.Export.getExportWindow(cmp).then(function(exportWin) {
			exportWin.show();
		}, function(err) {
			Ext.Msg.show({
				title: 'Export Error',
				msg: 'There was an error exporting the cell contents.'+"<br><pre style='color: red'>"+err+"</pre>",
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR
			});
		});
	}
});

Ext.define('Voyant.notebook.editor.button.ExportResults', {
	extend: 'Ext.button.Button',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.notebookwrapperexportresults',
	statics: {
		i18n: {
			text: 'Export Results',
		}
	},
	glyph: 'xf08e@FontAwesome',
	constructor: function(config) {
		config.tooltip = this.localize('text');
		this.callParent(arguments);
	},
	handler: function(cmp) {
		// hack to get the export menu item so we can pass it to the export window function
		// TODO need a better way to do this
		var exportMenuItem = Voyant.notebook.editor.EditorWrapper.toolbarLeft.down('notebookwrapperexport');
		Voyant.notebook.editor.button.Export.getExportWindow(exportMenuItem).then(function(exportWin) {
			exportWin.show();
		}, function(err) {
			Ext.Msg.show({
				title: 'Export Error',
				msg: 'There was an error exporting the cell contents.'+"<br><pre style='color: red'>"+err+"</pre>",
				buttons: Ext.MessageBox.OK,
				icon: Ext.MessageBox.ERROR
			});
		});
	}
});