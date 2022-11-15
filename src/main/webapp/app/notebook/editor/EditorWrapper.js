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
					floating: true, // TODO toolbars float above notebook header
					shadow: false,
					preventRefocus: true, // prevents focusing on collapsed/blurred CodeEditor when hiding toolbar
					layout: 'auto',
					defaults: { margin: '0 0 3px 3px', cls: 'x-btn x-btn-default-toolbar-small', iconCls: 'x-btn-icon-el-default-toolbar-small' },
					items: [{
						style: {float: 'left'},
						xtype: 'notebookwrapperexpandcollapse'
					},{
						style: {float: 'left'},
						xtype: 'notebookwrapperrun'
					},{
						style: {float: 'right', clear: 'both'},
						xtype: 'button',
						glyph: 'xf0c9@FontAwesome',
						arrowVisible: false,
						menuAlign: 'tr-br?',
						menu: {
							items: [{
								text: 'Add',
								glyph: 'xf067@FontAwesome',
								menu: {
									items: [{
										text: 'Add Text',
										glyph: 'xf0f6@FontAwesome',
										handler: function() {
											var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
											var notebook = ed.findParentByType('notebook');
											var cmp = notebook.addText('',ed.getIndex()+1);
											cmp.getTargetEl().scrollIntoView(notebook.getTargetEl(), null, true, true);
											notebook.redoOrder();
										}
									},{
										text: 'Add Code',
										glyph: 'xf121@FontAwesome',
										handler: function() {
											var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
											var notebook = ed.findParentByType('notebook');
											var cmp = notebook.addCode('',ed.getIndex()+1);
											cmp.getTargetEl().scrollIntoView(notebook.getTargetEl(), null, true, true);
											notebook.redoOrder();
										}
									}]
								}
							},{
								xtype: 'notebookwrapperrununtil'
							},{
								xtype: 'notebookcodeconfig'
							},{
								xtype: 'notebookwrapperexport'
							},'-',{
								text: 'Move',
								glyph: 'xf07d@FontAwesome',
								menu: {
									items: [{
										xtype: 'notebookwrappermoveup'
									},{
										xtype: 'notebookwrappermovedown'
									}]
								}
							},{
								xtype: 'notebookwrapperremove'
							}]
						}
					}]
				});
			}
			if (Voyant.notebook.editor.EditorWrapper.toolbarRight === undefined) {
				Voyant.notebook.editor.EditorWrapper.toolbarRight = Ext.create('Ext.container.Container', {
					floating: true,
					shadow: false,
					preventRefocus: true,
					layout: { type: 'vbox', align: 'middle', pack: 'start' },
					defaults: { margin: '0 3px 3px 3px', cls: 'x-btn x-btn-default-toolbar-small', iconCls: 'x-btn-icon-el-default-toolbar-small' },
					items: [{
						xtype: 'notebookwrappercounter'
					}],
					listeners: {
						boxready: function(cmp) {
							// cmp.getEl().on('mouseleave', Voyant.notebook.editor.EditorWrapper.hideToolbars, this);
						}
					}
				});
			}

			if (Voyant.notebook.editor.EditorWrapper.toolbarLeft.down('menu').isVisible()) return; // don't change toolbars when menu is open

			var showButtons = [];
			if (editor.xtype === 'notebookcodeeditorwrapper') {
				showButtons = ['notebookwrapperadd', 'notebookwrapperrun', 'notebookwrapperrununtil', 'notebookcodeconfig', 'notebookwrapperexpandcollapse', 'notebookwrapperremove'];
			} else if (editor.xtype === 'notebookdatawrapper') {
				showButtons = ['notebookwrapperadd', 'notebookwrapperrun', 'notebookwrapperrununtil', 'notebookcodeconfig', 'notebookwrapperexport', 'notebookwrapperexpandcollapse', 'notebookwrapperremove'];
			} else {
				showButtons = ['notebookwrapperadd', 'notebookwrapperremove'];
			}

			var isTextEditor = editor.xtype === 'notebooktexteditorwrapper';
			var expandCollapseBtn = Voyant.notebook.editor.EditorWrapper.toolbarLeft.down('notebookwrapperexpandcollapse');
			if (isTextEditor) {
				expandCollapseBtn.setVisible(false);
			} else {
				expandCollapseBtn.setCollapsed(editor.editor.getIsCollapsed());
				expandCollapseBtn.setVisible(true);
			}

			var counter = Voyant.notebook.editor.EditorWrapper.toolbarRight.down('notebookwrappercounter');
			counter.setName(editor.getCellId());
			counter.setOrder(editor.getIndex());

			var box = editor.body.getBox();
			Voyant.notebook.editor.EditorWrapper.toolbarLeft.showAt(box.x-(isTextEditor ? 31 : 58), box.y, false);
			Voyant.notebook.editor.EditorWrapper.toolbarRight.showAt(box.x+box.width, box.y, false);
		},
		hideToolbars: function(evt, force) {
			if (Voyant.notebook.editor.EditorWrapper.toolbarLeft.down('menu').isVisible()) return; // don't change toolbars when menu is open

			if (Voyant.notebook.editor.EditorWrapper.currentEditor) {
				var doHide = force ? true : false;
				if (!doHide) {
					if (evt.relatedTarget !== null) {
						var isAncestor = Voyant.notebook.editor.EditorWrapper.toolbarLeft.getEl().isAncestor(evt.relatedTarget) || Voyant.notebook.editor.EditorWrapper.toolbarRight.getEl().isAncestor(evt.relatedTarget)
						doHide = !isAncestor;
					}
				}
				if (doHide) {
					if (Voyant.notebook.editor.EditorWrapper.currentEditor.body) {
						Voyant.notebook.editor.EditorWrapper.currentEditor.body.removeCls('notebook-editor-wrapper-hover');
					}
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