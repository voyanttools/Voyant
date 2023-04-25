Ext.define("Voyant.notebook.editor.EditorWrapper", {
	extend: "Ext.panel.Panel",
	mixins: ["Voyant.util.Localization"],
	alias: "widget.notebookeditorwrapper",
	cls: "notebook-editor-wrapper",
	config: {
		cellId: undefined,
		index: undefined,
		content: '',
		isEditing: false,
		isCollapsed: false // custom tracker instead of using Panel's collapsed, which causes due to our overrides
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
						style: {float: 'right'},
						xtype: 'notebookwrapperrun',
						itemId: 'notebookwrapperrun'
					},{
						style: {float: 'right'},
						xtype: 'notebookwrapperadd',
						itemId: 'notebookwrapperadd'
					},{
						style: {float: 'right', clear: 'both'},
						xtype: 'button',
						glyph: 'xf0c9@FontAwesome',
						arrowVisible: false,
						menuAlign: 'tr-br?',
						menu: {
							items: [{
								xtype: 'notebookwrapperrununtil',
								itemId: 'notebookwrapperrununtil'
							},{
								xtype: 'notebookcodeconfig',
								itemId: 'notebookcodeconfig'
							},{
								xtype: 'notebookwrapperexpandcollapse',
								itemId: 'notebookwrapperexpandcollapse'
							},{
								xtype: 'notebookwrapperexport',
								itemId: 'notebookwrapperexport'
							},{
								xtype: 'menuseparator', itemId: 'menuseparator'
							},{
								text: 'Move',
								glyph: 'xf07d@FontAwesome',
								itemId: 'notebookwrappermove',
								menu: {
									items: [{
										xtype: 'notebookwrappermoveup'
									},{
										xtype: 'notebookwrappermovedown'
									}]
								}
							}],
							listeners: {
								show: function(menu) {
									var ed = Voyant.notebook.editor.EditorWrapper.currentEditor;
									menu.down('#notebookwrapperexpandcollapse').setCollapsed(ed.getIsCollapsed());
								}
							}
						}
					},{
						style: {float: 'left'},
						xtype: 'notebookwrapperremove',
						itemId: 'notebookwrapperremove'
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
					}]
				});
			}

			if (Voyant.notebook.editor.EditorWrapper.toolbarLeft.down('menu').isVisible()) return; // don't change toolbars when menu is open

			var showButtons = [];
			if (editor.xtype === 'notebookcodeeditorwrapper') {
				showButtons = ['notebookwrapperadd', 'notebookwrapperrun', 'notebookwrapperrununtil', 'notebookcodeconfig', 'notebookwrapperexpandcollapse', 'notebookwrappermove', 'notebookwrapperremove', 'menuseparator'];
			} else if (editor.xtype === 'notebookdatawrapper') {
				showButtons = ['notebookwrapperadd', 'notebookwrapperrun', 'notebookwrapperrununtil', 'notebookcodeconfig', 'notebookwrapperexport', 'notebookwrapperexpandcollapse', 'notebookwrappermove', 'notebookwrapperremove', 'menuseparator'];
			} else {
				showButtons = ['notebookwrapperadd', 'notebookwrappermove', 'notebookwrapperremove'];
			}
			Voyant.notebook.editor.EditorWrapper.toolbarLeft.query('button, menuitem').forEach(function(button) {
				if (button.itemId) { button.setVisible(showButtons.indexOf(button.itemId) !== -1); }
			});

			if (editor.xtype === 'notebookrunnableeditorwrapper') {
				var expandCollapseBtn = Voyant.notebook.editor.EditorWrapper.toolbarLeft.down('notebookwrapperexpandcollapse');
				expandCollapseBtn.setCollapsed(editor.editor.getIsCollapsed());
			}

			var counter = Voyant.notebook.editor.EditorWrapper.toolbarRight.down('notebookwrappercounter');
			counter.setName(editor.getCellId());
			counter.setOrder(editor.getIndex());

			var box = editor.body.getBox();
			Voyant.notebook.editor.EditorWrapper.toolbarLeft.showAt(box.x-58, box.y, false);
			Voyant.notebook.editor.EditorWrapper.toolbarRight.showAt(box.x+box.width, box.y, false);
		},
		hideToolbars: function(evt, force) {
			// don't change toolbars when menu is open
			if (Voyant.notebook.editor.EditorWrapper.toolbarLeft.down('menu').isVisible()) return;

			// hide any open submenus
			Voyant.notebook.editor.EditorWrapper.toolbarLeft.query('menu menu').forEach(function(menu) { menu.setVisible(false); });

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