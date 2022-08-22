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
			} else if (classes.contains("notebookcodeeditorwrapper") || classes.contains("notebookdatawrapper")) {
				var inputEl = section.querySelector(".notebook-code-editor-raw");
				var typeRe = /\beditor-mode-(\w+)\b/.exec(inputEl.className);
				var editorType = typeRe[1];
				var matchClass = 'notebookcodeeditorwrapper';
				if (editorType !== 'javascript') {
					matchClass = 'notebookdatawrapper';
				}
				
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
				var secPos = html.indexOf("<section id='"+section.id+"' class='notebook-editor-wrapper "+matchClass+"'>");
				var startPre = html.indexOf("<pre class='notebook-code-editor-raw editor-mode-", secPos);
				startPre = html.indexOf(">", startPre)+1; // add the length of the string
				var endPre = html.indexOf("</pre>\n<div class='notebook-code-results", startPre);
				
				// check if we have valid values
				if (secPos===-1 || startPre === -1 || endPre === -1) {
					hasDomError = true;
					// this might work, unless the js code includes HTML
					input = editorType === "javascript" ? inputEl.innerText : inputEl.innerHTML;
				} else {
					input = html.substring(startPre, endPre);
				}

				var output = section.querySelector(".notebook-code-results").innerHTML;
				var expandResults = section.querySelector(".notebook-code-results").classList.contains('collapsed') === false;

				if (editorType === 'javascript') {
					var codeCell = me.addCode({
						input: input,
						output: output,
						expandResults: expandResults,
						mode: editorType
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
				} else {
					// hack to get the data name from the dataviewer
					var dataName = section.querySelector('.notebook-code-results .spyral-dv-left').firstChild.data;
					dataName = dataName.split(':')[0];
					var dataCell = me.addData({
						input: input,
						output: output,
						expandResults: expandResults,
						dataName: dataName,
						mode: editorType
					}, undefined, section.id);
					cells2Init.push(dataCell);
					dataCell.on('initialized', function() {
						var cellIndex = cells2Init.indexOf(dataCell);
						if (cellIndex !== -1) {
							cells2Init.splice(cellIndex, 1);
							if (cells2Init.length === 0) {
								me.fireEvent('notebookInitialized');
							}
						} else {
							console.error('unknown cell initialized', dataCell);
						}
					});
				}
			}
		});

		if (hasDomError) {
			me.showError(me.localize("errorParsingDomInput"))
		}
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
		var out = "<!DOCTYPE HTML>\n<html>\n<head>\n<meta charset='UTF-8'>\n";

		var metadata = this.getMetadata();
		out += metadata.getHeaders();

		out += '<link rel="stylesheet" type="text/css" href="https://voyant-tools.org/resources/codemirror/lib/codemirror.css">'
		+'<link rel="stylesheet" type="text/css" href="https://voyant-tools.org/resources/spyral/css/codemirror.css">'
		+'<link rel="stylesheet" type="text/css" href="https://voyant-tools.org/resources/spyral/css/spyral.css">'
		+'<link rel="stylesheet" type="text/css" href="https://voyant-tools.org/resources/spyral/css/dataviewer.css">';

		out += "</head>\n"
		+"<body class='exported-notebook'>\n"
		+"<header class='spyral-header'>"+this.getInnerHeaderHtml()+"</header>\n"
		+"<article class='spyralArticle'>\n";

		this.getComponent("cells").items.each(function(item, i) {
			out+="<section id='"+item.getCellId()+"' class='notebook-editor-wrapper "+item.xtype+"'>\n"+
			"<div class='notebookwrappercounter'>"+(item.getIndex()+1)+"</div>";

			var content = item.getContent();
			if (item.isXType('notebooktexteditorwrapper')) {
				out+="<div class='notebook-text-editor'>"+content+"</div>\n";
			} else {	
				var codeTextLayer = item.getTargetEl().query('.CodeMirror-wrap')[0].cloneNode(true);

				// code editor UI
				out += "<div class='notebook-code-editor'>\n"+codeTextLayer.outerHTML+"\n</div>\n"
				// code editor code for importing (hidden by CSS)
				+"<pre class='notebook-code-editor-raw editor-mode-"+content.mode+"'>"+content.input+"</pre>\n";

				// code editor results
				var output = content.output;
				if (output === '') {
					item.results.getResultsEl();
				}
				out += "<div class='notebook-code-results"+(content.expandResults ? '' : ' collapsed')+"'>\n"+content.output+"\n</div>\n";
			}

			out+="</section>\n"
		})
		out += "</article>\n<footer class='spyral-footer'>"+this.getInnerFooterHtml()+"</footer>\n</body>\n</html>";
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

	generateExportJson: function() {
		var cells = [];
		this.getComponent("cells").items.each(function(item, i) {
			var type;
			switch(item.xtype) {
				case 'notebookcodeeditorwrapper':
					type = 'code';
					break;
				case 'notebookdatawrapper':
					type = 'data';
					break;
				default:
					type = 'text';
			}
			cells.push({
				cellId: item.getCellId(),
				type: type,
				content: item.getContent()
			});
		});

		var json = {
			metadata: this.getMetadata(),
			cells: cells
		}

		return JSON.stringify(json);
	},


	/*
	 * Export dialog options below
	 */
	
	getExtraViewExportItems: function() {
		return [
		// {
		// 	inputValue: 'html',
		// 	boxLabel: this.localize('exportHtml')
		// },
		{
			inputValue: 'htmlDownload',
			boxLabel: '<a href="#">'+this.localize('exportHtmlDownload')+'</a>',
			listeners: {
				afterrender: function(cmp) {
					var name = (this.getNotebookId() || "spyral")+ ".html";
					var data = this.generateExportHtml();
					var properties = {type: 'text/html'};
					var file;
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
	}
	
	// ,exportHtml: function() {
	// 	var out = this.generateExportHtml();
	// 	var myWindow = window.open();
	// 	myWindow.document.write(out);
	// 	myWindow.document.close();
	// 	myWindow.focus();
	// }
});
