Ext.define('Voyant.widget.TotalPropertyStatus', {
    extend: 'Ext.Component',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.totalpropertystatus',
	statics: {
		i18n: {
		}
	},
    initComponent: function() {
        Ext.applyIf(this, {
            tpl: this.localize('totalPropertyStatus'),
            itemId: 'totalpropertystatus',
            style: 'margin-right:5px',
            listeners: {
            	afterrender: function(cmp) {
            		var grid = cmp.up('grid')
            		if (grid) {
            			var store = grid.getStore();
                        cmp.update({count: store.getTotalCount()});
            			store.on('datachanged', function(store) {
                            cmp.update({count: store.getTotalCount()});
                        });
            		}
            	}
            }
        });
        this.callParent(arguments);
    }
});
