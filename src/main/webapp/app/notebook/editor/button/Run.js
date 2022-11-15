Ext.define("Voyant.notebook.editor.button.Run", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperrun',
	statics: {
		i18n: {
			text: 'Run'
		}
	},
	glyph: 'xf04b@FontAwesome',
	constructor: function(config) {
		config = config || {};
		config.tooltip = this.localize('tip');
		// config.text = this.localize('text');
		this.callParent(arguments);
	},
	handler: function(btn, e) {
		var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
		ed.up('notebook')._run([ed]);
	}
})