Ext.define("Voyant.notebook.editor.button.MoveDown", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappermovedown',
	statics: {
		i18n: {
		}
	},
	constructor: function(config) {
    	Ext.apply(this, {
    		tooltip: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	glyph: 'xf063@FontAwesome',
	textAlign: 'left',
	listeners: {
		click: function(evt) {
			var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
        	ed.findParentByType('notebook').fireEvent("notebookWrapperMoveDown", ed);
			Voyant.notebook.editor.EditorWrapper.hideToolbars(evt, true);
		}
	}
})