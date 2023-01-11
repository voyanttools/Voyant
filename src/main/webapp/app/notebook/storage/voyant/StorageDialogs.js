Ext.define("Voyant.notebook.StorageDialogs", {
	extend: "Ext.Component",
	mixins: ["Voyant.util.Localization"],
	alias: "",
	statics: {
		i18n: {
			saveNewNotebook: 'Save New Notebook',
			overwriteNotebook: 'Overwrite Existing Notebook',
			open: 'Open',
			notebookFile: 'Notebook File',
			selectFile: 'Select File',
			openFile: 'Open File',
			cancel: 'Cancel',
			mustSelect: 'You must select a file.'
		}
	},

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
		const title = newNotebook ? this.localize('saveNewNotebook') : this.localize('overwriteNotebook');
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
						} else if (val.match(/^[A-Za-z0-9-]{4,32}$/) === null) {
							return 'The ID must be between 4 and 32 characters. You may use alphanumeric characters and dash.'
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

	showLoad: function() {
		const me = this;
		Ext.create('Ext.window.Window', {
			title: me.localize('open'),
			items: [{
				xtype: 'form',
				width: 450,
				bodyPadding: 5,
				layout: 'anchor',
				defaults: {
					labelAlign: 'right',
					labelWidth: 160,
					width: 360
				},
				items: [{
					xtype: 'voyantfilefield',
					name: 'file',
					fieldLabel: me.localize('notebookFile'),
					allowBlank: false,
					buttonText: me.localize('selectFile'),
					accept: 'text/html,application/json'
				}],
				buttons: [{
					text: me.localize('cancel'),
					ui: 'default-toolbar',
					handler: function() {
						this.up('window').close();
					}
				},{
					text: me.localize('openFile'),
					handler: function(button) {
						const win = button.up('window');
						const form = win.down('form').getForm();
						const field = form.findField('file');
						if (form.isValid()) {
							const file = field.fileInputEl.dom.files[0];
							const fr = new FileReader();
							fr.onload = function(evt) {
								const data = evt.target.result;
								me.fireEvent('fileLoaded', data);
								win.close();
							}
							fr.readAsText(file);
						} else {
							field.markInvalid(me.localize('mustSelect'));
						}
					}
				}]
			}]
		}).show();
	},

	doesNotebookExist: function(userId, notebookName) {
		const dfd = new Ext.Deferred();

		Spyral.Load.trombone({
			tool: 'notebook.GitNotebookManager',
			action: 'exists',
			id: userId+this.notebookParent.NOTEBOOK_ID_SEPARATOR+notebookName,
			noCache: 1
		}).then(function(json) {
			if (json.notebook.success) {
				var exists = json.notebook.data === 'true';
				dfd.resolve(exists);
			} else {
				console.warn(json.notebook.error);
				dfd.resolve(false);
			}
		}).catch(function(err) {
			console.warn(err);
		});

		return dfd.promise;
	},

	doSave: function({notebookName, data, metadata}) {
		const me = this;

		const dfd = new Ext.Deferred();

		if (notebookName.indexOf(this.notebookParent.NOTEBOOK_ID_SEPARATOR) !== -1) {
			console.warn('doSave: was sent notebookId instead of name');
			notebookName = notebookName.split(this.notebookParent.NOTEBOOK_ID_SEPARATOR)[1];
		}

		var totalData = {data: data, metadata: JSON.stringify(metadata)};
		console.log('notebook size:',JSON.stringify(totalData).length);
		// TODO use form & isUpload options below, to handle large notebooks
		// https://docs.sencha.com/extjs/6.2.0/classic/Ext.Ajax.html#method-request

		Ext.Ajax.request({
			method: 'POST',
			url: Voyant.application.getBaseUrlFull()+'spyral/account/save',
			params: {
				name: notebookName,
				data: data,
				metadata: JSON.stringify(metadata)
			},
			success: function(resp) {
				const json = JSON.parse(resp.responseText);
				if (json.notebook.success) {
					me.fireEvent('fileSaved', me, json.notebook.id);
					dfd.resolve(true);
				} else {
					me.fireEvent('fileSaved', me, null, json.notebook.error);
					dfd.reject(false);
				}
			},
			failure: function(resp) {
				me.fireEvent('fileSaved', me, null, resp.responseText);
				dfd.reject(false);
			}
		});

		return dfd.promise;
	},

	reset: function() {
	}
})