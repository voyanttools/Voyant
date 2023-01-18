Ext.define("Voyant.notebook.editor.CodeEditor", {
	extend: "Ext.Component",
	alias: "widget.notebookcodeeditor", 
	mixins: ["Voyant.util.Localization"],
	cls: 'notebook-code-editor',
	config: {
		// theme: 'ace/theme/chrome',
		mode: 'javascript',
		content: '',
		docs: undefined,
		isChangeRegistered: false,
		editor: undefined,
		editedTimeout: undefined,
		editorHeight: undefined,
		editorDocHeight: undefined,
		markers: [],
		parentWrapper: undefined,
		isCollapsed: false
	},
	statics: {
		i18n: {
		},
		api: {
			content: undefined
		},
		ternServer: undefined
	},

	MIN_LINES: 2,

	constructor: function(config) {
		this.callParent(arguments);
	},
	listeners: {
		render: function() {
			var me = this;
			var editorTarget = Ext.getDom(this.getEl());
			var editor = CodeMirror(editorTarget, {
				mode: this._getModeConfig(this.getMode()),
				value: this.getContent(),
				lineNumbers: true,
				lineWrapping: true,
				styleActiveLine: true,
				viewportMargin: 50, // lines rendered above and below current view
				extraKeys: {
					'Shift-Enter': function() {
						me.up('notebookrunnableeditorwrapper').run();
					},
					'Shift-Ctrl-Enter': function() {
						var wrapper = me.up('notebookrunnableeditorwrapper');
						wrapper.up('notebook').runUntil(wrapper);
					},
					'Shift-Cmd-Enter': function() {
						var wrapper = me.up('notebookrunnableeditorwrapper');
						wrapper.up('notebook').runUntil(wrapper);
					},
					'Ctrl-/': function() {
						editor.toggleComment();
					},
					'Cmd-/': function() {
						editor.toggleComment();
					}
				}
			});
			
			editor.on('focus', function(editor, ev) {
				me.getParentWrapper().setIsEditing(true);
			});
			editor.on('blur', function(editor, ev) {
				me.getParentWrapper().setIsEditing(false);
			});

			editor.on('change', function(editor, ev) {
				me.clearMarkers();
				
				var editorHeight = editor.getWrapperElement().offsetHeight;
				var editorDocHeight = editor.getDoc().height;
				if (editorHeight !== me.getEditorHeight() || editorDocHeight !== me.getEditorDocHeight()) {
					me.setEditorHeight(editorHeight);
					me.setEditorDocHeight(editorDocHeight);
					setTimeout(function() {
						var height = editor.getWrapperElement().offsetHeight;
						me.setSize({height: height});
					}, 0);
				}

				if (me.getIsChangeRegistered() === false) {
					me.setIsChangeRegistered(true);
					var wrapper = me.up('notebookrunnableeditorwrapper');
					wrapper.setIsRun(false);
					wrapper.up('notebook').setIsEdited(true);
				} else {
					if (!me.getEditedTimeout()) { // no timeout, so set it to 30 seconds
						me.setEditedTimeout(setTimeout(function() {
							me.setIsChangeRegistered(false);
						}, 30000));
					}
				}
			});

			if (this.getMode() === 'javascript') {
				if (Voyant.notebook.editor.CodeEditor.ternServer === undefined) {
					var defs = this.getDocs();
					var url = Voyant.application.getBaseUrlFull();
					Voyant.notebook.editor.CodeEditor.ternServer = new CodeMirror.TernServer({
						defs: defs,
						useWorker: true,
						workerScript: url+'resources/spyral/tern/worker.js',
						workerDeps: ['tern_worker_deps.js'],
						hintDelay: 5000
					});
				}

				editor.on('keypress', function(ed, event) {
					if (event.key === '.') {
						Voyant.notebook.editor.CodeEditor.ternServer.complete(ed);
					} else if (event.key === '{') {
						// many Spyral methods take a single config object
						// so look out for that and display config object properties
						var cursor = ed.getCursor();
						var range = ed.getRange({line: cursor.line, ch: 0}, cursor);
						if (range.match(/\(\s*$/)) {
							// let closebrackets addon finish and then look for matches
							setTimeout(function() {
								Voyant.notebook.editor.CodeEditor.ternServer.complete(ed);
							}, 50);
						}
					}
				});
				
				Object.assign(editor.getOption('extraKeys'), {
					'Ctrl-Space': function(ed) { Voyant.notebook.editor.CodeEditor.ternServer.complete(ed); },
					'Ctrl-D': function(ed) { Voyant.notebook.editor.CodeEditor.ternServer.showDocs(ed, undefined, me._showDocsCallback.bind(me)); },
					'Cmd-Space': function(ed) { Voyant.notebook.editor.CodeEditor.ternServer.complete(ed); },
					'Cmd-D': function(ed) { Voyant.notebook.editor.CodeEditor.ternServer.showDocs(ed, undefined, me._showDocsCallback.bind(me)); }
				});
				editor.on('cursorActivity', function(ed) { Voyant.notebook.editor.CodeEditor.ternServer.updateArgHints(ed); });
			}

			this.setEditor(editor);

			this._setModeOptions(this.getMode());

			this.expand();

			me.fireEvent('resize', me);

		},
		removed: function(cmp, container) {
			if (cmp.getEditor()) {
				cmp.setEditor(undefined);
			}
		}
		
	},

	_getModeConfig: function(mode) {
		var modeConfig = undefined;
		switch (mode) {
			case 'json':
				modeConfig = { name: 'javascript', json: true };
				break;
			case 'xml':
				modeConfig = 'xml';
				break;
			case 'html':
				modeConfig = { name: 'xml', htmlMode: true }
			default:
				modeConfig = 'javascript';
		}
		return modeConfig;
	},

	_setModeOptions: function(mode) {
		var options = {};
		switch (mode) {
			case 'json':
			case 'javascript':
				options.autoCloseBrackets = true;
				options.matchBrackets = true;
				break;
			default:
				options.autoCloseBrackets = false;
				options.matchBrackets = false;
				break;
		}
		for (var key in options) {
			this.getEditor().setOption(key, options[key]);
		}
	},
	
	switchModes: function(mode) {
		console.log('mode', mode);
		this.setMode(mode);
		if (this.rendered) {
			this.getEditor().setOption('mode', this._getModeConfig(mode));
			this._setModeOptions(mode);
		}
	},
	
	getValue: function() {
		return this.getEditor().getValue();
	},

	addMarker: function(location, type) {
		type = type === undefined ? 'error' : type;
		var cls = 'spyral-editor-'+type;
		var row = location[0];
		var col = location[1];
		col--;
		row--;
		var marker = this.getEditor().getDoc().markText(
			{line: row, ch: col},
			{line: row, ch: col+1},
			{className: cls}
		);
		this.getMarkers().push(marker);
	},

	addLineMarker: function(location, type) {
		type = type === undefined ? 'error' : type;
		var cls = 'spyral-editor-'+type;
		var row = location[0];
		row--;
		var marker = this.getEditor().getDoc().addLineClass(row, 'gutter', cls);
		this.getMarkers().push({marker: marker, where: 'gutter', cls: cls});
	},

	clearMarkers: function() {
		var editor = this.getEditor();
		var markers = this.getMarkers();
		markers.forEach(function(marker) {
			if (marker.marker) {
				editor.getDoc().removeLineClass(marker.marker, marker.where, marker.cls);
			} else {
				marker.clear();
			}
		});
		this.setMarkers([]);
	},

	_showDocsCallback: function() {
		var toolTipEl = this.getEditor().state.ternTooltip;
		var docLink = toolTipEl.querySelector('a');
		if (docLink) {
			docLink.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				var docHref = docLink.getAttribute('href');
				this.up('notebook').handleDocLink(docHref);
			}.bind(this));
		}
	},

	expand: function() {
		var editor = this.getEditor();
		var minHeight = ((this.MIN_LINES+1) * editor.defaultTextHeight()) + 'px';

		var editorWrapperEl = editor.getWrapperElement();
		editorWrapperEl.style.setProperty('min-height', minHeight);
		editor.getScrollerElement().style.setProperty('min-height', minHeight);
		editor.setSize(null, 'auto');

		Ext.fly(editorWrapperEl).unmask();

		this.setSize({height: editor.getWrapperElement().offsetHeight});

		this.setIsCollapsed(false);
	},

	collapse: function() {
		var editor = this.getEditor();
		var height = editor.defaultTextHeight()+8;

		var editorWrapperEl = editor.getWrapperElement();
		editorWrapperEl.style.removeProperty('min-height');
		editor.getScrollerElement().style.removeProperty('min-height');
		editor.setSize(null, height);
		editorWrapperEl.querySelector('.CodeMirror-vscrollbar').style.setProperty('display', 'none');

		var mask = Ext.fly(editorWrapperEl).mask();
		mask.setStyle({cursor: 'pointer', background: 'none'});
		mask.down('.x-mask-msg').hide();
		mask.on('click', function(evt) {
			this.up('notebookrunnableeditorwrapper').expand();
			this.getEditor().focus();
		}.bind(this))

		this.setSize({height: editor.getWrapperElement().offsetHeight});

		this.setIsCollapsed(true);
		
		setTimeout(function() {
			editor.display.input.blur();
		}, 0);
	}
})