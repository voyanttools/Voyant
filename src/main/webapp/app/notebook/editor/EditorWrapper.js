Ext.define("Voyant.notebook.editor.EditorWrapper", {
	extend: "Ext.panel.Panel",
	mixins: ["Voyant.util.Localization"],
	alias: "widget.notebookeditorwrapper",
	cls: "notebook-editor-wrapper",
	config: {
		cellId: undefined,
		index: undefined,
		content: '',
		isEditing: false
	},
	statics: {
		currentEditor: undefined, // used primarily by toolbar buttons to determine the target of their actions
		toolbarLeft: undefined,
		toolbarRight: undefined,
		showToolbars: function(editor) {
			Voyant.notebook.editor.EditorWrapper.currentEditor = editor;
			Voyant.notebook.editor.EditorWrapper.currentEditor.body.addCls('notebook-editor-wrapper-hover');

			if (Voyant.notebook.editor.EditorWrapper.toolbarLeft === undefined) {
				Voyant.notebook.editor.EditorWrapper.toolbarLeft = Ext.create('Ext.container.Container', {
					floating: true,
					shadow: false,
					layout: { type: 'vbox', align: 'middle', pack: 'start' },
					defaults: { margin: 3, cls: 'x-btn x-btn-default-toolbar-small', iconCls: 'x-btn-icon-el-default-toolbar-small' },
					items: [{
						xtype: 'notebookwrapperadd'
					},{
						xtype: 'notebookwrapperrun'
					},{
						xtype: 'notebookwrapperrununtil'
					},{
						xtype: 'notebookcodeconfig'
					},{
						xtype: 'notebookwrapperexport'
					}],
					listeners: {
						boxready: function(cmp) {
							cmp.getEl().on('mouseleave', Voyant.notebook.editor.EditorWrapper.hideToolbars, this);
						}
					}
				});
			}
			if (Voyant.notebook.editor.EditorWrapper.toolbarRight === undefined) {
				Voyant.notebook.editor.EditorWrapper.toolbarRight = Ext.create('Ext.container.Container', {
					floating: true,
					shadow: false,
					layout: { type: 'vbox', align: 'middle', pack: 'start' },
					defaults: { margin: 3, cls: 'x-btn x-btn-default-toolbar-small', iconCls: 'x-btn-icon-el-default-toolbar-small' },
					items: [{
						xtype: 'notebookwrappercounter'
					},{
						xtype: 'notebookwrapperremove'
					},{
						xtype: 'notebookwrappermoveup'
					},{
						xtype: 'notebookwrappermovedown'
					}],
					listeners: {
						boxready: function(cmp) {
							cmp.getEl().on('mouseleave', Voyant.notebook.editor.EditorWrapper.hideToolbars, this);
						}
					}
				});
			}

			var showButtons = [];
			if (editor.xtype === 'notebookcodeeditorwrapper') {
				showButtons = ['notebookwrapperadd', 'notebookwrapperrun', 'notebookwrapperrununtil', 'notebookcodeconfig'];
			} else if (editor.xtype === 'notebookdatawrapper') {
				showButtons = ['notebookwrapperadd', 'notebookwrapperrun', 'notebookwrapperrununtil', 'notebookcodeconfig', 'notebookwrapperexport'];
			} else {
				showButtons = ['notebookwrapperadd'];
			}
			Voyant.notebook.editor.EditorWrapper.toolbarLeft.query('button').forEach(function(button) {
				button.setVisible(showButtons.indexOf(button.xtype) !== -1);
			});

			var counter = Voyant.notebook.editor.EditorWrapper.toolbarRight.down('notebookwrappercounter');
			counter.setName(editor.getCellId());
			counter.setOrder(editor.getIndex());

			var box = editor.body.getBox();
			Voyant.notebook.editor.EditorWrapper.toolbarLeft.showAt(box.x-33, box.y, false);
			Voyant.notebook.editor.EditorWrapper.toolbarRight.showAt(box.x+box.width+3, box.y, false);
		},
		hideToolbars: function(evt, force) {
			if (Voyant.notebook.editor.EditorWrapper.currentEditor) {
				var doHide = force ? true : false;
				if (!doHide) {
					var box = Voyant.notebook.editor.EditorWrapper.currentEditor.body.getBox();
					doHide = evt.pageX < box.x-33 || evt.pageX >= box.x+box.width+33 || evt.pageY < box.y || evt.pageY >= box.y+box.height;
				}
				if (doHide) {
					Voyant.notebook.editor.EditorWrapper.currentEditor.body.removeCls('notebook-editor-wrapper-hover');
					Voyant.notebook.editor.EditorWrapper.currentEditor = undefined;

					if (Voyant.notebook.editor.EditorWrapper.toolbarLeft !== undefined) {
						Voyant.notebook.editor.EditorWrapper.toolbarLeft.hide();
					}
					if (Voyant.notebook.editor.EditorWrapper.toolbarRight !== undefined) {
						Voyant.notebook.editor.EditorWrapper.toolbarRight.hide();
					}
				}
			}
		}
	},
	border: false,
	bodyBorder: false,
	initComponent: function() {
		this.setCellId(this.config.cellId);
		this.on("afterrender", function(){
			this.mon(this.getEl(), "mouseover", function() {
				Voyant.notebook.editor.EditorWrapper.showToolbars(this);
			}, this);
			this.mon(this.getEl(), "mouseleave", function(evt) {
				Voyant.notebook.editor.EditorWrapper.hideToolbars(evt);
			}, this);
		}, this);
		this.callParent(arguments);
	},
	getContent: function() {
		throw new Error('Subclass must override!');
	},
	applyIsEditing: function(val) {
		if (this.rendered) {
			if (val) {
				this.body.addCls('notebook-editor-wrapper-editing');
			} else {
				this.body.removeCls('notebook-editor-wrapper-editing');
			}
		}
		return val;
	}
})