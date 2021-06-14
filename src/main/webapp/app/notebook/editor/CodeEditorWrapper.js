Ext.define("Voyant.notebook.editor.CodeEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	requires: ["Voyant.notebook.editor.CodeEditor","Voyant.notebook.editor.button.Run","Voyant.notebook.editor.button.RunAll"],
	alias: "widget.notebookcodeeditorwrapper",
	cls: 'notebook-code-wrapper',
	statics: {
		i18n: {
			runMultiple: "Run multiple cells",
			runUntil: "Run up to here",
			runUntilTip: "Run previous code blocks and this one.",
			runFrom: "Run from here onwards",
			runFromTip: "Run this and following code blocks.",
			codeMode: "select from several formats for this cell",
			codeModeTitle: "Code Mode",
			codeModeTip: "Select from multiple code formats for this cell.",
			configureTip: "Configuration Options",
			autoExecuteOnLoad: "auto-run this cell on page load",
			ok: "OK",
			cancel: "Cancel"
		},
		configWin: undefined,
		getConfigWindow: function(codeEditorInstance) {
			if (this.configWin === undefined) {
				this.configWin = new Ext.Window({
					title: codeEditorInstance.localize('codeModeTitle'),
					closeAction: 'hide',
					layout: 'fit',
					width: 240,
					items: [{
						xtype: 'form',
						layout: {
							type: 'vbox',
							align: 'stretch'
						},
						bodyPadding: 10,
						items: [{
							xtype: 'fieldset',
							title: codeEditorInstance.localize("modeCode"),
							items: [{
								xtype : 'radiofield',
								boxLabel : codeEditorInstance.localize('modeJavascript'),
								name  : 'codeMode',
								inputValue: 'javascript',
								flex  : 1,
								listeners: {
									change: function(cmp, newval, oldval) {
										var autoExecCheck = cmp.up().queryById('autoExecute');
										autoExecCheck.setHidden(!newval);
										if (!newval) {
											autoExecCheck.setValue(false);
										}
									}
								}
							},{
								xtype: 'checkbox',
								boxLabel: codeEditorInstance.localize('autoExecuteOnLoad'),
								name: 'autoExecute',
								itemId: 'autoExecute'
							}]
						},{
							xtype: 'fieldset',
							title: codeEditorInstance.localize("modeData"),
							items: [{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeJson'),
									name  : 'codeMode',
									inputValue: 'json',
									flex  : 1
								}
							},{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeText'),
									name  : 'codeMode',
									inputValue: 'text',
									flex  : 1
								}
							},/*{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeCsv'),
									name  : 'codeMode',
									inputValue: 'csv',
									flex  : 1													
								}
							},{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeTsv'),
									name  : 'codeMode',
									inputValue: 'tsv',
									flex  : 1													
								}
							},*/{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeHtml'),
									name  : 'codeMode',
									inputValue: 'html',
									flex  : 1
								}
							},{
								items: {
									xtype : 'radiofield',
									boxLabel : codeEditorInstance.localize('modeXml'),
									name  : 'codeMode',
									inputValue: 'xml',
									flex  : 1
								}
							}]
						}]
					}],
					buttons: [{
						text: codeEditorInstance.localize('ok'),
						itemId: 'ok'
					},{
						text:  codeEditorInstance.localize('cancel'),
						handler: function(btn) {
							btn.up('window').close();
						},
						scope: this
					}]
				})
			}

			// set form values
			var mode = codeEditorInstance.getMode();
			this.configWin.down('radiofield[name=codeMode][inputValue="'+mode+'"]').setValue(true);
			this.configWin.down('checkbox#autoExecute').setValue(codeEditorInstance.getAutoExecute());
			// set ok handler
			this.configWin.down('button#ok').setHandler(function(btn) {
				var win = btn.up('window');
				var form = win.down('form');
				if (form.isDirty()) {
					var values = form.getValues();
					codeEditorInstance.switchModes(values.codeMode);
					codeEditorInstance.setAutoExecute(values.autoExecute === 'on');
					codeEditorInstance.down('button#config').toggleCls("autoExecute", values.autoExecute === 'on');
					codeEditorInstance.up('notebook').setIsEdited(true);
				}
				win.close();
			});

			return this.configWin;
		}
	},
	config: {
		isRun: false,
		needsRun: false,
		autoExecute: false,
		mode: 'javascript',
		isWarnedAboutPreviousCells: false
	},
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	height: 150,
	border: false,

	constructor: function(config) {
		config.mode = config.mode !== undefined ? config.mode : this.config.mode;
		var runnable = config.mode.indexOf('javascript') > -1;

		this.editor = Ext.create("Voyant.notebook.editor.CodeEditor", {
			content: Ext.Array.from(config.input).join("\n"),
			docs: config.docs,
			mode: 'ace/mode/'+config.mode,
			listeners: {
				resize: this._handleResize,
				scope: this
			}
		});

		this.results = Ext.create('Voyant.notebook.editor.SandboxWrapper', {
			sandboxSrcUrl: Spyral.Load.baseUrl+'spyral/sandbox.jsp', // 'https://beta.voyant-tools.org/spyral/sandbox.jsp',
			expandResults: config.expandResults,
			content: Ext.Array.from(config.output).join(""),
			listeners: {
				initialized: function() {
					// pass along initialized
					this.fireEvent('initialized', this);
				},
				resize: this._handleResize,
				scope: this
			}
		});

		Ext.apply(this, {
			dockedItems: [{
			    xtype: 'toolbar',
			    dock: 'left',
			    defaults: {
			    	textAlign: 'left'
			    },
			    items: [
					{
						xtype: 'notebookwrapperadd'
					},{
						xtype: 'notebookwrapperrun',
						hidden: !runnable,
						listeners: {
							click: function() {
								this.run();
							},
							scope: this
						}
					},{
						glyph: 'xf050@FontAwesome',
						tooltip: this.localize("runMultiple"),
						itemId: 'runMultiple',
//						xtype: 'notebookwrapperrununtil',
						hidden: !runnable,
						listeners: {
							click: {
								fn: function(btn, ev) {
									Ext.create('Ext.menu.Menu', {
										items: [{
						    				text: this.localize("runUntil"),
						    				tooltip: this.localize("runUntilTip"),
						    				glyph: 'xf049@FontAwesome',
						    				handler: function() {
						    					this.up('notebook').runUntil(this);
						    				},
						    				scope: this
										},{
						    				text: this.localize("runFrom"),
						    				tooltip: this.localize("runFromTip"),
						    				glyph: 'xf050@FontAwesome',
						    				handler: function() {
						    					this.up('notebook').runFrom(this);
						    				},
						    				scope: this
										}]
									}).showAt(ev.pageX, ev.pageY)
								},
								scope: this
							}
						}
					},{
						xtype: 'button',
						itemId: 'config',
						glyph: 'xf013@FontAwesome',
						tooltip: this.localize("configureTip"),
						cls: config.autoExecute ? "autoExecute" : "",
						handler: function(btn, ev) {
							Voyant.notebook.editor.CodeEditorWrapper.getConfigWindow(this).show();
						},
						scope: this
					},{
						xtype: "notebookwrapperexport",
						hidden: runnable
					}
			    ]
			},{
			    xtype: 'toolbar',
			    dock: 'right',
			    items: [{
			    		xtype: 'notebookwrappercounter',
			    		order: config.order,
			    		name: config.cellId
			    	},{
		        		xtype: 'notebookwrapperremove'
		        	},{
			        	xtype: 'notebookwrappermoveup'
			        },{
			        	xtype: 'notebookwrappermovedown'
			        }
			    ]
			}],
			items: [this.editor, this.results]
		});

		// TODO review this
		if (config.uiHtml !== undefined) {
			this.items.push(this._getUIComponent(config.uiHtml))
		}
		
		this.results.setVisible(runnable);
		
		this.callParent(arguments);
	},
	
	switchModes: function(mode) {
		this.setMode(mode);
		this.editor.switchModes(mode);

		var runnable = mode.indexOf('javascript') > -1;
		this.down('notebookwrapperrun').setVisible(runnable);
		this.down('notebookwrapperexport').setVisible(!runnable);
		this.queryById("runMultiple").setVisible(runnable);
		this.results.setVisible(runnable);

		this._handleResize(); // recalculate height based on presence of results
	},
	
	/**
	 * Run the code in this editor.
	 * @param {boolean} forceRun True to force the code to run, otherwise a check is performed to see if previous editors have already run.
	 * @param {array} priorVariables Variables from prior cells that should be eval'd before this cell's code
	 */
	run: function(forceRun, priorVariables) {
		if (this.editor.getMode()==='ace/mode/javascript') { // only run JS
			if (this.results.getIsInitialized()) {
				if (priorVariables === undefined) {
					console.log('fetching prior vars');
					priorVariables = this.up('notebook').getNotebookVariables(this);
				}
				return this._run(priorVariables);
			} else {
				this.setNeedsRun(true); // TODO do something with this
				return Ext.Promise.reject('Editor is not initialized');
			}
		} else {
			return Ext.Promise.resolve(this.getInput());
		}
	},
	
	_run: function(priorVariables) {
		this.results.clear();

		Voyant.notebook.Notebook.currentNotebook.setCurrentBlock(this);

		this.editor.clearMarkers();

		var code = this.editor.getValue();

		this.setIsRun(true);
		
		var runPromise = this.results.run(code, priorVariables);
		runPromise.otherwise(function(eventData) {
			if (eventData.error !== undefined && eventData.error.row !== undefined) {
				this.editor.addLineMarker(eventData.error.row, 'error');
			}
		}, this);

		return runPromise;
	},

	_getUIComponent: function(html) {
		return Ext.create('Ext.Component', {
			align: 'stretch',
			cls: 'notebook-code-ui',
			padding: '20 10',
			html: html,
			getValue: function() {
				const el = this.getTargetEl();
				const resultEl = el.dom.cloneNode(true);
				let output = resultEl.innerHTML;
				return output;
			}
		});
	},

	_handleResize: function() {
		var height = 2;
		this.items.each(function(item) {height+=item.getHeight();})
		if (this.getHeight() !== height) {
			this.setSize({height: height});
		}
	},
	
	getInput: function() {
		return this.editor.getValue();
	},

	getVariables: function() {
		if (this.results.getHasRunError()) {
			return [];
		} else {
			return this.results.getVariables();
		}
	},

	getExpandResults: function() {
		return this.results.getExpandResults();
	},

	getContent: function() {
		var toReturn = {
			input: this.getInput(),
			mode: this.getMode()
		}
		if (toReturn.mode==='javascript') {
			toReturn.output = this.results.getValue();
			var ui = this.down('component[cls="notebook-code-ui"]');
			if (ui !== null) {
				toReturn.ui = ui.getValue();
			}
		}
		return toReturn;
	}
})