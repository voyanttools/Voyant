Ext.define("Voyant.notebook.StorageDialogs", {
	extend: "Ext.Component",
	requires: [],
	alias: "",

	notebookParent: undefined,

	constructor: function(config) {
		config = config || {};
    	this.callParent(arguments);

		this.notebookParent = config.notebookParent;
    },

	initComponent: function() {
		this.callParent(arguments);
	},
	
	showSave: function(data, metadata, notebookName='') {
		const me = this;
		const newNotebook = notebookName === '';
		const title = newNotebook ? 'Save New Notebook' : 'Overwrite Existing Notebook';
		Ext.create('Ext.window.Window', {
			title: title,
			items: [{
				xtype: 'form',
				width: 450,
				bodyPadding: 5,
				plugins: ['datatip'],
				listeners: {
					beforeshowtip: function(tip, config, msg) {
						return !config.currentTarget.el.hasCls('x-form-invalid'); // don't show tooltip if the field is invalid because otherwise the two tips overlap
					}
				},
				layout: 'anchor',
				defaults: {
					labelAlign: 'right',
					labelWidth: 160,
					width: 360,
					inputAttrTpl: 'spellcheck="false"',
					xtype: 'textfield'
				},
    	    	items: [{
					fieldLabel: 'Notebook ID' + (newNotebook ? ' (optional)' : ''),
					name: 'notebookName',
					value: notebookName,
					allowBlank: true,
					readOnly: !newNotebook,
					tooltip: 'An ID used to identify this notebook. If left blank, one will be generated for you.',
					validator: function(val) {
						if (val == '') {
							return true;
						} else if (val.match(/^[\w-]{4,16}$/) === null) {
							return 'The ID must be between 4 and 16 alphanumeric characters.'
						} else {
							return true;
						}
					}
				}]
			}],
			buttons: [{
    	        text: 'Cancel',
	            ui: 'default-toolbar',
    	        handler: function() {
    	            this.up('window').close();
					me.fireEvent('saveCancelled', me);
    	        }
    	    }, " ", {
    	        text: 'Save',
    	        handler: function(button) {
					const win = button.up('window');
					const form = win.down('form').getForm();
					if (form.isValid()) {
						const values = form.getValues();
						values.data = data;
						values.metadata = metadata;
						if (newNotebook && values.notebookName !== '') {
							const info = me.notebookParent.accountInfo;
							const userId = info.id;
							me.doesNotebookExist(userId, values.notebookName).then(function(exists) {
								if (exists) {
									form.findField('notebookName').markInvalid('That Notebook ID already exists.');
								} else {
									me.doSave(values);
									win.close();
								}
							});
						} else {
							button.setDisabled(true);
							me.doSave(values).then(function(didSave) {
								button.setDisabled(false);
								if (didSave) {
									win.close();
								} else {
									// TODO show error
								}
							});
						}
					}
    	        }
			}],
			listeners: {
				close: function() {
					me.fireEvent('close', me); // need an additional close event in case the user uses the close tool / esc button
				}
			}
		}).show();
	},

	doesNotebookExist: function(userId, notebookName) {
		const dfd = new Ext.Deferred();

		Spyral.Load.trombone({
			tool: 'notebook.GitNotebookManager',
			action: 'exists',
			id: userId+'$'+notebookName,
			noCache: 1
		}).then(function(json) {
			var exists = json.notebook.data === 'true';
			dfd.resolve(exists);
		}).catch(function(err) {
			console.log(err);
		});

		return dfd.promise;
	},

	doSave: function({notebookName, data, metadata}) {
		const me = this;

		const dfd = new Ext.Deferred();

		if (notebookName.indexOf('$') !== -1) {
			console.warn('doSave: was sent notebookId instead of name');
			notebookName = notebookName.split('$')[1];
		}

		Ext.Ajax.request({
			method: 'POST',
			url: Voyant.application.getBaseUrlFull()+'spyral/account/save',
			params: {
				name: notebookName,
				data: data,
				metadata: JSON.stringify(metadata)
			},
			success: function(resp) {
				try {
					const json = JSON.parse(resp.responseText);
					me.fireEvent('fileSaved', me, json.notebook.id);
					dfd.resolve(true);
				} catch (err) {
					me.fireEvent('fileSaved', me, null);
					dfd.reject(false);
				}
			},
			failure: function() {
				me.fireEvent('fileSaved', me, null);
				dfd.reject(false);
			}
		});

		return dfd.promise;
	},

	reset: function() {
	}
})