Ext.define('Voyant.panel.EntitiesSet', {
	extend: 'Ext.panel.Panel',
	requires: ['Voyant.panel.Entities','Voyant.panel.Reader', 'Voyant.panel.Trends'],
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.entitiesset',
	statics: {
		i18n: {
		},
		glyph: 'xf17a@FontAwesome'
	},
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},
	layout: 'hbox',
	header: false,
	items: [{
		width: '100%',
		height: '100%',
		split: {width: 5},
		layout: 'hbox',
		flex: 3,
		defaults: {
			width: '100%',
			height: '100%',
			flex: 1,
			frame: true,
			border: true
		},
		items: [{
			xtype: 'entities'
		}]
	},{
		layout: 'vbox',
		align: 'stretch',
		width: '100%',
		height: '100%',
		flex: 2,
		defaults: {
			width: '100%',
			height: '100%',
			flex: 1,
			frame: true,
			border: true
		},
		items: [{
			xtype: 'reader',
			enableEntitiesList: false,
			listeners: {
				boxready: function(cmp) {
					cmp.down('#nerServiceParent').hide();
				}
			}
		},{
			xtype: 'trends'
		}]
	}],
	listeners: {
		entitiesClicked: function(src, ents) {
		},
		entityLocationClicked: function(src, ent) {
		},
		scope: this
	}
})