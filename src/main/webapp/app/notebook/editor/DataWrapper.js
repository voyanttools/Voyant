Ext.define("Voyant.notebook.editor.DataWrapper", {
	extend: "Voyant.notebook.editor.RunnableEditorWrapper",
	requires: ["Voyant.notebook.editor.CodeEditor", "Voyant.notebook.editor.FileInput"],
	alias: "widget.notebookdatawrapper",
	cls: 'notebook-data-wrapper',
	statics: {
		i18n: {
			dataNameAlphanum: 'The data name must contain alphanumeric characters only',
			dataNameAlphastart: 'The data name must not begin with a number'
		}
	},
	config: {
		dataName: undefined
	},

	constructor: function(config) {
		config.mode = config.mode !== undefined ? config.mode : 'json';

		var isFile = config.mode === 'file';
		var resourceId = undefined;
		var fileName = undefined;
		if (isFile) {
			resourceId = config.input.resourceId;
			fileName = config.input.fileName;
		}

		this.editor = Ext.create("Voyant.notebook.editor.CodeEditor", {
			content: Ext.Array.from(config.input).join("\n"),
			docs: config.docs, // TODO
			mode: config.mode,
			hidden: isFile,
			parentWrapper: this
		});

		this.fileInput = Ext.create('Voyant.notebook.editor.FileInput', {
			resourceId: resourceId,
			fileName: fileName,
			hidden: !isFile
		});

		this.results = Ext.create('Voyant.notebook.editor.SandboxWrapper', {
			sandboxSrcUrl: Spyral.Load.baseUrl+'spyral/sandbox.jsp', // 'https://beta.voyant-tools.org/spyral/sandbox.jsp',
			expandResults: config.expandResults,
			listeners: {
				initialized: function() {
					// pass along initialized
					this.fireEvent('initialized', this);

					if (config.output !== undefined) {
						this.results.updateHtml(config.output);
					}
				},
				scope: this
			}
		});

		Ext.apply(this, {
			border: false,
			layout: 'anchor',
			defaults: { anchor: '100%' },
			items: [this.editor, this.fileInput, {
				xtype: 'form',
				cls: 'notebook-data-input',
				bodyPadding: 6,
				bodyStyle: 'background-color: rgb(252, 252, 252);',
				layout: {
					type: 'hbox',
					pack: 'center'
				},
				items: [{
					width: 350,
					xtype: 'textfield',
					fieldLabel: 'Data Name',
					labelAlign: 'right',
					name: 'dataName',
					value: config.dataName,
					validator: function(val) {
						if (/^[a-zA-Z0-9_]+$/.test(val)) {
							if (/^\D/.test(val)) {
								return true;
							} else {
								return this.localize('dataNameAlphastart');
							}
						} else {
							return this.localize('dataNameAlphanum')
						}
					}.bind(this),
					allowBlank: false,
					listeners: {
						change: function(cmp, newVal, oldVal) {
							if (cmp.isValid()) {
								this.setDataName(newVal);
							} else {
								this.setDataName(undefined);
							}
						},
						scope: this
					}
				},{
					width: 100,
					margin: '0 0 0 6',
					xtype: 'button',
					text: 'Assign',
					handler: function(btn) {
						this.up('notebook').setIsEdited(true);
						this.run();
					},
					scope: this
				}]
			}, this.results]
		});
		
		this.callParent(arguments);
	},

	switchModes: function(mode) {
		if (mode === 'javascript') {
			var notebook = this.up('notebook');
			notebook.addCode('', this.getIndex(), undefined, {mode: 'javascript'});
			notebook.notebookWrapperRemove(this);
		} else {
			this.setMode(mode);
			
			if (mode === 'file') {
				this.editor.hide();
				this.fileInput.show();
			} else {
				this.fileInput.hide();
				this.editor.switchModes(mode);
				this.editor.show();
			}
			
			this.updateLayout();
		}
	},

	_getCode: function() {
		var dfd = new Ext.Deferred();

		var dataName = this.getDataName();
		if (dataName === undefined) {
			dfd.reject();
		}

		var mode = this.getMode();
		if (mode === 'file') {
			this.fileInput.getDataUrl().then(function(dataUrl) {
				var code = dataName+'= Spyral.Util.dataUrlToBlob(`'+dataUrl+'`)';
				dfd.resolve(code);
			}, function() {
				dfd.reject();
			});
		} else {
			var code = this.editor.getValue();
			switch(mode) {
				case 'text':
					code = dataName+'=`'+code+'`';
					break;
				case 'json':
					code = dataName+'= JSON.parse(`'+code+'`)';
					break;
				case 'xml':
					code = dataName+'= new DOMParser().parseFromString(`'+code+'`, "application/xml")';
					break;
				case 'html':
					code = dataName+'= new DOMParser().parseFromString(`'+code+'`, "application/xml")'; // also use xml for strict validation
					break;
			}
			dfd.resolve(code);
		}

		return dfd.promise;
	},

	_run: function(priorVariables) {
		var dfd = new Ext.Deferred();

		var me = this;
		this._getCode().then(function(code) {
			me.results.clear();

			if (me.getMode() !== 'file') {
				me.editor.clearMarkers();
			}

			me.setIsRun(true);
			
			me.results.run(code, priorVariables).then(function(eventData) {
				dfd.resolve(eventData);
			}, function(eventData) {
				if (eventData.error !== undefined) {
					var location = eventData.error.location;
					if (location !== undefined) {
						me.editor.addMarker(location, 'error');
						me.editor.addLineMarker(location, 'error');
					}
				}
				dfd.reject(eventData);
			});
		}, function() {
			dfd.reject('Error handling data');
		});

		return dfd.promise;
	},

	getInput: function() {
		var mode = this.getMode();
		if (mode !== 'file') {
			return this.editor.getValue();
		} else {
			return {
				resourceId: this.fileInput.getResourceId(),
				fileName: this.fileInput.getFileName()
			}
		}
	},

	getContent: function() {
		var content = this.callParent(arguments);
		content.dataName = this.getDataName();
		return content;
	}
});
