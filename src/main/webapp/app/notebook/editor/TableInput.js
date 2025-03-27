Ext.define('Voyant.notebook.editor.TableInput', {
	extend: 'Voyant.notebook.editor.CachedInput',
	alias: 'widget.notebooktableinput', 
	mixins: ['Voyant.util.Localization'],
	config: {
		table: undefined, // a Spyral.Table instance
		type: undefined,
		value: undefined
	},
	statics: {
		i18n: {
			tableInput: 'Table Input',
			tableText: 'Text',
			tableVariable: 'Variable',
			tableFile: 'File',
			notebookVariables: 'Notebook Variables'
		}
	},

	constructor: function(config) {
		Ext.apply(this, {
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: [{
				layout: {
					type: 'hbox',
					align: 'begin',
					pack: 'start'
				},
				items: [{
					xtype: 'combo',
					itemId: 'type',
					fieldLabel: this.localize('tableInput'),
					labelAlign: 'right',
					margin: '5px',
					queryMode: 'local',
					allowBlank: false,
					editable: false,
					forceSelection: true,
					value: 'text',
					store: [['text',this.localize('tableText')],['variable',this.localize('tableVariable')],['file',this.localize('tableFile')]],
					listeners: {
						change: function(rg, val) {
							rg.nextSibling().getLayout().setActiveItem(val);
							this.setType(val);
						},
						scope: this
					}
				},{
					xtype: 'container',
					layout: 'card',
					defaultType: 'container',
					itemId: 'cards',
					flex: 1,
					margin: '5px 5px 5px 0',
					items: [{
						itemId: 'text',
						items: [{
							xtype: 'textarea',
							width: '75%',
							grow: false,
							name: 'text',
							fieldLabel: ''
						}]
					},{
						itemId: 'variable',
						items: [{
							xtype: 'combo',
							name: 'variable',
							fieldLabel: '',
							triggerAction: 'all',
							queryMode: 'local',
							editable: false,
							forceSelection: true,
							emptyText: this.localize('notebookVariables'),
							store: { fields: ['text'] },
							listeners: {
								change: function() {
									this.setTable(undefined);
								},
								scope: this
							}
						}],
						listeners: {
							activate: function() {
								this.populateVariables();
							},
							scope: this
						}
					},{
						itemId: 'file',
						xtype: 'notebookfileinput',
						flex: 1,
						listeners: {
							change: function() {
								this.setTable(undefined);
							},
							scope: this
						}
					}]
				}]
			}],
			listeners: {
				boxready: function(cmp) {
					if (config.type) {
						cmp.down('#type').setValue(config.type);
					}
					if (config.value) {
						var formField = cmp.down('#'+config.type).child();
						if (formField.setRawValue) {
							formField.setRawValue(config.value);
						} else {
							formField.setValue(config.value);
						}
					}
					if (config.table) {
						var table = new Spyral.Table(config.table);
						this.setTable(table);
					}

					cmp.up('notebookdatawrapper').results.on('sandboxMessage', function(msg) {
						if (msg.type === 'result') {
							var tableVarName = cmp.up('notebookdatawrapper').getDataName();
							var tableVal = msg.variables.find(function(variable) { return variable.name === tableVarName });
							Spyral.Util.blobToString(tableVal.value).then(function(strVal) {
								var data = JSON.parse(strVal);
								var table = new Spyral.Table();
								['_rows', '_headers', '_rowKeyColumnIndex'].forEach(function(prop) {
									if (data[prop] !== undefined) {
										table[prop] = data[prop];
									}
								})
								cmp.setTable(table);
							});
						}
					});

					cmp.up('notebook').on('notebookRun', cmp.populateVariables, cmp);
				}
			}
		});

		this.callParent(arguments);
	},

	populateVariables: function() {
		var cmp = this.up('notebookdatawrapper');
		var prev = cmp.previousSibling();
		var variables = [];
		if (prev !== null) {
			variables = cmp.up('notebook').getNotebookVariables(cmp).map(function(vr) { return [vr.name] });
		}
		var combo = this.down('#variable combo');
		combo.getStore().loadRawData(variables);
		
		var resetCombo = true;
		var currValue = combo.getRawValue();
		variables.forEach(function(variable) {
			if (variable.indexOf(currValue) !== -1) {
				resetCombo = false;
			}
		})
		if (resetCombo) {
			combo.setValue(undefined);
		}
	},

	updateTable: function(newVal, oldVal) {
		if (this.rendered === false) return;

		var prevTableEditor = this.down('#tableEditor');
		if (prevTableEditor) prevTableEditor.destroy();
		if (newVal !== undefined) {
			var cellEditor = Ext.create('Ext.form.field.Text', {
				allowBlank: false
			});
			this.insert(1, {
				xtype: 'gridpanel',
				height: 250,
				resizable: {
					handles: 's',
					pinned: true
				},
				width: '100%',
				itemId: 'tableEditor',
				plugins: {
					ptype: 'cellediting',
					pluginId: 'cellEditor'
				},
				columns: newVal.headers(true).map(function(val, index) {
					return {text: val, dataIndex: val, editor: cellEditor}
				}),
				store: {
					xtype: 'store.array',
					fields: newVal.headers(true),
					data: newVal.rows(true)
				},
				bbar: [{
					xtype: 'button',
					text: 'Add Row',
					width: 125,
					glyph: 'xf067@FontAwesome',
					handler: function(b) {
						var grid = b.up('gridpanel');
						var blank = newVal.headers(true).map(function() { return ''; });
						grid.store.loadData([blank], true);
    					var numRecords = grid.store.getCount();
    					grid.getPlugin('cellEditor').startEditByPosition({row: numRecords-1, column: 0});
					}
				},{
					xtype: 'button',
					text: 'Remove Row',
					width: 135,
					glyph: 'xf068@FontAwesome',
					handler: function(b) {
						var grid = b.up('gridpanel');
						var sel = grid.getSelection();
						if (sel.length > 0) {
							grid.store.remove(sel);
						}
					}
				},{
					xtype: 'button',
					text: 'Delete Table',
					width: 135,
					glyph: 'xf1f8@FontAwesome',
					handler: function() {
						this.setTable(undefined);
					},
					scope: this
				}]
			});
		}
	},

	getRowsFromTable: function() {
		var tableEditor = this.down('#tableEditor');
		if (!tableEditor) return undefined;
		var store = tableEditor.getStore();

		var headers = store.getModel().getFields()
			.filter(function(field) { return field.generated !== true })
			.map(function(field) { return field.getName() });

		var rows = store.getData().items.map(function(item) {
			var row = {};
			headers.forEach(function(header) {
				row[header] = item.get(header);
			})
			return row;
		});

		return rows;
	},

	getCode: function(varName) {
		var dfd = new Ext.Deferred();

		var activeItem = this.down('#cards').getLayout().getActiveItem();
		var type = activeItem.getItemId();
		this.setType(type);

		// if the editor exists use that as the source
		var tableEditor = this.down('#tableEditor');
		if (tableEditor) {
			var rows = this.getRowsFromTable();
			var val = varName+'=new Spyral.Table('+JSON.stringify(rows)+')';
			dfd.resolve(val);
			return dfd.promise;
		}
		
		if (type === 'variable') {
			var inputVarName = activeItem.down('combo').getRawValue();
			this.setValue(inputVarName);
			if (inputVarName !== '') {
				var code = `${varName}=${inputVarName} instanceof Spyral.Table ? ${inputVarName} : new Spyral.Table(${inputVarName})`;
				dfd.resolve(code);
			} else {
				dfd.reject('No variable specified!');
			}
		} else if (type === 'file') {
			var file = activeItem.getFile();
			this.setValue(activeItem.getFileName());
			Spyral.Util.blobToString(file).then(function(data) {
				var val = varName+'=new Spyral.Table(`'+data+'`)';
				dfd.resolve(val);
			}, function() {
				dfd.reject();
			});
		} else if (type === 'text') {
			var text = activeItem.down('textfield').getValue().replaceAll('"', '\"').replaceAll('\t', '\\t').replaceAll('\n', '\\n');
			this.setValue(text);
			if (text !== '') {
				var val = varName+'=new Spyral.Table("'+text+'")';
				dfd.resolve(val);
			} else {
				dfd.reject('No text entered!');
			}
		}

		return dfd.promise;
	},

	getTSV: function() {
		var tableTsv = undefined;
		if (this.getTable()) {
			tableTsv = this.getTable().toTsv();
		}
		return tableTsv;
	},

	getInput: function() {
		return {
			table: this.getTSV(),
			type: this.getType(),
			value: this.getValue()
		}
	},

	getBlob: function() {
		var dfd = new Ext.Deferred();
		dfd.resolve(this.getTSV());
		return dfd.promise;
	}
});