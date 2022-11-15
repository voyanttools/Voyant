Ext.define("Voyant.notebook.editor.button.RunUntil", {
	extend: "Ext.menu.Item",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperrununtil',
	statics: {
		i18n: {
			text: "Run...",
			tip: "Run multiple cells",
			runUntil: "Run up to here",
			runUntilTip: "Run previous code cells and this one.",
			runFrom: "Run from here onwards",
			runFromTip: "Run this and following code cells."
		}
	},
	glyph: 'xf050@FontAwesome',
	constructor: function(config) {
		config = config || {};
		config.text = this.localize('text');
		// config.tooltip = this.localize('tip');
		config.menu = {
			items: [{
				text: this.localize("runUntil"),
				// tooltip: this.localize("runUntilTip"),
				glyph: 'xf049@FontAwesome',
				handler: function() {
					var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
					ed.up('notebook').runUntil(ed);
				}
			},{
				text: this.localize("runFrom"),
				// tooltip: this.localize("runFromTip"),
				glyph: 'xf050@FontAwesome',
				handler: function() {
					var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
					ed.up('notebook').runFrom(ed);
				}
			}]
		}

		this.callParent(arguments);
	}
})