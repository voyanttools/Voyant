Ext.define("Voyant.notebook.editor.button.MoveUp", {
	extend: "Ext.menu.Item",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappermoveup',
	statics: {
		i18n: {
			text: 'Move Up'
		}
	},
	constructor: function(config) {
    	Ext.apply(this, {
			text: this.localize('text'),
    		// tooltip: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	glyph: 'xf062@FontAwesome',
	handler: function(evt) {
		var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
		ed.findParentByType('notebook').fireEvent("notebookWrapperMoveUp", ed);
		Voyant.notebook.editor.EditorWrapper.hideToolbars(evt, true);
	}
})