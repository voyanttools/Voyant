Ext.define("Voyant.notebook.editor.CodeEditorWrapper", {
	extend: "Voyant.notebook.editor.RunnableEditorWrapper",
	requires: ["Voyant.notebook.editor.CodeEditor","Voyant.notebook.editor.button.Run","Voyant.notebook.editor.button.RunAll"],
	alias: "widget.notebookcodeeditorwrapper",
	cls: 'notebook-code-wrapper',
	statics: {
		i18n: {
		}
	},

	constructor: function(config) {
		config.mode = 'javascript';

		this.editor = Ext.create("Voyant.notebook.editor.CodeEditor", {
			content: Ext.Array.from(config.input).join("\n"),
			docs: config.docs,
			mode: config.mode,
			parentWrapper: this
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
			items: [this.editor, this.results]
		});
		
		this.callParent(arguments);
	},
	
	switchModes: function(mode) {
		if (mode !== 'javascript') {
			var notebook = this.up('notebook');
			notebook.addData('', this.getIndex(), undefined, {mode: mode});
			notebook.notebookWrapperRemove(this);
		} else {
			console.log('unhandled mode switch:',mode);
		}
	}
})