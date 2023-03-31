Ext.define("Voyant.notebook.editor.SandboxWrapper", {
	extend: "Ext.Container",
	mixins: ["Voyant.util.Localization"],
	alias: "widget.sandboxwrapper",
	statics: {
		i18n: {
			expandResults: 'Expand Results',
			collapseResults: 'Collapse Results',
			viewWarnings: 'View Warning(s)',
			generalWarning: 'Warning: {warningInfo}',
			serializationWarning: 'The variable "{warningInfo}" cannot be passed between cells.',
			loadVariableWarning: 'The variable "{warningInfo}" could not be loaded.'
		},
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
				},{
					xtype: 'toolbar',
					itemId: 'buttons',
					hidden: true,
					x: 0,
					y: 0,
					style: { background: 'none', paddingTop: '6px', pointerEvents: 'none' },
					defaults: { style: { pointerEvents: 'auto'} },
					items: ['->',{
						itemId: 'warnings',
						glyph: 'xf12a@FontAwesome',
						hidden: true,
						tooltip: this.localize('viewWarnings'),
						warnings: [],
						handler: function(btn) {
							if (btn.warnings.length > 0) {
								Ext.Msg.show({
									title: 'Warning',
									message: btn.warnings,
									buttons: Ext.Msg.OK,
									icon: Ext.Msg.INFO
								});
							}
						}
					},{
						itemId: 'expandButton',
						glyph: isExpanded ? 'xf066@FontAwesome' : 'xf065@FontAwesome',
						tooltip: isExpanded ? this.localize('collapseResults') : this.localize('expandResults'),
						handler: function() {
							this._doExpandCollapse();
						},
						scope: this
					}
					// ,{
					// 	xtype: 'notebookwrapperexport'
					// }
					,{
						glyph: 'xf014@FontAwesome',
						tooltip: 'Remove Results',
						handler: function() {
							//this.resetResults();
							this.clear();
							this.hide();
						},
						scope: this
					}]
				}]
			},{
				xtype: 'component',
				itemId: 'expandWidget',
				height: 20,
				hidden: isExpanded ? true : false,
				style: {textAlign: 'center', fontSize: '26px', cursor: 'pointer', borderTop: '1px solid #DDD', color: '#000'},
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
	},

	initComponent: function() {
		var handleResultsScoped = this._handleResults.bind(this);

		this.on('afterrender', function(cmp) {
			cmp.getEl().on('mouseover', function(event, el) {
				cmp.down('#buttons').setVisible(true);
			});
			cmp.getEl().on('mouseout', function(event, el) {
				cmp.down('#buttons').setVisible(false);
			});

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
		this.down('#warnings').hide().warnings = [];
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
		this.down('#warnings').hide().warnings = [];
		this.show();
		this.setHasRunError(false);
		this.getEl().removeCls(['error','success','warning']);

		this.setRunPromise(new Ext.Deferred());

		var actualPromise = this.getRunPromise().promise;
		actualPromise.then(function(result) {
			if (result.warnings && result.warnings.length > 0) {
				this._handleWarnings(result.warnings);
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

	_handleWarnings: function(warningsArray) {
		var warningsContent = [];
		warningsArray.forEach(function(warning) {
			switch(warning.type) {
				case 'serialization':
					warningsContent.push(this.localize('serializationWarning').replace('{warningInfo}', warning.warningInfo));
					break;
				case 'loadVariable':
					warningsContent.push(this.localize('loadVariableWarning').replace('{warningInfo}', warning.warningInfo));
					break;
			}
		}, this)
		var parent = this.down('#warnings');
		parent.show();
		parent.warnings = '<p>'+warningsContent.join('</p><p>')+'</p>';
	},

	_doExpandCollapse: function() {
		var expandButton = this.down('#expandButton');
		if (this.getExpandResults()) {
			this.setExpandResults(false);
			expandButton.setTooltip(this.localize('expandResults'));
			expandButton.setGlyph('xf065@FontAwesome');
		} else {
			this.setExpandResults(true);
			expandButton.setTooltip(this.localize('collapseResults'));
			expandButton.setGlyph('xf066@FontAwesome');
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
				// console.log('setResultsHeight', Math.max(height, this.getEmptyResultsHeight()))
				this.setHeight(Math.max(height, this.getEmptyResultsHeight()));
				// resultsEl.removeCls('collapsed');
			} else {
				height = Math.min(Math.max(height, this.getEmptyResultsHeight()), this.getMinimumResultsHeight());
				if (height < this.getMinimumResultsHeight()) {
					expandWidget.hide();
				} else {
					expandWidget.show();
				}
				// console.log('setResultsHeight', height)
				this.setHeight(height);
				// resultsEl.addCls('collapsed');
			}
		}

		// this.fireEvent('sizeChanged', this);
	}
});
