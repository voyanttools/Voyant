Ext.define('Voyant.notebook.editor.button.Export', {
	extend: 'Ext.button.Button',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.notebookwrapperexport',
	statics: {
		i18n: {
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

			var wrapper = instance.up('notebookrunnableeditorwrapper');
			
			var notebook = wrapper.up('notebook');
			var notebookId = notebook.getNotebookId() || 'spyral';
			
			var input = wrapper.getInput();
			var output = wrapper.getOutput();
			var mode = wrapper.getMode();

			var corpusButton = this.exportWin.down('#corpus');
			var openButton = this.exportWin.down('#open');
			corpusButton.setHidden(true);
			openButton.setHidden(false);

			var fileName;
			var fileType;
			var fileContent;
			if (mode === 'file') {
				openButton.setHidden(true);
				fileName = input.fileName;
				fileType = output.type;
				fileContent = output;
			} else if (mode === 'javascript') {
				// corpus check
				if (Spyral.Util.isObject(output) && output.hasOwnProperty('corpusid') && Spyral.Util.isString(output.corpusid)) {
					corpusButton.setHidden(false);
					corpusButton.setHandler(function(btn) {
						var url = Voyant.application.getBaseUrlFull()+'?corpus='+output.corpusid;
						window.open(url);
					});
				}

				if (Spyral.Util.isUndefined(output)) {
					// output is probably a document and couldn't be sent from sandbox
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

			return this.exportWin;
		}
	},
	constructor: function(config) {
		Ext.apply(config, {
			tooltip: this.localize('tip')
		})
		this.callParent(arguments);
	},
	glyph: 'xf08e@FontAwesome',
	listeners: {
		click: function(cmp) {
			var wrapper = cmp.up('notebookrunnableeditorwrapper');
			wrapper.results.updateCachedOutput().then(function(output) {
				Voyant.notebook.editor.button.Export.getExportWindow(cmp).show();
			});
		}
	}
})