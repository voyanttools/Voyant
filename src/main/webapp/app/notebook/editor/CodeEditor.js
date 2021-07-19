Ext.define("Voyant.notebook.editor.CodeEditor", {
	extend: "Ext.Component",
	alias: "widget.notebookcodeeditor", 
	mixins: ["Voyant.util.Localization",'Voyant.notebook.util.Embed'],
	embeddable: ["Voyant.notebook.editor.CodeEditor"],
	cls: 'notebook-code-editor',
	config: {
		theme: 'ace/theme/chrome',
		mode: 'ace/mode/javascript',
		content: '',
		docs: undefined,
		isChangeRegistered: false,
		editor: undefined,
		editedTimeout: undefined,
		lines: 0,
		maxLines: Infinity
	},
	statics: {
		i18n: {
		},
		api: {
			content: undefined
		}
	},

	MIN_LINES: 6,

	constructor: function(config) {
		this.callParent(arguments);
	},
	listeners: {
		render: function() {
			var me = this;
			var editor = ace.edit(Ext.getDom(this.getEl()));
			
			editor.$blockScrolling = Infinity;
			editor.getSession().setUseWorker(true);
			editor.setTheme(this.getTheme());
			editor.getSession().setMode(this.getMode());
			editor.setOptions({
				minLines: me.MIN_LINES,
				maxLines: this.getMaxLines(),
				autoScrollEditorIntoView: true,
				scrollPastEnd: true,
				highlightActiveLine: false,
				
			});
			editor.renderer.setOptions({
				showGutter: true,
				showFoldWidgets: false,
				showPrintMargin: false
			});

			editor.renderer.once('afterRender', function() {
				me.fireEvent('resize', me);
			});

			// editor['$mouseHandler'].setOptions({
			// 	tooltipFollowsMouse: false
			// });
			
			editor.setValue(this.getContent() ? this.getContent() : "" /*this.localize('emptyText')*/);
			editor.clearSelection();

			editor.on("focus", function() {
				setTimeout(function() {
					me.getEditor().setHighlightGutterLine(true);
				}, 100); // slight delay to avoid selecting a range of text, caused by showing the gutter while mouse is still pressed
			}, this);
			editor.on("change", function(ev, editor) {
				me.clearMarkers();
				
				var lines = editor.getSession().getScreenLength();
				if (lines > me.MIN_LINES && lines !== me.getLines()) {
					me.setLines(lines);
					if (me.getMaxLines() === Infinity) {
						var height = lines*editor.renderer.lineHeight+editor.renderer.scrollBar.getWidth();
						me.setSize({height: height});
					}
				}
				if (me.getIsChangeRegistered()==false) {
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
			}, this);
			editor.on("blur", function() {
				me.getEditor().setHighlightGutterLine(false);
			});
			// TODO fix tooltip positioning
			// editor.on("showGutterTooltip", function(tooltip, editor) {
			// 	if (tooltip['$element'].style.transform === '') {
			// 		var rect = editor.renderer.getContainerElement().getBoundingClientRect();
			// 		tooltip['$element'].style.transform = 'translate(-'+rect.x+'px, -'+rect.height+'px)';
			// 	}
			// });
			editor.commands.addCommand({
				name: 'run',
				bindKey: {win: "Shift-Enter", mac: "Shift-Enter"}, // additional bindings like alt/cmd-enter don't seem to work
				exec: function(editor) {
					me.up('notebookrunnableeditorwrapper').run();
				}
			});
			editor.commands.addCommand({
				name: 'rununtil',
				bindKey: {win: "Ctrl-Shift-Enter", mac: "Command-Shift-Enter"}, // additional bindings like alt/cmd-enter don't seem to work
				exec: function(editor) {
					var wrapper = me.up('notebookrunnableeditorwrapper');
					wrapper.up('notebook').runUntil(wrapper);
				}
			});
			this.setEditor(editor);

			ace.config.loadModule('ace/ext/tern', function (module) {
				me.getEditor().setOptions({
					/**
					 * Either `true` or `false` or to enable with custom options pass object that
					 * has options for tern server: http://ternjs.net/doc/manual.html#server_api
					 * If `true`, then default options will be used
					 */
					enableTern: {
						/* http://ternjs.net/doc/manual.html#option_defs */
						defs: me.docs ? ['browser', 'ecma5', me.docs] : ['ecma5', 'browser'],
						plugins: {
							doc_comment: {
								fullDocs: true
							}
						},
						/**
						 * (default is true) If web worker is used for tern server.
						 * This is recommended as it offers better performance, but prevents this from working in a local html file due to browser security restrictions
						 */
						useWorker: true
					},
					/**
					 * when using tern, it takes over Ace's built in snippets support.
					 * this setting affects all modes when using tern, not just javascript.
					 */
					enableSnippets: false,
					
					/**
					 * when using tern, Ace's basic text auto completion is enabled still by default.
					 * This settings affects all modes when using tern, not just javascript.
					 * For javascript mode the basic auto completion will be added to completion results if tern fails to find completions or if you double tab the hotkey for get completion (default is ctrl+space, so hit ctrl+space twice rapidly to include basic text completions in the result)
					 */
					enableBasicAutocompletion: false
				});
			});
		},
		removed: function(cmp, container) {
			if (cmp.getEditor()) {
				cmp.getEditor().destroy();
			}
		}
		
	},
	
	switchModes: function(mode) {
		this.setMode('ace/mode/'+mode);
		if (this.rendered) {
			this.getEditor().getSession().setMode(this.getMode());
		}
	},
	
	getValue: function() {
		return this.getEditor().getValue();
	},

	addLineMarker: function(lineNumber, type) {
		type = type === undefined ? 'error' : type;
		lineNumber--; // need to change to zero based numbering to get correct position
		this.getEditor().getSession().addMarker(new ace.Range(lineNumber, 0, lineNumber, 1), 'spyral-editor-'+type, 'screenLine', false);
	},

	clearMarkers: function() {
		var session = this.getEditor().getSession();
		var markers = session.getMarkers(false);
		for (var key in markers) {
			if (markers[key]['clazz'].indexOf('spyral-editor') !== -1) {
				session.removeMarker(key);
			}
		}
	}
})