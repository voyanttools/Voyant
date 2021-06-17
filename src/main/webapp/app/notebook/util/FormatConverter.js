Ext.define('Voyant.notebook.util.FormatConverter', {
	importFromHtml: function(html) {
		var me = this;

		var parser = new DOMParser();
		var dom = parser.parseFromString(html, 'text/html');
		
		me.setMetadata(new Spyral.Metadata(dom));
		
		var hasDomError = false;
		var cells2Init = [];
		dom.querySelectorAll("section.notebook-editor-wrapper").forEach(function(section) {
			var classes = section.classList;
			if (classes.contains("notebooktexteditorwrapper")) {
				var editor = section.querySelector(".notebook-text-editor").innerHTML;
				me.addText(editor, undefined, section.id);
			} else if (classes.contains("notebookcodeeditorwrapper")) {
				var inputEl = section.querySelector(".notebook-code-editor-raw");
				var typeRe = /\beditor-mode-(\w+)\b/.exec(inputEl.className);
				var editorType = typeRe[1];
				
				/* in an ideal world we could use inputEl.innerHTML to get the contents
				 * except that since it's in a parsed DOM it's already been transformed
				 *  significantly. For instance, all >, <, and & character appear in the
				 * html entities form (which breaks things like && () => {}). You also
				 * get strange artefacts like if you have "<div>" in your code it may add
				 * </div> to the end of the innerHTML (to make sure tags are balanced).
				 * and of course textContent or innerText won't work because that will
				 * strip any of the HTML formatting out. What's left is to use the parsing
				 * to ensure the order and to properly grab the IDs and then to do character
				 * searches on the original string. */
				var secPos = html.indexOf("<section id='"+section.id+"' class='notebook-editor-wrapper notebookcodeeditorwrapper'>");
				var startPre = html.indexOf("<pre class='notebook-code-editor-raw editor-mode-", secPos);
				startPre = html.indexOf(">", startPre)+1; // add the length of the string
				var endPre = html.indexOf("</pre>\n<div class='notebook-code-results", startPre);
				
				// check if we have valid values
				if (secPos===-1 || startPre === -1 || endPre === -1) {
					hasDomError = true;
					// this might work, unless the js code includes HTML
					input = editorType === "javascript" ? inputEl.innerText : inputEl.innerHTML;
					debugger
				} else {
					input = html.substring(startPre, endPre);
				}
				var autoexec = /\bautoexec\b/.exec(inputEl.className) !== null;
				var output = section.querySelector(".notebook-code-results").innerHTML;
				var expandResults = section.querySelector(".notebook-code-results").classList.contains('collapsed') === false;
				var ui = section.querySelector(".notebook-code-ui");
				if (ui !== null) {
					ui = ui.innerHTML;
				} else {
					ui = undefined;
				}
				var codeCell = me.addCode({
					input: input,
					output: output,
					expandResults: expandResults,
					uiHtml: ui,
					mode: editorType,
					autoExecute: autoexec,
				}, undefined, section.id);

				cells2Init.push(codeCell);
				codeCell.on('initialized', function() {
					var cellIndex = cells2Init.indexOf(codeCell);
					if (cellIndex !== -1) {
						cells2Init.splice(cellIndex, 1);
						if (cells2Init.length === 0) {
							me.fireEvent('notebookInitialized');
						}
					} else {
						console.error('unknown cell initialized', codeCell);
					}
				});

			}
		});

		if (hasDomError) {
			me.showError(me.localize("errorParsingDomInput"))
		}
		
		me.fireEvent('notebookLoaded');
	},

	getInnerHeaderHtml: function() {
		let html = "";
		if (this.getMetadata().title) {
			html += "<div class='title'>"+this.getMetadata().title+"</div>";
		}
		if (this.getMetadata().author) {
			html += "<div class='author'>"+this.getMetadata().author+"</div>";
		}
		return html;
	},
	
	getInnerFooterHtml: function() {
		var text = "", metadata = this.getMetadata();
		if (metadata.author || metadata.license) {
			var text = "&copy;";
			if (metadata.author) {text+=" "+metadata.author;}
			if (metadata.license) {text+=" ("+metadata.license+")";}
			text += ". ";
		}
		if (metadata.created || metadata.modified) {
			var created = metadata.shortDate("created"), modified = metadata.shortDate("modified");
			if (created) {
				text += this.localize("created")+" "+created+"."
			}
			if (modified && created!=modified) {
				text += " "+this.localize("modified")+" "+modified+"."
			}
			
		}
		return text;
	},

	generateExportHtml: function() {
		var metadata = this.getMetadata();
		var out = "<!DOCTYPE HTML>\n<html>\n<head>\n\t<meta charset='UTF-8'>\n"+
			metadata.getHeaders();
		var aceChromeEl = document.getElementById("ace-chrome");
		if (aceChromeEl) {out+=aceChromeEl.outerHTML+"\n"}
		
		// TODO voyant-notebooks-styles has been removed
		var stylesEl = document.getElementById("voyant-notebooks-styles");
		if (stylesEl) {out+=stylesEl.outerHTML+"\n"}

		out += "<script> // this script checks to see if embedded tools seem to be available\n"+
			"window.addEventListener('load', function() {\n"+
				"var hostnames = {}, warned = false;\n"+
				"document.querySelectorAll('iframe').forEach(function(iframeEl) {\n"+
					"let url = new URL(iframeEl.src);\n"+
					"if (!(url.hostname in hostnames) && !warned) {\n"+
						"hostnames[url.hostname] = true; // mark as fetched\n"+
						"fetch(url).catch(response => {\n"+
							"warned = true;\n"+
							"alert('This notebook seems to contain one ore more tools that may not be able to load. Possible reasons include a server no longer being accessible (especially if the notebook was generated from a local server), or because of security restrictions.'+url)\n"+
						"})\n"+
					"}\n"+
				"})\n"+
			"})\n"+
			"</script>\n"+
			"</head>\n<body class='exported-notebook'>"+
			"<header class='spyral-header'>"+this.getInnerHeaderHtml()+"</header>\n"+
			"<article class='spyralArticle'>";

		this.getComponent("cells").items.each(function(item, i) {
			var type = item.isXType('notebookcodeeditorwrapper') ? 'code' : 'text';
			var content = item.getContent();
			var counter = item.down("notebookwrappercounter");
			// reminder that the parsing in of notebooks depends on the stability of this syntax
			out+="<section id='"+counter.name+"' class='notebook-editor-wrapper "+item.xtype+"'>\n"+
				"<div class='notebookwrappercounter'>"+counter.getTargetEl().dom.innerHTML+"</div>";
			if (type==='code') {
				var mode = item.down("notebookcodeeditor").getMode();
				mode = mode.substring(mode.lastIndexOf("/")+1);

				var expandResults = item.getExpandResults();
				
				var autoexec = item.getAutoExecute() ? 'autoexec' : '';
				
				var codeTextLayer = item.getTargetEl().query('.ace_text-layer')[0].cloneNode(true);
				codeTextLayer.style.setProperty('height', 'auto'); // fix for very large height set by ace
				// reminder that the parsing in of notebooks depends on the stability of this syntax
				out+="<div class='notebook-code-editor ace-chrome'>\n"+codeTextLayer.outerHTML+"\n</div>\n"+
					"<pre class='notebook-code-editor-raw editor-mode-"+mode+" "+autoexec+"'>"+content.input+"</pre>\n"+
					"<div class='notebook-code-results"+(expandResults ? '' : ' collapsed')+"'>\n"+content.output+"\n</div>\n";
				if (content.ui !== undefined) {
					out += "<div class='notebook-code-ui'>\n"+content.ui+"\n</div>\n";
				}
			} else {
				out+="<div class='notebook-text-editor'>"+content+"</div>\n";
			}
			out+="</section>\n"
		})
		out += "</article>\n<footer class='spyral-footer'>"+this.getInnerFooterHtml()+"</footer></body>\n</html>";
		return out;
	},

	generateExportMetadata: function(metadata) {
		var clone = metadata.clone(); // use a clone so that altering title and description doesn't affect original
		
		if (clone.title) {
			clone.title = clone.title.replace(/<\/?\w+.*?>/g, '');
		}
		if (clone.description) {
			clone.description = clone.description.replace(/<\/?\w+.*?>/g, '');
		}

		if (clone.keywords) {
			if (Array.isArray(clone.keywords) === false) {
				clone.keywords = clone.keywords.split(/[\s,]+/)
			}
			clone.keywords = clone.keywords.reduce(function(keywordsArray, keyword) {
				if (keyword.length > 0) {
					keywordsArray.push(keyword.toLowerCase());
				}
				return keywordsArray;
			}, []);
		}

		return clone;
	},




	/*
	 * Export dialog options below
	 */
	
	getExtraExportItems: function() {
		return [{
			inputValue: 'html',
			boxLabel: this.localize('exportHtml')
		},{
			inputValue: 'htmlDownload',
			boxLabel: '<a href="#">'+this.localize('exportHtmlDownload')+'</a>',
			listeners: {
				afterrender: function(cmp) {
					var file, name = (this.getNotebookId() || "spyral")+ ".html",
					data = this.generateExportHtml(),
					properties = {type: 'text/html'};
					try {
					  file = new File([data], name, properties);
					} catch (e) {
					  file = new Blob([data], properties);
					}

					var url = URL.createObjectURL(file);
					var a = cmp.boxLabelEl.dom.querySelector("a");
					a.setAttribute("download", name);
					a.setAttribute("href", url);
				},
				scope: this
			},
			handler: function(cmp) {
				cmp.boxLabelEl.dom.querySelector("a").click();
				cmp.up("window").close();
			}
		}]
	},
	
	exportHtml: function() {
		var out = this.generateExportHtml();
		var myWindow = window.open();
		myWindow.document.write(out);
		myWindow.document.close();
		myWindow.focus();
	},
	
	getExportUrl: function(asTool) {
		return location.href; // we just provide the current URL
	},
})