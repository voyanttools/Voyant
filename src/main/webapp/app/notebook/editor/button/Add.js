Ext.define("Voyant.notebook.editor.button.Add", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperadd',
	statics: {
		i18n: {
			addTip: 'Add New Cell',
			addText: 'Add Text',
			addCode: 'Add Code',
			addData: 'Add Data'
		}
	},
	constructor: function(config) {
		config = config || {};

		Ext.apply(config, {
			tooltip: this.localize('addTip'),
			arrowVisible: false,
			menuAlign: 'tr-br?',
			menu: {
				items: [{
					text: this.localize('addText'),
					glyph: 'xf0f6@FontAwesome',
					handler: function() {
						var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
						var notebook = ed.findParentByType('notebook');
						var cmp = notebook.addText('', ed.getIndex()+1);
						cmp.getTargetEl().scrollIntoView(notebook.getTargetEl(), null, true, true);
						notebook.redoOrder();
					}
				},{
					text: this.localize('addCode'),
					glyph: 'xf121@FontAwesome',
					handler: function() {
						var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
						var notebook = ed.findParentByType('notebook');
						var cmp = notebook.addCode('', ed.getIndex()+1);
						cmp.getTargetEl().scrollIntoView(notebook.getTargetEl(), null, true, true);
						notebook.redoOrder();
					}
				},{
					text: this.localize('addData'),
					glyph: 'xf1b2@FontAwesome',
					menu: {
						items: [{
							text: 'Corpus',
							data: 'corpus',
							margin: '0 0 0 -20px'
						},{
							text: 'File',
							data: 'file',
							margin: '0 0 0 -20px'
						},{
							text: 'JSON',
							data: 'json',
							margin: '0 0 0 -20px'
						},{
							text: 'Text',
							data: 'text',
							margin: '0 0 0 -20px'
						},{
							text: 'Table',
							data: 'table',
							margin: '0 0 0 -20px'
						},{
							text: 'XML',
							data: 'xml',
							margin: '0 0 0 -20px'
						}],
						listeners: {
							click: function(menu, item) {
								var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
								var notebook = ed.findParentByType('notebook');
								var mode = item.getInitialConfig('data');
								if (mode !== undefined) {
									var cmp = notebook.addData('', ed.getIndex()+1, undefined, {mode: mode});
									cmp.getTargetEl().scrollIntoView(notebook.getTargetEl(), null, true, true);
									notebook.redoOrder();
								}
							}
						}
					}
				}]
			}
		});

		this.callParent(arguments);
	},
	glyph: 'xf067@FontAwesome'
})