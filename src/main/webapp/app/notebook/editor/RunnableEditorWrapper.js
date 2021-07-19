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
	 * @param {boolean} forceRun True to force the code to run, otherwise a check is performed to see if previous editors have already run.
	 * @param {array} priorVariables Variables from prior cells that should be eval'd before this cell's code
	 */
	run: function(forceRun, priorVariables) {
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
			if (eventData.error !== undefined && eventData.error.row !== undefined) {
				this.editor.addLineMarker(eventData.error.row, 'error');
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

	_reduceOutput: function(output) {
		var html = new DOMParser().parseFromString(output, 'text/html');
		
		var container = html.querySelector('.spyral-dv-container');
		if (container !== null) {
			// if dataviewer, parse the output and return the top level in the hierarchy
			if (container.querySelectorAll('.spyral-dv-folder-icon').length > 0) {
				container.querySelector('.spyral-dv-right .spyral-dv-right').remove();
			}

			return container.outerHTML;
		} else {
			return output;
		}
	},

	getContent: function() {
		var output = this._reduceOutput(this.results.getOutput());
		return {
			input: this.getInput(),
			output: output,
			mode: this.getMode(),
			expandResults: this.results.getExpandResults()
		};
	}
});
