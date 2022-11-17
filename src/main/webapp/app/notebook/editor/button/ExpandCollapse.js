Ext.define("Voyant.notebook.editor.button.ExpandCollapse", {
	extend: "Ext.menu.Item",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperexpandcollapse',
	statics: {
		i18n: {
			collapse: 'Collapse Editor',
			expand: 'Expand Editor'
		}
	},
	constructor: function(config) {
		config = config || {};
		config.text = this.localize('collapse');
		this.callParent(arguments);
	},
	isCollapsed: false,
	glyph: 'xf066@FontAwesome',
	handler: function(btn, e) {
		var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
		if (btn.isCollapsed) {
			ed.expand();
		} else {
			ed.collapse();
		}
		btn.setCollapsed(!btn.isCollapsed);
	},
	setCollapsed: function(isCollapsed) {
		this.isCollapsed = isCollapsed;
		this.setGlyph(isCollapsed ? 'xf065@FontAwesome' : 'xf066@FontAwesome');
		this.setText(isCollapsed ? this.localize('expand') : this.localize('collapse'));
		// this.setTooltip(isCollapsed ? this.localize('expand') : this.localize('collapse'));
	}
});
