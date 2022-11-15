Ext.define("Voyant.notebook.editor.button.Remove", {
	extend: "Ext.menu.Item",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperremove',
	statics: {
		i18n: {
			text: 'Remove'
		}
	},
	constructor: function(config) {
    	Ext.apply(this, {
			text: this.localize('text'),
    		// tooltip: this.localize('tip')
    	})
        this.callParent(arguments);
	},
	glyph: 'xf014@FontAwesome',
	handler: function(evt) {
		var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
		Ext.Msg.show({
			buttons: Ext.Msg.OKCANCEL,
			icon: Ext.MessageBox.QUESTION,
			msg: this.localize("confirmRemove"),
			title: this.localize("confirmRemoveTitle"),
			fn: function(buttonId) {
				if (buttonId === 'ok') {
					ed.findParentByType('notebook').fireEvent("notebookWrapperRemove", ed);
					Voyant.notebook.editor.EditorWrapper.hideToolbars(evt, true);
				}
			},
			scope: this
		})
	}
})