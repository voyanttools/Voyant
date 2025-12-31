Ext.define('Voyant.widget.ColorPaletteOption', {
    extend: 'Ext.container.Container',
    mixins: ['Voyant.util.Localization'],
    alias: 'widget.colorpaletteoption',
    layout: 'hbox',
    statics: {
    	i18n: {
			presetPalettes: 'Preset Palettes',
			paletteSize: 'Palette Size',
			categorical: 'Categorical',
			sequentialSingle: 'Sequential (Single Value)',
			sequentialMulti: 'Sequential (Multi Value)',
			sequentialDiverging: 'Sequential (Diverging Value)',
			cyclical: 'Cyclical'
    	}
    },
    
    paletteTpl: new Ext.XTemplate(
		'<tpl for=".">',
			'<div class="color" style="background-color: rgb({color});"></div>',
		'</tpl>'
	),
	paletteStore: new Ext.data.ArrayStore({
        fields: ['color']
    }),

	d3PaletteTreeData: [],
    
    editPaletteWin: null,
    spectrum: null,
    
    initComponent: function(config) {
    	var me = this;

    	var app = this.up('window').panel.getApplication();
    	var data = [];
    	for (var key in app.getPalettes()) {
    		data.push({name: key, value: key});
    	}
    	
		if (this.d3PaletteTreeData.length === 0) {
			Object.entries(app.d3Palettes).forEach(function(entry) {
				var palCategory = entry[0];
				var palNames = entry[1];
				var parent = {
					text: this.localize(palCategory),
					expanded: false,
					children: []
				}
				var isCategorical = palCategory === 'categorical';
				parent.children = palNames.map(function(palName) {
					// categorical palettes start with _ to mark them as non-interpolatable
					return {text: palName, value: (isCategorical?'_':'')+palName, leaf: true, glyph: 'xf1fc@FontAwesome', cls: 'd3-palette-item'};
				});
				this.d3PaletteTreeData.push(parent);
			}, this);
		}

		var value = app.getApiParam('palette');
    	Ext.apply(me, {
			items: [{
				xtype: 'combo',
				queryMode: 'local',
				value: value,
				triggerAction: 'all',
				editable: true,
				fieldLabel: me.localize('palette'),
				labelAlign: 'right',
				name: 'palette',
				displayField: 'name',
				valueField: 'value',
				store: {
					fields: ['name', 'value'],
					data: data
				}
			}, {width: 10}, {xtype: 'tbspacer'}, {
				xtype: 'button',
				text: this.localize('editList'),
				ui: 'default-toolbar',
				handler: this.editPalette,
				scope: this
			}]
    	});
        me.callParent(arguments);
    },
    
    editPalette: function() {
    	var value = this.down('combo').getValue();
    	this.loadPalette(value);
    	
    	this.editPaletteWin = Ext.create('Ext.window.Window', {
			title: this.localize('paletteEditor'),
			modal: true,
			height: 400,
			width: 680,
			layout: {
				type: 'hbox',
				align: 'stretch',
				pack: 'center',
				padding: '5 10'
			},
			items:[{
				width: 225,
				margin: '0 10 0 0',
				padding: '0 5 0 0',
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				items: [{
					xtype: 'component',
					html: this.localize('presetPalettes')
				},{
					itemId: 'd3PaletteNames',
					flex: 1,
					xtype: 'treepanel',
					scrollable: 'y',
					rootVisible: false,
					root: {expanded: true, children: this.d3PaletteTreeData},
					listeners: {
						beforeselect: function(view, record) {
							return record.get('leaf');
						},
						selectionchange: function(view, records) {
							if (records.length > 0) {
								if (records[0].get('value') === null || records[0].get('value').startsWith('_')) {
									this.editPaletteWin.down('#d3PaletteSize').disable();
								} else {
									this.editPaletteWin.down('#d3PaletteSize').enable();
								}
								this.loadD3Palette();
							}
						},
						scope: this
					}
				},{
					itemId: 'd3PaletteSize',
					margin: '5 0',
					xtype: 'numberfield',
					fieldLabel: this.localize('paletteSize'),
					labelAlign: 'right',
					minValue: 3,
					maxValue: 40,
					value: 10,
					disabled: true,
					listeners: {
						change: function(field, newValue, oldValue) {
							if (field.isValid()) {
								this.loadD3Palette();
							}
						},
						scope: this
					}
				}]
			},{
				itemId: 'paletteSwatches',
				xtype: 'dataview',
				flex: 1,
				scrollable: 'y',
				store: this.paletteStore,
				tpl: this.paletteTpl,
				itemSelector: 'div.color',
				overItemCls: 'over',
				selectedItemCls: 'selected',
				selectionModel: {
					mode: 'SINGLE'
				},
				listeners: {
					selectionchange: function(viewmodel, selected, opts) {
						if (selected[0] !== undefined) {
							var color = selected[0].get('color');
							var parentPanel = this.up('window').panel;
							var hex = parentPanel.getApplication().rgbToHex(color);
							this.spectrum.spectrum('set', hex);
							this.editPaletteWin.down('#removeButton').enable();
						} else {
							this.editPaletteWin.down('#removeButton').disable();
						}
					},
					scope: this
				}
			},{
				width: 210,
				layout: {
					type: 'vbox',
					align: 'middle'
				},
				margin: '0 0 0 10',
				padding: '0 0 0 5',
				items: [{
					itemId: 'colorEditor',
					width: 200,
					height: 200,
					margin: '0 -10 10 20',
					html: '<input type="text" style="display: none;" />'
				},{
					xtype: 'button',
					width: 190,
					text: this.localize('add'),
					margin: '0 0 10 0',
					handler: function(btn) {
						var color = this.spectrum.spectrum('get').toRgb();
						this.paletteStore.add([[[color.r, color.g, color.b]]]);
					},
					scope: this
				},{
					itemId: 'removeButton',
					xtype: 'button',
					width: 190,
					disabled: true,
					text: this.localize('remove'),
					handler: function(btn) {
						var dv = this.editPaletteWin.down('#paletteSwatches');
						var sel = dv.getSelection()[0];
						if (sel !== undefined) {
							this.paletteStore.remove(sel);
						}
					},
					scope: this
				}]
			}],
			buttons: [{
				text: this.localize('clear'),
				ui: 'default-toolbar',
				handler: function(btn) {
					this.paletteStore.removeAll();
				},
				scope: this
			},'->',{
				text: this.localize('cancel'),
				ui: 'default-toolbar',
				handler: function(btn) {
					btn.up('window').close();
				},
				scope: this
			},{
				text: this.localize('saveNewPalette'),
				handler: function(btn) {
					this.savePalette();
					btn.up('window').close();
				},
				scope: this
			}],
			listeners: {
				close: function(panel) {
					if (this.spectrum) {
						this.spectrum.spectrum('destroy');
						this.spectrum = null;
					}
				},
				scope: this
			}
    	}).show();
    	
    	this.initSpectrum();
    },
    
    setColorForSelected: function(color) {
    	if (this.spectrum !== null) { // need check due to https://github.com/bgrins/spectrum/issues/387
			var rgb = color.toRgb();
			var rgbA = [rgb.r, rgb.g, rgb.b];
			var dv = this.editPaletteWin.down('#paletteSwatches');
			var sel = dv.getSelection()[0];
			if (sel !== undefined) {
				sel.set('color', rgbA);
			}
    	}
	},
    
	initSpectrum: function() {
		if (this.spectrum === null) {
			var editor = this.editPaletteWin.down('#colorEditor');
			var input = editor.el.down('input');
			this.spectrum = $(input.dom).spectrum({
				flat: true,
				showInput: true,
				showButtons: false,
				preferredFormat: 'hex',
				change: this.setColorForSelected.bind(this),
				move: this.setColorForSelected.bind(this)
			});
		}
	},
	
    loadPalette: function(paletteId) {
    	var application = this.up('window').panel.getApplication();
    	
    	var palette = application.getColorPalette(paletteId);

		if (palette == undefined) {
			application.loadCustomColorPalette(paletteId).then(function(id) {
				this.loadPalette(paletteId);
			}.bind(this), function() {
				// error loading palette
			})
		} else {
			var paletteData = palette.map(function(c) { return [c]});
			this.paletteStore.loadRawData(paletteData);
		}
    },

	loadD3Palette: function() {
		var application = this.up('window').panel.getApplication();

		var palName = '';
		var palRecord = this.editPaletteWin.down('#d3PaletteNames').getSelection()[0];
		if (palRecord === null) {
			return;
		} else {
			palName = palRecord.get('value').replace(/^_/, ''); // remove underscore from categorical palettes
		}
		var steps = this.editPaletteWin.down('#d3PaletteSize');
		if (steps.isValid()) {
			steps = steps.getValue();
		} else {
			return;
		}

		var palette = application.createD3ColorPalette(palName, steps);
		var paletteData = palette.map(function(c) { return [c]});
		this.paletteStore.loadRawData(paletteData);
	},
    
    savePalette: function() {
		// TODO if it's a d3 categorical preset then no need to save
		
    	var value = [];
    	this.paletteStore.each(function(c) {
    		value.push(c.get('color'));
    	});
    	
		this.up('window').panel.getApplication()
			.saveCustomColorPalette(value).then(function(id) {
				var combo = this.down('combo');
				var store = combo.getStore();
				store.add({name: id, value: id});
				combo.setValue(id);
				combo.updateLayout();
			}.bind(this));
    }
});