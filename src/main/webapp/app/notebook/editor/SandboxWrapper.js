Ext.define("Voyant.notebook.editor.SandboxWrapper", {
	extend: "Ext.Container",
	mixins: ["Voyant.util.Localization"],
	alias: "widget.sandboxwrapper",
	statics: {
		currentResults: undefined, // used primarily by toolbar buttons to determine the target of their actions
		toolbar: undefined,
		createToolbar: function() {
			if (Voyant.notebook.editor.SandboxWrapper.toolbar === undefined) {
				Voyant.notebook.editor.SandboxWrapper.toolbar = Ext.create('Ext.container.Container', {
					floating: true, // TODO toolbars float above notebook header
					shadow: false,
					preventRefocus: true, // prevents focusing on collapsed/blurred CodeEditor when hiding toolbar
					layout: 'auto',
					hidden: true,
					style: { borderTop: '1px solid #d8d8d8', paddingTop: '4px'},
					defaults: { margin: '0 0 3px 3px', cls: 'x-btn x-btn-default-toolbar-small', iconCls: 'x-btn-icon-el-default-toolbar-small' },
					items: [{
						style: {float: 'right'},
						xtype: 'notebookwrapperexportresults'
					},{
						style: {float: 'right'},
						xtype: 'notebookwrapperexpandcollapseresults'
					},{
						style: {float: 'right', clear: 'both'},
						xtype: 'notebookwrapperremoveresults'
					},{
						style: {float: 'right'},
						xtype: 'notebookwrapperwarning'
					}],
					listeners: {
						boxready: function(cmp) {
							cmp.getEl().on('mouseleave', function(event, el) {
								Voyant.notebook.editor.SandboxWrapper.hideToolbar(event, true);
							});
						}
					}
				});
			}
		},
		showToolbar: function(sandboxWrapper) {
			Voyant.notebook.editor.SandboxWrapper.currentResults = sandboxWrapper;
			var isExpanded = sandboxWrapper.down('#expandWidget').hidden;
			Voyant.notebook.editor.SandboxWrapper.toolbar.down('#expandButton').setCollapsed(!isExpanded);
			var box = sandboxWrapper.getBox();
			Voyant.notebook.editor.SandboxWrapper.toolbar.showAt(box.x-59, box.y+2, false);
		},
		hideToolbar: function(evt, force) {
			var doHide = force ? true : false;
			if (!doHide) {
				if (evt.relatedTarget !== null && Voyant.notebook.editor.SandboxWrapper.toolbar.rendered) {
					var isAncestor = Voyant.notebook.editor.SandboxWrapper.toolbar.getEl().isAncestor(evt.relatedTarget) || Voyant.notebook.editor.SandboxWrapper.toolbar.getEl().isAncestor(evt.relatedTarget);
					doHide = !isAncestor;
				}
			}
			if (doHide) {
				Voyant.notebook.editor.SandboxWrapper.toolbar.hide();
			}
		},
		setWarnings: function(warnings) {
			Voyant.notebook.editor.SandboxWrapper.toolbar.down('#warnings').setWarnings(warnings);
		}
	},

	config: {
		isInitialized: false,

		cachedPaddingHeight: undefined,
		cachedResultsHeight: undefined,
		cachedResultsValue: undefined,
		cachedResultsOutput: '',
		cachedResultsVariables: [],

		runPromise: undefined,
		hasRunError: false,

		initIntervalID: undefined,
		maskTimeoutId: undefined,

		emptyResultsHeight: 40,
		minimumResultsHeight: 120,

		expandResults: true
	},

	constructor: function(config) {
		config.expandResults = config.expandResults !== undefined ? config.expandResults : true;
		var isExpanded = config.expandResults;
		var sandboxSrcUrl = config.sandboxSrcUrl;

		Ext.apply(this, {
			itemId: 'parent',
			cls: 'notebook-code-results',
			height: this.getEmptyResultsHeight(),
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
					src: sandboxSrcUrl,
					renderTpl: ['<iframe allow="midi; geolocation; microphone; camera; display-capture; encrypted-media;" sandbox="allow-same-origin allow-scripts allow-modals allow-popups allow-forms allow-top-navigation-by-user-activation allow-downloads" src="{src}" id="{id}-iframeEl" data-ref="iframeEl" name="{frameName}" width="100%" height="100%" frameborder="0" style="min-height: 40px"></iframe>']
				}]
			},{
				xtype: 'component',
				itemId: 'expandWidget',
				height: 20,
				hidden: isExpanded ? true : false,
				style: {textAlign: 'center', fontSize: '26px', cursor: 'pointer', borderTop: '1px solid #DDD', color: '#000', backgroundColor: 'rgb(252, 252, 252)'},
				html: '&#8943;',
				listeners: {
					afterrender: function(cmp) {
						var me = this;
						cmp.getEl().on('click', function() {
							me._doExpandCollapse();
						})
					},
					scope: this
				}
			}]
		});

		this.callParent(arguments);

		Voyant.notebook.editor.SandboxWrapper.createToolbar();
	},

	initComponent: function() {
		var handleResultsScoped = this._handleResults.bind(this);

		this.on('afterrender', function(cmp) {
			cmp.getEl().on('mouseover', function(event, el) {
				Voyant.notebook.editor.SandboxWrapper.showToolbar(this);
			}, this);
			cmp.getEl().on('mouseleave', function(event, el) {
				Voyant.notebook.editor.SandboxWrapper.hideToolbar(event);
			}, this);

			window.addEventListener('message', handleResultsScoped);

			var me = this;
			this.setInitIntervalID(setInterval(function() {
				me._sendMessage({type: 'command', command: 'init'});
			}, 100));
		}, this);

		this.on('removed', function() {
			window.removeEventListener('message', handleResultsScoped);
		}, this);

		this.callParent(arguments);
	},

	clear: function() {
		if (this.isVisible() === false) {
			console.log("clearing but not visible!", this);
			this.show();
		}
		Voyant.notebook.editor.SandboxWrapper.setWarnings(undefined);
		this._sendMessage({type: 'command', command: 'clear'});
	},

	resetResults: function() {
		this.setCachedResultsValue(undefined);
		this.setCachedResultsOutput('');
		this.setCachedResultsVariables([]);
	},

	run: function(code, priorVariables) {
		if (priorVariables === undefined) {
			priorVariables = [];
		}

		// reset
		//this.resetResults(); // TODO review this vs setvisible
		Voyant.notebook.editor.SandboxWrapper.setWarnings(undefined);
		this.show();
		this.setHasRunError(false);
		this.getEl().removeCls(['error','success','warning']);

		this.setRunPromise(new Ext.Deferred());

		var actualPromise = this.getRunPromise().promise;
		actualPromise.then(function(result) {
			if (result.warnings && result.warnings.length > 0) {
				Voyant.notebook.editor.SandboxWrapper.setWarnings(result.warnings);
				this.getEl().addCls('warning');
			} else {
				this.getEl().addCls('success');
			}
		}, function() {
			this.setHasRunError(true);
			this.getEl().addCls('error');
		}, undefined, this);

		this.mask('Running code...');

		// console.log('sending vars', priorVariables);
		this._sendMessage({type: 'code', value: code, variables: priorVariables});

		return actualPromise;
	},

	mask: function(maskMsg) {
		var me = this;
		this.setMaskTimeoutId(setTimeout(function() {
			me.superclass.mask.call(me, maskMsg, 'spyral-code-mask');
		}, 250)); // only mask long running code
	},

	unmask: function() {
		clearTimeout(this.getMaskTimeoutId());
		this.superclass.unmask.call(this);
	},

	updateHtml: function(html) {
		this._sendMessage({type: 'command', command: 'update', html: html});
	},

	updateValue: function(name, value) {
		this._sendMessage({type: 'command', command: 'update', name: name, value: value});
	},

	getValue: function() {
		return this.getCachedResultsValue();
	},

	updateCachedOutput: function() {
		var me = this;
		return new Ext.Promise(function (resolve, reject) {
			me._sendMessage({type: 'command', command: 'getContents'});
			me.on('sandboxMessage', function(eventData) {
				if (eventData.command === 'getContents') {
					me.setCachedResultsOutput(eventData.value);
				} else {
					console.warn('getOutput: received unexpected message',eventData);
				}
				resolve(me.getCachedResultsOutput());
			}, me, {single: true});
		});
	},

	getOutput: function() {
		return this.getCachedResultsOutput();
	},

	getVariables: function() {
		return this.getCachedResultsVariables();
	},

	applyCachedResultsVariables: function(newVars, oldVars) {
		var parentNotebook = this.up('notebook');
		if (parentNotebook) {
			// it isn't necessary to compare old and new vars since they all get removed prior to running in resetResults
			// var toRemove = oldVars.filter(function(oldVar) {
			// 	return newVars.find(function(newVar) { return newVar.name === oldVar.name }) === undefined;
			// });
			parentNotebook.updateTernServerVariables(newVars, oldVars);
		}
		return newVars;
	},

	getResultsEl: function() {
		var doc = this.down('#resultsFrame');
		if (doc) {
			return doc;
		} else {
			return null;
		}
	},

	_sendMessage: function(messageObj) {
		this.down('#resultsFrame').getWin().postMessage(messageObj, '*');
	},

	_handleResults: function(e) {
		var frame = this.down('#resultsFrame').getFrame();
		if (e.source === frame.contentWindow) {
			var me = this;
			var eventData = e.data;//JSON.parse(td.decode(ev.target.result));
			if (eventData.type) {
				switch (eventData.type) {
					case 'error':
						console.log('iframe error:', eventData);
						me.unmask();
						me.getRunPromise().reject(eventData);
						break;
					case 'command':
						// console.log('iframe command:', eventData);
						switch (eventData.command) {
							case 'init':
								if (me.getIsInitialized() === false) {
									me.setIsInitialized(true);
									clearInterval(me.getInitIntervalID());
									me.fireEvent('initialized', me);
								}
								break;
							case 'clear':
								me._setHeight(0);
								break;
						}
						break;
					case 'result':
						console.log('iframe result:', eventData);
						me.unmask();
						me.getRunPromise().resolve(eventData);
						break;
				}

				if (eventData.command !== 'getContents' &&  // don't overwrite value or variables when we just want to get sandbox contents, i.e. dom output
					eventData.command !== 'clear') { // don't wipe variables just because results were cleared TODO review
					if (eventData.value) {
						me.setCachedResultsValue(eventData.value);
					}
					me.setCachedResultsVariables(eventData.variables);
				}

				if (eventData.output) {
					me.setCachedResultsOutput(eventData.output);
				}

				if (eventData.height > 0) {
					me._setHeight(eventData.height);
				}

				me.fireEvent('sandboxMessage', eventData);
			} else {
				console.warn('unrecognized message!', e);
			}
		}
	},

	_doExpandCollapse: function() {
		var expandButton = Voyant.notebook.editor.SandboxWrapper.toolbar.down('#expandButton');
		if (this.getExpandResults()) {
			this.setExpandResults(false);
			expandButton.setCollapsed(true);
		} else {
			this.setExpandResults(true);
			expandButton.setCollapsed(false);
		}
		
		this._setHeight();
	},
	
	/**
	 * Set the height of the results component
	 */
	_setHeight: function(height) {
		if (this.getCachedPaddingHeight() === undefined) {
			// compute and store parent padding, which we'll need when determining proper height
			var computedStyle = window.getComputedStyle(this.getEl().dom);
			this.setCachedPaddingHeight(parseFloat(computedStyle.getPropertyValue('padding-top'))+parseFloat(computedStyle.getPropertyValue('padding-bottom')) + 2); // extra 2 for border
		}
		if (height !== undefined) {
			// cache height
			this.setCachedResultsHeight(height);
		} else {
			height = this.getCachedResultsHeight();
			if (height === undefined) {
				var resultsEl = this.getResultsEl();
				if (resultsEl) {
					height = resultsEl.getHeight();
				} else {
					height = this.getEmptyResultsHeight();
				}
				this.setCachedResultsHeight(height);
			}
		}
		height += this.getCachedPaddingHeight();

		var resultsEl = this.getResultsEl();
		if (resultsEl) {
			var expandWidget = this.down('#expandWidget');
			if (this.getExpandResults()) {
				expandWidget.hide();
				height = Math.max(height, this.getEmptyResultsHeight());
				// resultsEl.removeCls('collapsed');
			} else {
				height = Math.min(Math.max(height, this.getEmptyResultsHeight()), this.getMinimumResultsHeight());
				if (height < this.getMinimumResultsHeight()) {
					expandWidget.hide();
				} else {
					expandWidget.show();
				}
				// resultsEl.addCls('collapsed');
			}
			this.setHeight(height);
			this.down('#resultsFrame').setHeight(height); // need to explicitly set iframe height (for firefox)
		}

		// this.fireEvent('sizeChanged', this);
	}
});
