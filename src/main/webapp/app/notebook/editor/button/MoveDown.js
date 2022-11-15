Ext.define("Voyant.notebook.editor.button.MoveDown", {
	extend: "Ext.menu.Item",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappermovedown',
	statics: {
		i18n: {
			text: 'Move Down'
		}
	},
	constructor: function(config) {
    	Ext.apply(this, {
			text: this.localize('text'),
    		// tooltip: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	glyph: 'xf063@FontAwesome',
	handler: function(evt) {
		var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
		ed.findParentByType('notebook').fireEvent("notebookWrapperMoveDown", ed);
		Voyant.notebook.editor.EditorWrapper.hideToolbars(evt, true);
	}
})