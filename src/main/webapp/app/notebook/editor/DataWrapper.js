Ext.define("Voyant.notebook.editor.DataWrapper", {
	extend: "Voyant.notebook.editor.RunnableEditorWrapper",
	requires: ["Voyant.notebook.editor.CodeEditor", "Voyant.notebook.editor.FileInput", "Voyant.notebook.editor.CorpusInput"],
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

		var hasCachedInput = config.mode === 'file' || config.mode === 'corpus';

		var resourceId = undefined;
		var fileName = undefined;
		if (hasCachedInput) {
			resourceId = config.input.resourceId;
			fileName = config.input.fileName;
		}

		this.editor = Ext.create("Voyant.notebook.editor.CodeEditor", {
			content: Ext.Array.from(config.input).join("\n"),
			docs: config.docs, // TODO
			mode: config.mode,
			hidden: hasCachedInput,
			parentWrapper: this
		});

		if (config.mode === 'corpus') {
			this.cachedInput = Ext.create('Voyant.notebook.editor.CorpusInput', config.input);
		} else {
			var cfg = hasCachedInput && config.input !== '' ? config.input : {};
			this.cachedInput = Ext.create('Voyant.notebook.editor.FileInput', Ext.apply(cfg, {hidden: !hasCachedInput, margin: '5px'}));
		}

		var hideResults = !config.output || config.output.indexOf('>undefined<') !== -1;

		this.results = Ext.create('Voyant.notebook.editor.SandboxWrapper', {
			sandboxSrcUrl: Spyral.Load.baseUrl+'spyral/sandbox.jsp', // 'https://beta.voyant-tools.org/spyral/sandbox.jsp',
			expandResults: config.expandResults,
			hidden: hideResults,
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
			items: [this.editor, this.cachedInput, {
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
					handler: function() {
						if (this.down('textfield[name=dataName]').validate()) {
							this.up('notebook').setIsEdited(true);
							this.run();
						}
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
				if (this.cachedInput.isXType('notebookcorpusinput')) {
					this.cachedInput.destroy();
					this.cachedInput = Ext.create('Voyant.notebook.editor.FileInput', {margin: '5px'});
					this.insert(1, this.cachedInput);
				}
				this.cachedInput.show();
			} else if (mode === 'corpus') {
				this.editor.hide();
				if (this.cachedInput.isXType('notebookfileinput')) {
					this.cachedInput.destroy();
					this.cachedInput = Ext.create('Voyant.notebook.editor.CorpusInput', {});
					this.insert(1, this.cachedInput);
				}
				this.cachedInput.show();
			} else {
				this.cachedInput.hide();
				this.editor.switchModes(mode);
				this.editor.show();
			}
			
			this.updateLayout();
		}
	},

	_getCode: function() {
		var dfd = new Ext.Deferred();

		var dataName = this.getDataName();
		var dataNameField = this.down('textfield[name=dataName]');
		if (dataName === undefined || dataNameField.isValid() === false) {
			dataNameField.markInvalid(dataNameField.getErrors(dataNameField.getValue()));
			dfd.reject();
			return dfd.promise;
		}

		var mode = this.getMode();
		if (mode === 'file' || mode === 'corpus') {
			this.cachedInput.getCode(dataName).then(function(code) {
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

			if (me.getMode() !== 'file' && me.getMode() !== 'corpus') {
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
		if (mode === 'file' || mode === 'corpus') {
			return this.cachedInput.getInput();
		} else {
			return this.editor.getValue();
		}
	},

	getContent: function() {
		var content = this.callParent(arguments);
		content.dataName = this.getDataName();
		return content;
	}
});
