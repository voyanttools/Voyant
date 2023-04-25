Ext.define('Voyant.notebook.editor.FileInput', {
	extend: 'Voyant.notebook.editor.CachedInput',
	alias: 'widget.notebookfileinput', 
	mixins: ['Voyant.util.Localization'],
	config: {
		dataUrl: undefined,
		resourceId: undefined,
		file: undefined,
		fileName: undefined
	},
	statics: {
		i18n: {
			fileUpload: 'File Upload',
			buttonLabel: 'Choose a file...',
			deleteMsg: 'The previously added file has been deleted. You will need to add a new file.'
		}
	},

	serverStorage: undefined,

	constructor: function(config) {
		Ext.apply(this, config, {
			width: '100%',
			items: [{
				xtype: 'voyantfilefield',
				itemId: 'file',
				fieldLabel: this.localize('fileUpload'),
				labelAlign: 'right',
				buttonText: this.localize('buttonLabel'),
				width: 350,
				listeners: {
					render: function(cmp) {
						if (config.fileName) {
							cmp.inputEl.dom.value = config.fileName;
						}
					},
					change: function(cmp, filename) {
						var file = cmp.fileInputEl.dom.files[0];
						this.setFile(file);
						this.setFileName(filename);
						this.setDataUrl(undefined);
						this.setResourceId(undefined);

						this.fireEvent('change', filename);
					},
					scope: this
				}
			}]
		});

		if (typeof Voyant.util.ServerStorage === 'undefined') {
			Ext.define('Voyant.util.ServerStorage', {
				extend: 'Voyant.util.Storage',
				getTromboneUrl: function() {
					return Voyant.application.getTromboneUrl();
				}
			});
		}
		this.serverStorage = Ext.create('Voyant.util.ServerStorage');

		this.callParent(arguments);
	},

	getCode: function(varName) {
		var dfd = new Ext.Deferred();

		this.getDataUrl().then(function(dataUrl) {
			var code = varName+'= Spyral.Util.dataUrlToBlob(`'+dataUrl+'`)';
			dfd.resolve(code);
		}, function() {
			dfd.reject();
		});

		return dfd.promise;
	},

	getInput: function() {
		return {
			resourceId: this.getResourceId(),
			fileName: this.getFileName()
		}
	},

	getDataUrl: function() {
		var dfd = new Ext.Deferred();

		if (this.getResourceId()) {
			this.loadStoredFile().then(function(dataUrl) {
				dfd.resolve(dataUrl);
			}, function() {
				dfd.reject();
			})
		} else {
			if (this.getFile()) {
				this.storeFile().then(function(result) {
					dfd.resolve(result[1]);
				}, function() {
					dfd.reject();
				});
			} else {
				dfd.reject();
			}
		}

		return dfd.promise;
	},

	getBlob: function() {
		var dfd = new Ext.Deferred();

		this.getDataUrl().then(function(dataUrl) {
			var blob = Spyral.Util.dataUrlToBlob(dataUrl);
			dfd.resolve(blob);
		}, function() {
			dfd.reject();
		});

		return dfd.promise;
	},

	storeFile: function() {
		var dfd = new Ext.Deferred();

		var file = this.getFile();
		if (file === undefined) {
			dfd.reject();
		} else {
			var me = this;
			Spyral.Util.blobToDataUrl(file).then(function(data) {
				var resourceId = Spyral.Util.id(32);
				me.serverStorage.storeResource(resourceId, data).then(function() {
					me.setResourceId(resourceId);
					me.setDataUrl(data);
					dfd.resolve([resourceId, data]);
				}, function() {
					dfd.reject();
				})
			}, function(err) {
				dfd.reject(err);
			});
		}

		return dfd.promise;
	},

	loadStoredFile: function() {
		var dfd = new Ext.Deferred();
		
		var resourceId = this.getResourceId();
		if (resourceId === undefined) {
			dfd.reject();
		} else {
			var me = this;
			this.serverStorage.getStoredResource(resourceId).then(function(dataUrl) {
				if (dataUrl !== undefined) {
					me.setDataUrl(dataUrl);
					dfd.resolve(dataUrl);
				} else {
					dfd.reject();
				}
			}, function() {
				dfd.reject();
			});
		}
		
		return dfd.promise;
	}
});

Ext.define('Voyant.form.field.File', {
	extend: 'Ext.form.field.File',
	alias: 'widget.voyantfilefield',
	onFileChange: function(button, e, value) {
		// remove fakepath
		var newValue = value.replace(/^.*(\\|\/|\:)/, ''); // TODO test in safari etc

		return this.callParent([ button, e, newValue ]);
	}
});