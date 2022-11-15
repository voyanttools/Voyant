Ext.define("Voyant.notebook.editor.button.CodeConfig", {
	extend: "Ext.menu.Item",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookcodeconfig',
	statics: {
		i18n: {
			text: 'Config',
			tip: "Configuration Options",
			title: "Cell Mode",
			modeCode: 'Code',
			modeJavascript: 'Javascript (default)',
			modeData: 'Data',
			modeFile: 'File',
			modeJson: 'JSON',
			modeText: 'Text',
			modeXml: 'XML',
			modeHtml: 'HTML',
			ok: "OK",
			cancel: "Cancel"
		},
		configWin: undefined,
		initWindow: function(buttonInstance) {
			if (Voyant.notebook.editor.button.CodeConfig.configWin === undefined) {
				Voyant.notebook.editor.button.CodeConfig.configWin = new Ext.Window({
					title: buttonInstance.localize('title'),
					closeAction: 'hide',
					layout: 'fit',
					width: 240,
					items: [{
						xtype: 'form',
						layout: {
							type: 'vbox',
							align: 'stretch'
						},
						bodyPadding: 10,
						items: [{
							xtype: 'fieldset',
							title: buttonInstance.localize("modeCode"),
							items: [{
								xtype : 'radiofield',
								boxLabel : buttonInstance.localize('modeJavascript'),
								name  : 'codeMode',
								inputValue: 'javascript',
								flex  : 1
							}]
						},{
							xtype: 'fieldset',
							title: buttonInstance.localize("modeData"),
							items: [{
								xtype : 'radiofield',
								boxLabel : 'Corpus',
								name  : 'codeMode',
								inputValue: 'corpus',
								flex  : 1
							},{
								xtype : 'radiofield',
								boxLabel : buttonInstance.localize('modeFile'),
								name  : 'codeMode',
								inputValue: 'file',
								flex  : 1
							},{
								xtype : 'radiofield',
								boxLabel : buttonInstance.localize('modeJson'),
								name  : 'codeMode',
								inputValue: 'json',
								flex  : 1
							},{
								xtype : 'radiofield',
								boxLabel : buttonInstance.localize('modeText'),
								name  : 'codeMode',
								inputValue: 'text',
								flex  : 1
							},/*{
								xtype : 'radiofield',
								boxLabel : buttonInstance.localize('modeCsv'),
								name  : 'codeMode',
								inputValue: 'csv',
								flex  : 1													
							},{
								xtype : 'radiofield',
								boxLabel : buttonInstance.localize('modeTsv'),
								name  : 'codeMode',
								inputValue: 'tsv',
								flex  : 1													
							},*/{
								xtype : 'radiofield',
								boxLabel : buttonInstance.localize('modeXml'),
								name  : 'codeMode',
								inputValue: 'xml',
								flex  : 1
							},{
								xtype : 'radiofield',
								boxLabel : buttonInstance.localize('modeHtml'),
								name  : 'codeMode',
								inputValue: 'html',
								flex  : 1
							}]
						}]
					}],
					buttons: [{
						text: buttonInstance.localize('ok'),
						itemId: 'ok'
					},{
						text:  buttonInstance.localize('cancel'),
						handler: function(btn) {
							btn.up('window').close();
						}
					}]
				});
			}
		},
		showConfigWindow: function(codeEditorInstance) {
			Voyant.notebook.editor.button.CodeConfig.configWin.down('radiofield[name=codeMode][inputValue="'+codeEditorInstance.getMode()+'"]').setValue(true);
			Voyant.notebook.editor.button.CodeConfig.configWin.down('button#ok').setHandler(function(btn) {
				var win = btn.up('window');
				var form = win.down('form');
				if (form.isDirty()) {
					codeEditorInstance.up('notebook').setIsEdited(true);
					var values = form.getValues();
					codeEditorInstance.switchModes(values.codeMode);
					
				}
				win.close();
			});
			Voyant.notebook.editor.button.CodeConfig.configWin.show();
		}
	},
	constructor: function(config) {
		Ext.apply(this, {
			text: this.localize('text'),
			// tooltip: this.localize('tip')
		})
		
		Voyant.notebook.editor.button.CodeConfig.initWindow(this);

		this.callParent(arguments);
	},
	glyph: 'xf013@FontAwesome',
	handler: function(btn, e) {
		Voyant.notebook.editor.button.CodeConfig.showConfigWindow(Voyant.notebook.editor.EditorWrapper.currentEditor);
	}
});
