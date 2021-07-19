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
			mode: 'ace/mode/'+config.mode
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
						xtype: 'notebookwrapperrun'
					},{
						xtype: 'notebookwrapperrununtil'
					},{
						xtype: 'notebookcodeconfig'
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
			layout: 'anchor',
			defaults: { anchor: '100%' },
			items: [this.editor, this.results]
		});
		
		this.callParent(arguments);
	},
	
	switchModes: function(mode) {
		if (mode !== 'javascript') {
			var notebook = this.up('notebook');
			var order = this.down('notebookwrappercounter').getOrder();
			notebook.addData('', order, undefined, {mode: mode});
			notebook.notebookWrapperRemove(this);
		} else {
			console.log('unhandled mode switch:',mode);
		}
	}
})