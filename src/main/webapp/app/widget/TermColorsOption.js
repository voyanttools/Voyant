Ext.define('Voyant.widget.TermColorsOption', {
	extend: 'Ext.container.Container',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.termcolorsoption',
	layout: 'hbox',
	margin: '0 0 5px 0',
	statics: {
			i18n: {
				label: 'Term Colors',
				none: 'None',
				categories: 'Categories Only',
				categoriesTerms: 'Categories and Terms',
				applyGlobally: 'apply globally'
			}
	},
	initComponent: function(config) {
		var me = this;
		Ext.apply(me, {
			items: [{
				xtype: 'combo',
				queryMode: 'local',
				value: 'categories',
				fieldLabel: this.localize('label'),
				labelAlign: 'right',
				name: 'termColors',
				displayField: 'name',
				valueField: 'value',
				store: {
					fields: ['name', 'value'],
					data: [{
						name: this.localize('categories'),
						value: 'categories'
					},{
						name: this.localize('categoriesTerms'),
						value: 'terms'
					},{
						name: this.localize('none'),
						value: ''
					}]
				}
			}, {width: 20}, {
				xtype: 'checkbox',
				name: 'termColorsGlobal',
				checked: true,
				boxLabel: this.localize('applyGlobally')
			}],
			listeners: {
				boxready: function(cmp) {
					var win = cmp.up('window');
					var value = win.panel.getApiParam('termColors');
					cmp.down('combo').setValue(value);
				}
			}
		})
		me.callParent(arguments);
	}
});

/**
 * A column field for use in grid panels.
 * Uses the term's color for display.
 */
Ext.define('Voyant.widget.ColoredTermField', {
	extend: 'Ext.grid.column.Template',
	alias: 'widget.coloredtermfield',
	initComponent: function() {
		var me = this;
		var dataIndex = me.dataIndex;
		Ext.apply(me, {
			tpl: new Ext.XTemplate('<span style="{[this.getColorStyle(values.'+dataIndex+')]}; padding: 1px 3px; border-radius: 2px;">{'+dataIndex+'}</span>', {
				getColorStyle: function(term) {
					var panel = me.up('panel');
					var termColors = panel.getApiParam('termColors');
					if (termColors !== undefined && termColors !== '' &&
						(termColors === 'categories' && panel.getApplication().getCategoriesManager().getCategoriesForTerm(term).length > 0) ||
						(termColors === 'terms')) {
						var bgColor = panel.getApplication().getColorForTerm(term);
						var textColor = panel.getApplication().getTextColorForBackground(bgColor);
						return 'background-color: rgb('+bgColor.join(',')+'); color: rgb('+textColor.join(',')+')';
					} else {
						return 'color: rgb(0,0,0)';
					}
				}
			})
		});
		me.callParent(arguments);
	}
});
