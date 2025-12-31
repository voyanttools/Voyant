Ext.define("Voyant.notebook.editor.button.Remove", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperremove',
	statics: {
		i18n: {
			text: 'Remove'
		}
	},
	constructor: function(config) {
		Ext.apply(this, {
			tooltip: this.localize('text')
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
});

Ext.define("Voyant.notebook.editor.button.RemoveResults", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperremoveresults',
	statics: {
		i18n: {
			text: 'Remove Results'
		}
	},
	constructor: function(config) {
		Ext.apply(this, {
			tooltip: this.localize('text')
		})
		this.callParent(arguments);
	},
	glyph: 'xf014@FontAwesome',
	handler: function(evt) {
		var results = Voyant.notebook.editor.SandboxWrapper.currentResults;
		if (results) {
			results.clear();
			results.hide();
			Voyant.notebook.editor.SandboxWrapper.hideToolbar(true);
		} else {
			console.warn('no results!')
		}
	}
});