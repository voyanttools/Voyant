Ext.define("Voyant.notebook.editor.SandboxWrapper", {
	extend: "Ext.Container",
	mixins: ["Voyant.util.Localization"],
	alias: "widget.sandboxwrapper",
	statics: {
		i18n: {}
	},

	config: {
		isInitialized: false,
		initialContent: '',

		cachedPaddingHeight: undefined,
		cachedResultsHeight: undefined,
		cachedResultsOutput: '',
		cachedResultsVariables: [],

		runPromise: undefined,

		initIntervalID: undefined,
		maskTimeoutId: undefined,

		emptyResultsHeight: 40,
		minimumResultsHeight: 120,

		expandResults: true
	},

	constructor: function(config) {
		var isExpanded = config.expandResults;
		var sandboxSrcUrl = config.sandboxSrcUrl;
		
		this.setInitialContent(config.content);

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
							this._doExpandContract();
						},
						scope: this
					},{
						xtype: 'notebookwrapperexport',
						exportType: 'output'
					},{
						glyph: 'xf014@FontAwesome',
						tooltip: 'Remove Results',
						handler: function() {
							this.clear();
						},
						scope: this
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
						var me = this;
						cmp.getEl().on('click', function() {
							me._doExpandContract();
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
				console.log('interval init');
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
		this._sendMessage({type: 'command', command: 'clear'});
	},

	run: function(code, priorVariables) {
		if (priorVariables === undefined) {
			priorVariables = [];
		}

		this.setRunPromise(new Ext.Deferred());

		this.mask('Running code...');

		console.log('sending vars', priorVariables);
		this._sendMessage({type: 'code', value: code, variables: priorVariables});

		return this.getRunPromise().promise;
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

	update: function(htmlOrData) {
		// override update method and call it on results child instead
		this._sendMessage({type: 'command', command: 'update', value: htmlOrData});
	},

	getValue: function() {
		return this.getCachedResultsOutput();
	},

	getVariables: function() {
		return this.getCachedResultsVariables();
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
		this.down('#resultsFrame').getWin().postMessage(JSON.stringify(messageObj), '*');
	},

	_handleResults: function(e) {
		var frame = this.down('#resultsFrame').getFrame();
		if (e.source === frame.contentWindow) {
			var eventData = JSON.parse(e.data);
			if (eventData.type) {
				switch (eventData.type) {
					case 'error':
						console.log('iframe error:', eventData);
						this.unmask();
						this.getRunPromise().reject(eventData);
						break;
					case 'command':
						// console.log('iframe command:', eventData);
						switch (eventData.command) {
							case 'init':
								if (this.getIsInitialized() === false) {
									this.setIsInitialized(true);
									clearInterval(this.getInitIntervalID());
									this.update(this.getInitialContent());
									this.fireEvent('initialized', this);
								}
								break;
							case 'clear':
								this._setHeight(0);
								break;
						}
						break;
					case 'result':
						console.log('iframe result:', eventData);
						this.unmask();
						this.getRunPromise().resolve(eventData);
						break;
				}

				if (eventData.output) {
					this.setCachedResultsOutput(eventData.output);
				}

				this.setCachedResultsVariables(eventData.variables);

				if (eventData.height > 0) {
					this._setHeight(eventData.height);
				}
			} else {
				console.warn('unrecognized message!', e);
			}
		}
	},

	_doExpandContract: function() {
		var expandButton = this.down('#expandButton');
		if (this.getExpandResults()) {
			this.setExpandResults(false);
			expandButton.setTooltip('Expand Results');
			expandButton.setGlyph('xf065@FontAwesome');
		} else {
			this.setExpandResults(true);
			expandButton.setTooltip('Contract Results');
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
