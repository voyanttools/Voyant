Ext.define("Voyant.notebook.editor.button.Warning", {
	extend: 'Ext.button.Button',
	mixins: ["Voyant.util.Localization"],
	alias: 'widget.notebookwrapperwarning',
	statics: {
		i18n: {
			viewWarnings: 'View Warning(s)',
			generalWarning: 'Warning: {warningInfo}',
			serializationWarning: 'The variable "{warningInfo}" cannot be passed between cells.',
			loadVariableWarning: 'The variable "{warningInfo}" could not be loaded.'
		}
	},
	constructor: function(config) {
		config = config || {};
		config.tooltip = this.localize('viewWarnings');
		this.callParent(arguments);
	},
	itemId: 'warnings',
	glyph: 'xf12a@FontAwesome',
	componentCls: 'warning',
	hidden: true,
	config: {
		warnings: undefined
	},
	handler: function(btn) {
		var warnings = btn.getWarnings();
		if (warnings !== undefined) {
			Ext.Msg.show({
				title: 'Warning',
				message: warnings,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.INFO
			});
		}
	},
	applyWarnings: function(warningsArray) {
		if (warningsArray === undefined) {
			this.hide();
			return undefined;
		}

		var warningsContent = [];
		warningsArray.forEach(function(warning) {
			switch(warning.type) {
				case 'serialization':
					warningsContent.push(this.localize('serializationWarning').replace('{warningInfo}', warning.warningInfo));
					break;
				case 'loadVariable':
					warningsContent.push(this.localize('loadVariableWarning').replace('{warningInfo}', warning.warningInfo));
					break;
			}
		}, this);

		this.show();
		return '<p>'+warningsContent.join('</p><p>')+'</p>';
	}
});
