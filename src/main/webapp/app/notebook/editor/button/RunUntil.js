Ext.define("Voyant.notebook.editor.button.RunUntil", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperrununtil',
	statics: {
		i18n: {
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
		config.tooltip = this.localize('tip');

		var btn = this;
		this.runMenu = Ext.create('Ext.menu.Menu', {
			items: [{
				text: this.localize("runUntil"),
				tooltip: this.localize("runUntilTip"),
				glyph: 'xf049@FontAwesome',
				handler: function() {
					btn.runMenu.editor.up('notebook').runUntil(btn.runMenu.editor);
				}
			},{
				text: this.localize("runFrom"),
				tooltip: this.localize("runFromTip"),
				glyph: 'xf050@FontAwesome',
				handler: function() {
					btn.runMenu.editor.up('notebook').runFrom(btn.runMenu.editor);
				}
			}]
		});

		this.callParent(arguments);
	},
	handler: function(btn, ev) {
		var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
		btn.runMenu.editor = ed;
		btn.runMenu.showAt(ev.pageX, ev.pageY)
	}
})