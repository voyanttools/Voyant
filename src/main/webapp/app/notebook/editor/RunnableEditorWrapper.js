Ext.define("Voyant.notebook.editor.RunnableEditorWrapper", {
	extend: "Voyant.notebook.editor.EditorWrapper",
	mixins: ["Voyant.util.Localization"],
	alias: "widget.notebookrunnableeditorwrapper",
	config: {
		isRun: false,
		mode: 'javascript'
	},

	editor: undefined,
	results: undefined,

	constructor: function(config) {
		this.results.addListener('initialized', this.updateLayout, this);

		this.callParent(arguments);
	},

	/**
	 * Run the code in this editor.
	 * @param {array} priorVariables Variables from prior cells that should be eval'd before this cell's code
	 */
	run: function(priorVariables) {
		if (this.results.getIsInitialized()) {
			if (priorVariables === undefined) {
				console.log('fetching prior vars');
				priorVariables = this.up('notebook').getNotebookVariables(this);
			}
			return this._run(priorVariables);
		} else {
			return Ext.Promise.reject('Editor is not initialized');
		}
	},
	
	_run: function(priorVariables) {
		this.results.clear();

		this.editor.clearMarkers();

		var code = this.editor.getValue();

		this.setIsRun(true);
		
		var runPromise = this.results.run(code, priorVariables);
		runPromise.otherwise(function(eventData) {
			if (eventData.error !== undefined) {
				var location = eventData.error.location;
				if (location !== undefined) {
					this.editor.addMarker(location, 'error');
					this.editor.addLineMarker(location, 'error');
				}
			}
		}, this);

		return runPromise;
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

	getOutput: function() {
		if (this.results.getHasRunError()) {
			return undefined;
		} else {
			return this.results.getCachedResultsValue();
		}
	},

	_reduceDataViewerOutput: function(output) {
		var html = new DOMParser().parseFromString(output, 'text/html');
		
		var container = html.querySelector('.spyral-dv-container');
		if (container !== null) {
			// if dataviewer, trim the content that will be saved
			function trimContent(parent, limit) {
				var content = parent.querySelector('.spyral-dv-content .spyral-dv-right');
				if (content !== null) {
					var toRemove = [];
					var wasTrimmed = false;
					for (var i = 0; i < content.children.length; i++) {
						if (i >= limit) {
							toRemove.push(content.children[i]);
							wasTrimmed = true;
						} else {
							trimContent(content.children[i], limit);
						}
					}
					toRemove.forEach(function(node) { content.removeChild(node); });
					if (wasTrimmed) {
						content.insertAdjacentHTML('beforeend', '<span class="spyral-dv-content">...</span>')
					}
				}
			}
			trimContent(container, 10);

			return container.outerHTML.replace(/spyral-dv-collapsed/g, 'spyral-dv-expanded'); // expand all nodes
		} else {
			return output;
		}
	},

	// override Ext.Panel expand/collapse
	expand: function() {
		this.editor.expand();
		this.setIsCollapsed(false);
	},
	collapse: function() {
		this.editor.collapse();
		this.setIsCollapsed(true);
	},

	/**
	 * This is a method for getting string versions of input and output content.
	 * Primarily used when saving the notebook.
	 * @returns {Object}
	 */
	getContent: function() {
		var output = this._reduceDataViewerOutput(this.results.getOutput());
		return {
			input: this.getInput(),
			output: output,
			mode: this.getMode(),
			expandResults: this.results.getExpandResults()
		};
	}
});
