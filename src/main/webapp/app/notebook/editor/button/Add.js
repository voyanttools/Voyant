Ext.define("Voyant.notebook.editor.button.Add", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperadd',
	statics: {
		i18n: {
		}
	},
	constructor: function(config) {
		config = config || {};
		config.tooltip = this.localize('tip');
		this.callParent(arguments);
	},
	glyph: 'xf067@FontAwesome',
	handler: function(btn, e) {
		btn.findParentByType('notebook').fireEvent("notebookWrapperAdd", btn.findParentByType("notebookeditorwrapper"), e);
	}
})