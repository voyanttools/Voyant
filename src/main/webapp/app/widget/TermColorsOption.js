Ext.define('Voyant.widget.TermColorsOption', {
	extend: 'Ext.container.Container',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.termcolorsoption',
	layout: 'hbox',
	margin: '0 0 5px 0',
	statics: {
			i18n: {
				label: 'Term Colors',
				show: 'Show',
				hide: 'Hide',
				applyGlobally: 'apply globally'
			}
	},
	initComponent: function(config) {
		var me = this;
		Ext.apply(me, {
			items: [{
				xtype: 'radiogroup',
				fieldLabel: this.localize('label'),
				labelAlign: 'right',
				name: 'useTermColors',
				items: [
					{ boxLabel: this.localize('show'), name: 'useTermColors', inputValue: true, margin: '0 10 0 0' },
					{ boxLabel: this.localize('hide'), name: 'useTermColors', inputValue: false }
				],
			}, {width: 20}, {
				xtype: 'checkbox',
				name: 'termColorsGlobal',
				checked: true,
				boxLabel: this.localize('applyGlobally')
			}],
			listeners: {
				boxready: function(cmp) {
					var win = cmp.up('window');
					var value = win.panel.getApiParam('useTermColors');
					cmp.down('radiogroup').setValue({useTermColors: value});
				}
			}
		})
		me.callParent(arguments);
	}
})