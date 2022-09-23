Ext.define("Voyant.notebook.editor.TextEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	requires: ["Voyant.notebook.editor.TextEditor"],
	alias: "widget.notebooktexteditorwrapper",
	cls: 'notebook-text-wrapper',
	config: {
	},
	minHeight: 50,
	constructor: function(config) {
		Ext.apply(this, {
			items: [{
				xtype: 'notebooktexteditor',
				content: Ext.Array.from(config.input).join(""),
				parentWrapper: this
			}]
		});
        this.callParent(arguments);
	},
	
	getContent: function() {
		return this.items.get(0).getContent();
	}
	
})