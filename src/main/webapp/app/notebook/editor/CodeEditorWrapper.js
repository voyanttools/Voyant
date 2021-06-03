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
		isInitialized: false,
		isRun: false,
		autoExecute: false,
		mode: 'javascript',
		isWarnedAboutPreviousCells: false,
		expandResults: true,
		emptyResultsHeight: 40,
		minimumResultsHeight: 120
	},
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	height: 150,
	border: false,

	BASE_HEIGHT: 2, // used when calculating total height for this component
	EMPTY_RESULTS_TEXT: ' ', // text to use when clearing results, prior to running code

	constructor: function(config) {
		config.mode = config.mode !== undefined ? config.mode : this.config.mode;
		var runnable = config.mode.indexOf('javascript') > -1;

		this.editor = Ext.create("Voyant.notebook.editor.CodeEditor", {
			content: Ext.Array.from(config.input).join("\n"),
			docs: config.docs,
			mode: 'ace/mode/'+config.mode
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
			items: [this.editor],
			listeners: {
				resize: function(cmp, nw, nh, ow, oh) {
					// console.log('resize', nh, oh, nw, ow);
				},
				removed: function() {
					window.removeEventListener('message', handleResults);
				}
			}
		});

		if (config.uiHtml !== undefined) {
			this.items.push(this._getUIComponent(config.uiHtml))
		}

		this.results = this._getResultsComponent(config);
		
		var initHtml = Ext.Array.from(config.output).join("");
		var initIntervalID;

		var me = this;
		var handleResults = function(e) {
			var frame = me.results.getFrame();
			if (e.source === frame.contentWindow) {
				var eventData = JSON.parse(e.data);
				if (eventData.type) {
					switch (eventData.type) {
						case 'error':
							console.log('iframe error:', eventData);
							me.results.unmask();
							me.results.runPromise.reject(eventData);

							if (eventData.error !== undefined && eventData.error.row !== undefined) {
								me.editor.addLineMarker(eventData.error.row, 'error');
							}
							break;
						case 'command':
							// console.log('iframe command:', eventData);
							switch (eventData.command) {
								case 'init':
									me.setIsInitialized(true);
									clearInterval(initIntervalID);
									me.results.update(initHtml);
									break;
								case 'clear':
									me._setResultsHeight(0);
									me.getTargetEl().fireEvent('resize');
									break;
							}
							break;
						case 'result':
							console.log('iframe result:', eventData);
							me.results.unmask();
							me.results.runPromise.resolve(eventData);
							break;
					}

					if (eventData.output) {
						me.results.cachedResultsOutput = eventData.output;
					}

					me.results.cachedResultsVariables = eventData.variables;

					if (eventData.height > 0) {
						me._setResultsHeight(eventData.height);
					}
					var height = me.BASE_HEIGHT;
					me.items.each(function(item) {height+=item.getHeight();})
					me.setSize({height: height});
					
				} else {
					console.warn('unrecognized message!', e);
				}
			}
		}
		window.addEventListener('message', handleResults);

		initIntervalID = setInterval(function() {
			console.log('interval init');
			me.results._sendMessage({type: 'command', command: 'init'});
		}, 100);

		this.results.setVisible(runnable);
		this.items.push(this.results);
		
		this.callParent(arguments);
        
	},
	
	initComponent: function(config) {
		var me = this;
		me.on("afterrender", function() {
			this.getTargetEl().on("resize", function(el) {
				// me._setResultsHeight();
				var height = me.BASE_HEIGHT;
				me.items.each(function(item) {height+=item.getHeight();})
				// console.log('resize setSize', height);
				if (me.getHeight() !== height) {
					me.setSize({height: height});
				}
			});
		}, this);
		me.callParent(arguments);
	},
	
	switchModes: function(mode) {
		this.setMode(mode);
		this.editor.switchModes(mode);

		var runnable = mode.indexOf('javascript') > -1;
		this.down('notebookwrapperrun').setVisible(runnable);
		this.down('notebookwrapperexport').setVisible(!runnable);
		this.queryById("runMultiple").setVisible(runnable);
		this.results.setVisible(runnable);
	},
	
	/**
	 * Run the code in this editor.
	 * @param {boolean} forceRun True to force the code to run, otherwise a check is performed to see if previous editors have already run.
	 * @param {array} priorVariables Variables from prior cells that should be eval'd before this cell's code
	 */
	run: function(forceRun, priorVariables) {
		if (this.editor.getMode()==='ace/mode/javascript') { // only run JS
			if (this.getIsInitialized()) {
				if (forceRun===true || this.getIsWarnedAboutPreviousCells()) {
					return this._run(priorVariables);
				} else {
					// this code was for checking if previous cells hadn't been run, but it didn't seem worthwhile
					var notebook = this.up('notebook');
					Ext.Array.each(notebook.query('notebookcodeeditorwrapper'), function(wrapper) {
						if (wrapper===this) {this._run(priorVariables); return false;} // break
						if (wrapper.editor && wrapper.editor.getMode() === 'ace/mode/javascript' && wrapper.getIsRun()===false) {
							Ext.Msg.confirm(this.localize('previousNotRunTitle'), this.localize('previousNotRun'), function(btnId) {
								if (btnId==='yes') {
									notebook.runUntil(this);
								} else {
									this._run(priorVariables);
								}
							}, this);
							this.setIsWarnedAboutPreviousCells(true);
							return false;
						}
					}, this);
				}
			} else {
				// TODO init and then run
				console.warn('run called before init!', this);
			}
		}
	},
	
	_run: function(priorVariables) {
		this.results.show(); // make sure it's visible 
		this.results.clear();

		this.editor.clearMarkers();

		var code = this.editor.getValue();

		this.setIsRun(true);
		return this.results.run(code, priorVariables);
	},

	_getResultsComponent: function(config) {
		var me = this;
		var isExpanded = config.expandResults === undefined ? me.config.expandResults : config.expandResults;
		var height = me.config.emptyResultsHeight;

		return Ext.create('Ext.Container', {
			itemId: 'parent',
			cls: 'notebook-code-results',
			height: height,
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: [{
				xtype: 'container',
				flex: 1,
				layout: {
					type: 'absolute'
				},
				items: [{
					xtype: 'uxiframe',
					itemId: 'resultsFrame',
					x: 0,
					y: 0,
					anchor: '100%',
					height: '100%',
					// src: 'https://beta.voyant-tools.org/spyral/sandbox.jsp',
					src: Spyral.Load.baseUrl+'spyral/sandbox.jsp',
					renderTpl: ['<iframe allow="midi; geolocation; microphone; camera; display-capture; encrypted-media;" sandbox="allow-same-origin allow-scripts allow-modals allow-popups allow-forms allow-top-navigation-by-user-activation allow-downloads" src="{src}" id="{id}-iframeEl" data-ref="iframeEl" name="{frameName}" width="100%" height="100%" frameborder="0"></iframe>']
				},{
					xtype: 'toolbar',
					itemId: 'buttons',
					hidden: true,
					x: 0,
					y: 0,
					style: { background: 'none', paddingTop: '6px', pointerEvents: 'none' },
					defaults: { style: { pointerEvents: 'auto'} },
					items: ['->',{
						itemId: 'expandButton',
						glyph: isExpanded ? 'xf066@FontAwesome' : 'xf065@FontAwesome',
						tooltip: isExpanded ? 'Contract Results' : 'Expand Results',
						handler: function() {
							me.results.doExpandContract();
						}
					},{
						xtype: 'notebookwrapperexport',
						exportType: 'output'
					},{
						glyph: 'xf014@FontAwesome',
						tooltip: 'Remove Results',
						handler: function() {
							me.clearResults();
						}
					}]
				}]
			},{
				xtype: 'component',
				itemId: 'expandWidget',
				height: 20,
				hidden: isExpanded ? true : false,
				style: {textAlign: 'center', fontSize: '26px', cursor: 'pointer', borderTop: '1px solid #DDD'},
				html: '&#8943;',
				listeners: {
					afterrender: function(cmp) {
						cmp.getEl().on('click', function() {
							me.results.doExpandContract();
						})
					}
				}
			}],
			
			cachedPaddingHeight: undefined,
			cachedResultsHeight: undefined,
			cachedResultsOutput: '',
			cachedResultsVariables: [],

			runPromise: undefined,

			maskTimeoutId: undefined,

			_sendMessage: function(messageObj) {
				this.down('#resultsFrame').getWin().postMessage(JSON.stringify(messageObj), '*');
			},
			clear: function() {
				this._sendMessage({type: 'command', command: 'clear'});
			},
			run: function(code, priorVariables) {
				if (priorVariables === undefined) {
					priorVariables = [];
				}

				this.runPromise = new Ext.Deferred();

				this.mask('Running code...');

				console.log('sending vars', priorVariables);
				this._sendMessage({type: 'code', value: code, variables: priorVariables});

				return this.runPromise.promise;
			},
			mask: function(maskMsg) {
				var me = this;
				this.maskTimeoutId = setTimeout(function() {
					me.superclass.mask.call(me, maskMsg, 'spyral-code-mask');
				}, 250); // only mask long running code
			},
			unmask: function() {
				clearTimeout(this.maskTimeoutId);
				this.superclass.unmask.call(this);
			},
			getValue: function() {
				return this.cachedResultsOutput;
			},
			getVariables: function() {
				return this.cachedResultsVariables;
			},
			getFrame: function() {
				return this.down('#resultsFrame').getFrame();
			},
			getResultsEl: function() {
				var doc = this.down('#resultsFrame');
				if (doc) {
					return doc;
				} else {
					return null;
				}
			},
			doExpandContract: function() {
				var expandButton = me.results.down('#expandButton');
				if (me.getExpandResults()) {
					me.setExpandResults(false);
					expandButton.setTooltip('Expand Results');
					expandButton.setGlyph('xf065@FontAwesome');
				} else {
					me.setExpandResults(true);
					expandButton.setTooltip('Contract Results');
					expandButton.setGlyph('xf066@FontAwesome');
				}
				
				me._setResultsHeight();
				me.getTargetEl().fireEvent('resize');
			},
			// override update method and call it on results child instead
			update: function(htmlOrData) {
				// console.log('update', htmlOrData);
				this._sendMessage({type: 'command', command: 'update', value: htmlOrData});
			},
			listeners: {
				afterrender: function(cmp) {
					cmp.getEl().on('mouseover', function(event, el) {
						cmp.down('#buttons').setVisible(true);
					});
					cmp.getEl().on('mouseout', function(event, el) {
						cmp.down('#buttons').setVisible(false);
					});
				}
			}
		});
	},

	_getUIComponent: function(html) {
		return Ext.create('Ext.Component', {
			align: 'stretch',
			cls: 'notebook-code-ui',
			padding: '20 10',
			html: html,
			getValue: function() {
				const el = this.getTargetEl()
				const resultEl = el.dom.cloneNode(true);
				let output = resultEl.innerHTML;
				return output;
			}
		});
	},

	_showResult: function(result) {
		// check for pre-existing content (such as from highcharts) and if it exists don't update
		if (this.results.getResultsEl().dom.innerHTML === this.EMPTY_RESULTS_TEXT) {
			if (result.toString) {result = result.toString()}
			if (result && result.then) {
				var me = this;
				result.then(out => {
					me.results.update(out);
					return out;
				})
			} else {
				this.results.update(result);
			}
		}
	},

	/**
	 * Set the height of the results component
	 */
	_setResultsHeight: function(height) {
		if (this.results.cachedPaddingHeight === undefined) {
			// compute and store parent padding, which we'll need when determining proper height
			var computedStyle = window.getComputedStyle(this.results.getEl().dom);
			this.results.cachedPaddingHeight = parseFloat(computedStyle.getPropertyValue('padding-top'))+parseFloat(computedStyle.getPropertyValue('padding-bottom'));
			this.results.cachedPaddingHeight += 2; // extra 2 for border
		}
		if (height !== undefined) {
			// cache height
			this.results.cachedResultsHeight = height;
		} else {
			height = this.results.cachedResultsHeight;
			if (height === undefined) {
				var resultsEl = this.results.getResultsEl();
				if (resultsEl) {
					height = resultsEl.getHeight();
				} else {
					height = this.getEmptyResultsHeight();
				}
				this.results.cachedResultsHeight = height;
			}
		}
		height += this.results.cachedPaddingHeight;

		var resultsEl = this.results.getResultsEl();
		if (resultsEl) {
			var expandWidget = this.results.down('#expandWidget');
			if (this.getExpandResults()) {
				expandWidget.hide();
				// console.log('setResultsHeight', Math.max(height, this.getEmptyResultsHeight()))
				this.results.setHeight(Math.max(height, this.getEmptyResultsHeight()));
				// resultsEl.removeCls('collapsed');
			} else {
				height = Math.min(Math.max(height, this.getEmptyResultsHeight()), this.getMinimumResultsHeight());
				if (height < this.getMinimumResultsHeight()) {
					expandWidget.hide();
				} else {
					expandWidget.show();
				}
				// console.log('setResultsHeight', height)
				this.results.setHeight(height);
				// resultsEl.addCls('collapsed');
			}
		}
	},
	
	clearResults: function() {
		this.results.show();
		this.results.clear();
	},
	
	getCode: function() {
		return this.editor.getValue();
	},

	getVariables: function() {
		return this.results.getVariables();
	},

	getContent: function() {
		var toReturn = {
			input: this.editor.getValue(),
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
	},
	
	setContentAndMode: function(content, mode, config) {
		debugger
		this.editor.setContent(content);
		this.switchModes(mode || "javascript")
	}
})