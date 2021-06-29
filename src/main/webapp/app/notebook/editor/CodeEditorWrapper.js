Ext.define("Voyant.notebook.editor.CodeEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	requires: ["Voyant.notebook.editor.CodeEditor","Voyant.notebook.editor.button.Run","Voyant.notebook.editor.button.RunAll"],
	alias: "widget.notebookcodeeditorwrapper",
	cls: 'notebook-code-wrapper',
	statics: {
		i18n: {
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
						hidden: !runnable
					},{
						glyph: 'xf050@FontAwesome',
						xtype: 'notebookwrapperrununtil',
						hidden: !runnable
					},{
						xtype: 'notebookcodeconfig'
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
		this.down('notebookwrapperrununtil').setVisible(runnable);
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