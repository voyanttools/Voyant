Ext.define("Voyant.notebook.editor.button.MoveUp", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrappermoveup',
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
	glyph: 'xf062@FontAwesome',
	textAlign: 'left',
	listeners: {
		click: function(evt) {
			var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
        	ed.findParentByType('notebook').fireEvent("notebookWrapperMoveUp", ed);
			Voyant.notebook.editor.EditorWrapper.hideToolbars(evt, true);
		}
	}
})