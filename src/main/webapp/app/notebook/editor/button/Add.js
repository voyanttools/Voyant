Ext.define("Voyant.notebook.editor.button.Add", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperadd',
	statics: {
		i18n: {
			addTip: 'Add New Cell',
			addText: 'Add Text',
			addCode: 'Add Code'
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
						var cmp = notebook.addText('',ed.getIndex()+1);
						cmp.getTargetEl().scrollIntoView(notebook.getTargetEl(), null, true, true);
						notebook.redoOrder();
					}
				},{
					text: this.localize('addCode'),
					glyph: 'xf121@FontAwesome',
					handler: function() {
						var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
						var notebook = ed.findParentByType('notebook');
						var cmp = notebook.addCode('',ed.getIndex()+1);
						cmp.getTargetEl().scrollIntoView(notebook.getTargetEl(), null, true, true);
						notebook.redoOrder();
					}
				}]
			}
		});

		this.callParent(arguments);
	},
	glyph: 'xf067@FontAwesome'
})