Ext.define("Voyant.notebook.editor.button.RunUntil", {
	extend: "Ext.button.Button",
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperrununtil',
	statics: {
		i18n: {
			tip: "Run multiple cells",
			runUntil: "Run up to here",
			runUntilTip: "Run previous code blocks and this one.",
			runFrom: "Run from here onwards",
			runFromTip: "Run this and following code blocks."
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
					var rew = btn.findParentByType("notebookrunnableeditorwrapper");
					btn.up('notebook').runUntil(rew);
				}
			},{
				text: this.localize("runFrom"),
				tooltip: this.localize("runFromTip"),
				glyph: 'xf050@FontAwesome',
				handler: function() {
					var rew = btn.findParentByType("notebookrunnableeditorwrapper");
					btn.up('notebook').runFrom(rew);
				}
			}]
		});

		this.callParent(arguments);
	},
	handler: function(btn, ev) {
		btn.runMenu.showAt(ev.pageX, ev.pageY)
	}
})