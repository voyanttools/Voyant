Ext.define('Voyant.util.Toolable', {
	requires: ['Voyant.util.Localization','Voyant.util.Api'],
	statics: {
		i18n: {
		},
		api: {
			suppressTools: false
		}
	},
	constructor: function(config) {
		config = config || {};
		if (this.getApiParam && this.getApiParam("suppressTools")=="true") {return;}
		if ("header" in config && config.header===false) {return;}
		var me = this;
		var moreTools = undefined;
		var parent = this.up('component');
		if (config.moreTools) {
			moreTools = [];
			config.moreTools.forEach(function(xtype) {
				 if (xtype && xtype!=this.xtype) {
					moreTools.push(this.getMenuItemFromXtype(xtype));
				 }

			}, this)
		}
		else if (parent && parent.getInitialConfig('moreTools')) {
			moreTools = [];
			 parent.getInitialConfig('moreTools').forEach(function(xtype) {
				 if (xtype && xtype!=this.xtype) {
					moreTools.push(this.getMenuItemFromXtype(xtype));
				 }

			}, this)
		}
		if (moreTools && this.getApplication().getMoreTools) {
			moreTools.push({xtype: 'menuseparator'});
		}
		if (this.getApplication().getMoreTools) {
			moreTools = moreTools || [];
			var app = this.getApplication();
			var tools = app.getMoreTools();
			tools.forEach(function(category) {
				var categories = [];
				category.items.forEach(function(xtype) {
					categories.push(this.getMenuItemFromXtype(xtype))
				}, this)
				moreTools.push({
					text: app.localize(category.i18n),
					glyph: category.glyph,
					menu: {items: categories}
				})
			}, this);
		}			

		var exportItems = undefined;
		var toolsMap = {
//				maximize: {
//					glyph: 'xf08e@FontAwesome',
//					fn: this.maximizeToolClick
//				},
				save: {
					glyph: 'xf08e@FontAwesome',
					fn: this.exportToolClick,
					items: exportItems
				},
				plus: moreTools ? {
					glyph: 'xf17a@FontAwesome',
					items: moreTools
				} : undefined,
				gear: this.showOptionsClick || this.getOptions ? {
					glyph: 'xf205@FontAwesome',
					fn: this.showOptionsClick ? this.showOptionsClick : function(panel) {
						if (panel.isXType("voyanttabpanel")) {panel = panel.getActiveTab()}
						// we're here because the panel hasn't overridden the click function
						Ext.create('Ext.window.Window', {
							title: panel.localize("optionsTitle"),
							modal: true,
			            	panel: panel,
							items: {
								xtype: 'form',
								defaults: {
									margin: '10 10 10 0'
								},
								items: panel.getOptions(),
								listeners: {
									afterrender: function(form) {
										var api = panel.getApiParams(form.getForm().getFields().collect('name'));
										form.getForm().setValues(api);
									}
								},
								buttons: [{
					            	text: panel.localize("reset"),
									glyph: 'xf0e2@FontAwesome',
					            	flex: 1,
					            	panel: panel,
						            ui: 'default-toolbar',
					        		handler: function(btn) {
					        			if (this.mixins && this.mixins["Voyant.util.Api"]) {
					        				this.mixins["Voyant.util.Api"].constructor.apply(this);
					        				if (this.getCorpus && this.getCorpus()) {
					        					this.fireEvent("loadedCorpus", this, this.getCorpus())
					        				}
					        			}
					        			btn.up('window').close();
					        		},
					        		scope: panel
								
								},{xtype: 'tbfill'}, {
					            	text: panel.localize("cancelTitle"),
						            ui: 'default-toolbar',
					                glyph: 'xf00d@FontAwesome',
					        		flex: 1,
					        		handler: function(btn) {
					        			btn.up('window').close();
					        		}
								},{
					            	text: panel.localize("confirmTitle"),
									glyph: 'xf00c@FontAwesome',
					            	flex: 1,
					            	panel: panel,
					        		handler: function(btn) {
										var values = btn.up('form').getValues();
										
										// set api values (all of them, not just global ones)
										this.setApiParams(values);

										var app = this.getApplication();
										
										var keyValuesForGlobalUpdate = [];
										if (values['stopList'] !== undefined && values['stopListGlobal'] !== undefined && values.stopListGlobal) {
											keyValuesForGlobalUpdate.push(['stopList', values['stopList']]);
										}
										if (values['termColors'] !== undefined && values['termColorsGlobal'] !== undefined && values.termColorsGlobal) {
											keyValuesForGlobalUpdate.push(['termColors', values['termColors']]);
										}

										var categoriesDfd = new Ext.Deferred();
										if (values['categories'] && values['categories'] !== '') {
											app.loadCategoryData(values['categories']).then(function() {
												// no errors
											}, function() {
												values['categories'] = undefined;
											}).finally(function() { // this returns a ES6 Promise instead of Ext so used finally
												keyValuesForGlobalUpdate.push(['categories', values['categories']]);
												categoriesDfd.resolve();
											})
										} else {
											categoriesDfd.resolve();
										}
										
										var paletteDfd = new Ext.Deferred(); // need a deferred since we might have to load a custom palette
										if (values['palette'] !== undefined) {
											app.resetColorTermAssociations();
											if (app.getColorPalette(values['palette']).length === 0) {
												// it's a custom palette that we need to load first
												app.loadCustomColorPalette(values['palette']).then(function() {
													// no errors
												}, function() {
													// error loading palette, so reset to default
													values['palette'] = 'default';
												}).always(function() { // this returns a Ext Promise instead of ES6 so used always
													keyValuesForGlobalUpdate.push(['palette', values['palette']]);
													paletteDfd.resolve();
												})
											} else {
												keyValuesForGlobalUpdate.push(['palette', values['palette']]);
												paletteDfd.resolve();
											}
										} else {
											paletteDfd.resolve();
										}

										Ext.Promise.all([categoriesDfd, paletteDfd]).then(function() {
											var corpus = app.getCorpus();
											if (keyValuesForGlobalUpdate.length > 0) {
												var panels = app.getViewport().query("panel,chart");
												keyValuesForGlobalUpdate.forEach(function(keyValue) {
													var key = keyValue[0];
													var value = keyValue[1];
													
													// set the api value for the app
													if (app.setApiParam) {
														app.setApiParam(key, value);
													}
													
													// tell the panels, including this one
													for (var i=0; i<panels.length; i++) {
														if (panels[i].setApiParam) {
															panels[i].setApiParam(key, value);
														}
													}
												});

												// trigger a reloading of the app
												if (corpus) {
													app.dispatchEvent("loadedCorpus", this, corpus);
												} else {
													app.dispatchEvent("apiParamsUpdated", this, values);
												}
											}
											// fire this even if we have global params since the app dispatch won't reach this tool
											if (corpus) {
												this.fireEvent("loadedCorpus", this, corpus);
											} else {
												this.fireEvent("apiParamsUpdated", this, values);
											}

											btn.up('window').close();
										}.bind(this));
									},
									scope: panel
								}]
							}
						}).show()
					}
				} : undefined,
				help: {
					glyph: 'xf128@FontAwesome',
					fn: this.helpToolClick
				}
		}
		var tools = [];
		
		// check to see if there are tool objects configured
		if (config.includeTools) {
			for (var tool in config.includeTools) {
				if (typeof config.includeTools[tool] == "object") {
					tools.push(config.includeTools[tool])
				}
			}
		}
		
		
		for (var tool in toolsMap) {
			if (config.includeTools && !config.includeTools[tool] || !toolsMap[tool]) {continue;}
			tools.push({
				type: tool,
				tooltip: this.localize(tool+"Tip"),
				callback: toolsMap[tool].fn,
				xtype: 'toolmenu',
				glyph: toolsMap[tool].glyph,
				items: toolsMap[tool].items
			})
		}
		
		Ext.apply(this, {
			tools: tools
		})
		this.on("afterrender", function() {
			var header = this.getHeader();
			if (header && Ext.os.deviceType=="Desktop" && !this.isXType("corpuscreator") && !this.isXType('notebook')) {
				var el = header.getEl();
				el.on("mouseover", function() {
					this.getHeader().getTools().forEach(function(tool) {
						tool.show();
					})
				}, this);
				el.on("mouseout", function() {
					this.getHeader().getTools().forEach(function(tool) {
						var type = tool.config.type || tool.type; // auto-added tools don't have config.type
						if (type && type !== 'help') tool.hide();
					})
				}, this);
				header.getTools().forEach(function(tool,i) {
					if (tool.config.type !== 'help') tool.hide();
				});
			}
		}, this)
	},
	getMenuItemFromXtype: function(xtype) {
		var xt = xtype;
		var config = this.getApplication().getToolConfigFromToolXtype(xtype);
		if (config && config.tooltip) {
			delete config.tooltip // don't use this for now since it causes problems in the menu
		}
		return Ext.apply(Ext.clone(config), {
			xtype: 'menuitem',
			text: config.title,
			textAlign: 'left',
			handler: function() {this.replacePanel(config.xtype)},
			scope: this
		})
	},
	maximizeToolClick: function(panel) {
		var name = Ext.getClass(panel).getName();
		var parts = name.split(".");
		url = panel.getBaseUrl()+"tool/"+parts[parts.length-1]+"/";
		params = panel.getModifiedApiParams();
		if (!params.corpus && panel.getCorpus && panel.getCorpus()) {
			params.corpus = panel.getCorpus().getId();
		}
		if (params) {url += "?"+Ext.Object.toQueryString(params);}
		panel.openUrl(url);
	},
	exportToolClick: function(panel) {
		if (panel.isXType('voyanttabpanel')) {panel = panel.getActiveTab()}
		var items = window.location.hostname=='beta.voyant-tools.org' ? [{html: "<p class='keyword' style='text-align: center; font-weight: bold; padding: 4px;'>Please note that this is the beta server and you should not count on corpora persisting (for bookmarks, embedding, etc.)."}] : [];
		var exportViewItems = [{
       		xtype: 'radio',
       		name: 'export',
       		inputValue: 'embed',
       		boxLabel: panel.localize('exportViewHtmlEmbed')
       	},{
       		xtype: 'radio',
       		name: 'export',
       		inputValue: 'biblio',
       		boxLabel: panel.localize('exportViewBiblio')
       	},{
       		xtype: 'radio',
       		name: 'export',
       		inputValue: 'spyral',
       		boxLabel: panel.localize("exportViewSpyral")
       	}];
		if (panel.isXType('notebook')) {
			exportViewItems.splice(2, 1); // remove redundant spyral export for spyral notebooks
		}
		if (panel.getExtraViewExportItems) {
			panel.getExtraViewExportItems().forEach(function(item) {
				Ext.applyIf(item, {
					xtype: 'radio',
					name: 'export'
				})
				exportViewItems.push(item)
			})
		}
		items.push({
	       		xtype: 'radio',
	       		name: 'export',
	       		inputValue: 'url',
	       		boxLabel: "<a href='"+panel.getExportUrl.call(panel)+"' target='_blank'>"+panel.localize('exportViewUrl')+"</a>",
	       		checked: true,
	       		listeners: {
	       			afterrender: function() {
	       				this.boxLabelEl.on("click", function() {
	       					this.up('window').close()
	       				}, this)
	       			}
	       		}
		},{
	       xtype: 'fieldset',
	       collapsible: true,
	       collapsed: true,
	       title: panel.localize('exportViewFieldset'),
	       items: exportViewItems
		})
		var exportDataItems = [];
		if (panel.isXType('grid')) {
			exportDataItems.push({
	       		xtype: 'radio',
	       		name: 'export',
	       		inputValue: 'gridCurrentHtml',
	       		boxLabel: panel.localize('exportGridCurrentHtml')
	        },{
	       		xtype: 'radio',
	       		name: 'export',
	       		inputValue: 'gridCurrentTsv',
	       		boxLabel: panel.localize('exportGridCurrentTsv')
	        });
			if (!panel.getExportGridAll || panel.getExportGridAll()!=false) {
				exportDataItems.push({
		       		xtype: 'radio',
		       		name: 'export',
		       		inputValue: 'gridAllJson',
		       		boxLabel: panel.localize('exportGridAllJson')
	    	   },{
		       		xtype: 'radio',
		       		name: 'export',
		       		inputValue: 'gridAllTsv',
		       		boxLabel: panel.localize('exportGridAllTsv')
	    	   })
			}
		}
		if (panel.getExtraDataExportItems) {
			panel.getExtraDataExportItems().forEach(function(item) {
				Ext.applyIf(item, {
					xtype: 'radio',
					name: 'export'
				})
				exportDataItems.push(item)
			})
		}
		if (exportDataItems.length > 0) {
			items.push({
				xtype: 'fieldset',
				collapsible: true,
				collapsed: true,
				title: panel.localize('exportGridCurrent'),
				items: exportDataItems
			 });
		}
		if ((!panel.getExportVisualization || panel.getExportVisualization()) && panel.isXType("grid")==false && (panel.down("chart") || panel.getTargetEl().dom.querySelector("canvas") || panel.getTargetEl().dom.querySelector("svg"))) {
			var formats = [{
				xtype: 'radio',
				name: 'export',
				inputValue: 'png',
				boxLabel: panel.localize('exportPng')
			},{
				xtype: 'slider',
				width: 200,
				value: 1,
				minValue: .5,
				maxValue: 10,
				increment: .5,
				labelAlign: 'right',
				decimalPrecision: 1,
				itemId: 'scale',
				fieldLabel: new Ext.Template(panel.localize("scaleLabel")).apply([1]),
				listeners: {
					change: function(slider, newVal) {
						this.setFieldLabel(new Ext.Template(panel.localize("scaleLabel")).apply([newVal]))
					},
					changecomplete: function(slider) {
						slider.previousSibling().setValue(true); // make sure PNG is selected
					}
				}
			}];
			if (panel.getTargetEl().dom.querySelector("svg")) {
				formats.push({
					xtype: 'radio',
					name: 'export',
					inputValue: 'svg',
					boxLabel: panel.localize('exportSvg')
				})
			}
			items.push({
			       xtype: 'fieldset',
			       collapsible: true,
			       collapsed: true,
			       title: panel.localize('exportVizTitle'),
		    	   items: formats
	    	});
		}
		Ext.create('Ext.window.Window', {
			title: panel.localize("exportTitle"),
			modal: true,
			items: {
				xtype: 'form',
				items: items,
				buttons: [{
	            	text: panel.localize("exportTitle"),
					glyph: 'xf08e@FontAwesome',
	            	flex: 1,
	            	panel: panel,
	        		handler: function(btn) {
	        			var form = btn.up('form');
	        			var fn = 'export'+Ext.String.capitalize(form.getValues()['export']);
	        			if (Ext.isFunction(panel[fn])) {
	        				panel[fn].call(panel, panel, form)
	        			}
	        			else {
	        				Ext.Msg.show({
	        				    title: panel.localize('exportError'),
	        				    message: panel.localize('exportNoFunction'),
	        				    buttons: Ext.Msg.OK,
	        				    icon: Ext.Msg.ERROR
	        				});
	        			}
	        			btn.up('window').close();
	        		},
	        		scope: panel
	            }, {
	            	text: panel.localize("cancelTitle"),
	                glyph: 'xf00d@FontAwesome',
	        		flex: 1,
	        		handler: function(btn) {
	        			btn.up('window').close();
	        		}
				}]
			},
			bodyPadding: 5
		}).show()
	},
	exportSvg: function(img) {
		var svg = this.getTargetEl().dom.querySelector("svg");
		if (svg) {
			var html = d3.select(svg)
				.attr("version", 1.1)
				.attr("xmlns", "http://www.w3.org/2000/svg")
				.node().parentNode.innerHTML
			Ext.Msg.show({
			    title: this.localize('exportSvgTitle'),
			    message: '<img src="'+'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(html)))+'" style="float: right; max-width: 200px; max-height: 200px; border: thin dotted #ccc;"/>'+this.localize('exportSvgMessage'),
			    buttons: Ext.Msg.OK,
			    icon: Ext.Msg.INFO,
			    prompt: true,
		        multiline: true,
		        value: html
			});		
		}
	},
	exportPngData: function(img) {
		Ext.Msg.show({
		    title: this.localize('exportPngTitle'),
		    message: '<img class="thumb" src="'+img+'" style="float: right; max-width: 200px; max-height: 200px; border: thin dotted #ccc;"/>'+this.localize('exportPngMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: '<img src="'+img+'" />'
		});
	},
	exportPng: function(panel, form) {
		var scale = 1;
		if (form) {
			form.mask(panel.localize('loading'));

			var slider = form.queryById("scale");
			if (slider && slider.getValue) {
				scale = slider.getValue();
			}
		}
		
		var canvasSurface = this.down('draw') || this.down('chart');
		if (canvasSurface && (canvasSurface.isChart || canvasSurface.isCanvas)) {

			// first part taken from EXTJ Draw.getImage()
			// http://docs.sencha.com/extjs/6.2.0/classic/src/Container.js-2.html#Ext.draw.Container-method-getImage
			// reproduced here because we want to scale the image in the canvas, not the final image
			var size = canvasSurface.innerElement.getSize(),
            		surfaces = Array.prototype.slice.call(canvasSurface.items.items),
            		zIndexes = canvasSurface.surfaceZIndexes,
            		image, imageElement,
            		i, j, surface, zIndex;
 
	        // Sort the surfaces by zIndex using insertion sort. 
	        for (j = 1; j < surfaces.length; j++) {
	            surface = surfaces[j];
	            zIndex = zIndexes[surface.type];
	            i = j - 1;
	            while (i >= 0 && zIndexes[surfaces[i].type] > zIndex) {
	                surfaces[i + 1] = surfaces[i];
	                i--;
	            }
	            surfaces[i + 1] = surface;
	        }
	        
	        // next part taken from EXTJS Canvas Flatten
	        // http://docs.sencha.com/extjs/6.2.0/classic/src/Canvas.js-1.html#line897
	        // reproduced here because we want to scale the image when drawing to the new canvas
	        
	        var targetCanvas = document.createElement('canvas'),
            className = Ext.getClassName(surfaces[0]),
            ratio = surfaces[0].devicePixelRatio * scale,
            ctx = targetCanvas.getContext('2d'),
            surface, canvas, rect, i, j, xy;

	        targetCanvas.width = Math.ceil(size.width * ratio);
	        targetCanvas.height = Math.ceil(size.height * ratio);
	
	        
	        for (i = 0; i < surfaces.length; i++) {
	            surface = surfaces[i];
	            if (Ext.getClassName(surface) !== className) {
	                continue;
	            }
	            rect = surface.getRect();
	            surfaceSize = surface.el.getSize();
	            for (j = 0; j < surface.canvases.length; j++) {
	                canvas = surface.canvases[j];
	                xy = canvas.getOffsetsTo(canvas.getParent());
	                ctx.drawImage(canvas.dom, (rect[0] + xy[0]) * ratio, (rect[1] + xy[1]) * ratio, surfaceSize.width*ratio,surfaceSize.height*ratio);
	            }
	        }
	        if (form && form.isVisible()) {form.unmask();}
	        
	        // now we're ready
			return this.exportPngData(targetCanvas.toDataURL());
		}
		
//		var chart = this.down('chart'); // first try finding a chart
//		if (chart) {
//			return this.exportPngData(this.down('chart').getImage().data);
//		}
//
		var targetEl = this.getTargetEl().dom,
			canvas = targetEl.querySelector("canvas"); // next try finding a canvas
		if (canvas) {
			if (scale==1) {
				var data = canvas.toDataURL("image/png");
		        if (form && form.isVisible()) {form.unmask();}
				return this.exportPngData(data);
			}
	        var targetCanvas = document.createElement('canvas'),
            ctx = targetCanvas.getContext('2d');
	        targetCanvas.width = Math.ceil(canvas.width * scale);
	        targetCanvas.height = Math.ceil(canvas.height * scale);

			  var image = new Image;
			  image.src = canvas.toDataURL("image/png");
			  image.panel = this;
			  image.onload = function() {
				  ctx.drawImage(image, 0, 0, targetCanvas.width, targetCanvas.height);
				  img = targetCanvas.toDataURL("image/png");
			        if (form && form.isVisible()) {form.unmask();}
				  this.panel.exportPngData.call(this.panel, img);
			  };	
			  return;
		}
		
		var svg = targetEl.querySelector("svg"); // finally try finding an SVG
		if (svg) {
			var width = targetEl.offsetWidth*scale,
				height = targetEl.offsetHeight*scale;
			var clone = svg.cloneNode(true); // we don't want to scale, etc. the original
			clone.setAttribute("version", 1.1)
			clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
			clone.setAttribute("width", width)
			clone.setAttribute("height", height)

			var svgChildren = [];
			while (clone.children.length > 0) {
				svgChildren.push(clone.removeChild(clone.children[0]));
			};

			var g = document.createElement('g');
			g.setAttribute("style", "transform-box: fill-box;");
			g.setAttribute("transform", "scale("+scale+")")
			clone.appendChild(g);

			svgChildren.forEach(function(item) {
				g.appendChild(item);
			})

			var html = clone.outerHTML,
				img = 'data:image/svg+xml;base64,'+ btoa(unescape(encodeURIComponent(html)));

			var canvas = Ext.DomHelper.createDom({tag:'canvas',width: width,height:height}),
				context = canvas.getContext("2d");
			  
			var image = new Image;
			image.src = img;
			image.panel = this;
			image.onload = function() {
				context.drawImage(image, 0, 0);
				img = canvas.toDataURL("image/png");
		        if (form && form.isVisible()) {form.unmask();}
				return this.panel.exportPngData.call(this.panel, img);
			};
			// image.onerror = function(ev) {
			// 	console.log(ev)
			// }
		}
	},
	exportUrl: function() {
		this.openUrl(this.getExportUrl());
	},
	exportEmbed: function() {
		var asTool = this.isXType('voyantheader')==false;
		Ext.Msg.show({
		    title: this.localize('exportViewEmbedTitle'),
		    message: this.localize('exportViewEmbedMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: "<!--	Exported from Voyant Tools (voyant-tools.org).\n"+
	        	"The iframe src attribute below uses a relative protocol to better function with both\n"+
	        	"http and https sites, but if you're embedding this into a local web page (file protocol)\n"+
	        	"you should add an explicit protocol (https if you're using voyant-tools.org, otherwise\n"+
	        	"it depends on this server.\n"+
	        	"Feel free to change the height and width values or other styling below: -->\n"+
	        	"<iframe style='width: "+(asTool ? this.getWidth()+"px" : "100%")+"; height: "+(asTool ? this.getHeight()+"px" : "800px")+";' src='"+this.getExportUrl(asTool)+"'></iframe>"
		});
	},
	exportBiblio: function() {
		var date = new Date();
		var url = this.getExportUrl();
		var websiteTitle = this.isXType('voyantheader') ? 'Voyant Tools' : this.localize('title');
		var msg = Ext.Msg.show({
		    title: this.localize('exportBiblioTitle'),
			minHeight: 525,
		    message: '<fieldset><legend>MLA</legend>'+
	    	'<div class="x-selectable">Sinclair, Stéfan and Geoffrey Rockwell. "'+websiteTitle+'." '+
	    	'<i>Voyant Tools</i>. '+Ext.Date.format(date,'Y')+'. Web. '+Ext.Date.format(date,'j M Y')+'. &lt;'+url+'&gt;.</div></fieldset>'+
	    	'<br >'+
	    	'<fieldset><legend>Chicago</legend>'+
	    	'<div class="x-selectable">Stéfan Sinclair and Geoffrey Rockwell, "'+websiteTitle+'", '+
	    	'<i>Voyant Tools</i>, accessed '+Ext.Date.format(date,'F j, Y')+', '+url+'.</div></fieldset>'+
	    	'<br >'+
	    	'<fieldset><legend>APA</legend>'+
	    	'<div class="x-selectable">Sinclair, S. &amp; G. Rockwell. ('+Ext.Date.format(date,'Y')+"). "+websiteTitle+'. '+
	    	'<i>Voyant Tools</i>. Retrieved '+Ext.Date.format(date,'F j, Y')+', from '+url+'</div></fieldset>'+
			'<br >'+
			'<fieldset><legend>BibTeX</legend>'+
			'<div class="x-selectable">'+this.getExportBibTex()+'</div></fieldset>',
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO
		});
		msg.getEl().query('fieldset > div', false).forEach(function(el) {
			el.on('click', function(evt, el) {
				var doc = window.document, sel, range;
				if (window.getSelection && doc.createRange) {
					sel = window.getSelection();
					range = doc.createRange();
					range.selectNodeContents(el);
					sel.removeAllRanges();
					sel.addRange(range);
				} else if (doc.body.createTextRange) {
					range = doc.body.createTextRange();
					range.moveToElementText(el);
					range.select();
				}
			});
		});
	},
	exportSpyral: function() {
		let toolForUrl = Ext.getClassName(this).split(".").pop();
		let api = this.getApplication().getModifiedApiParams();
		if (this.isXType('voyantheader')==false) {
			delete api.panels; // not needed for individual tools
			// add (and overwrite if need be) this tool's api
			Ext.apply(api, this.getModifiedApiParams());
			delete api.corpus;
		}
		let isDebug = api && "debug" in api;
		delete api.view;
		delete api.debug;
		let enc = function(str) {
			return btoa(encodeURIComponent(str)).replace(/=/g, "%3D");
		}
		let input = "['<h1>Spyral Notebook Imported from Voyant Tools</h1>',"+
			"'<p>You can use this as a base to create your own notebook. The first code cell below loads your corpus and assigns it to a variable. The second uses the corpus variable to invoke a tool.</p><p>Don\\'t forget to save your changes by clicking on the cloud icon!</p>','"+
			'loadCorpus("'+this.getApplication().getCorpus().getAliasOrId()+'").assign("myCorpus");\',\''+
			'myCorpus.tool("'+
			(toolForUrl=="VoyantHeader" ? "" : toolForUrl)+'"'+(Object.keys(api).length>0 ? (","+Ext.encode(api)) : "")+
			");']"
		this.openUrl(this.getApplication().getBaseUrl()+"spyral/?run=true&"+(isDebug ? "debug=true&" : "")+"inputJsonArrayOfEncodedBase64="+enc(input));
	},
	exportGridCurrentJson: function(grid, form) {
		var store = grid.getStore();
		var fields = store.getFields();
		var value = "<table>\n\t<thead>\n\t\t<tr>\n";
		var visibleColumns = grid.getColumnManager().headerCt.getVisibleGridColumns().filter(function(col) { return col.dataIndex && col.dataIndex.trim().length > 0 });
		values = [];

		function jsonCollector(row) {
			var val = {};
			visibleColumns.forEach(function (column) {
				val[column.text] = row.get(column.dataIndex);
			});
			values.push(val);
		}

		if (store.buffered) {
			store.data.forEach(jsonCollector);
		} else {
			store.each(jsonCollector);
		}

		Ext.Msg.show({
		    title: this.localize('exportDataTitle'),
		    message: this.localize('exportDataJsonMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: Ext.encode(values)
		});
	},
	exportGridCurrentTsv: function(grid, form) {
		var store = grid.getStore();
		var visibleColumns = grid.getColumnManager().headerCt.getVisibleGridColumns().filter(function(col) { return col.dataIndex && col.dataIndex.trim().length > 0 });
		var fields = [];
		visibleColumns.forEach(function(column) {
			fields.push(column.text);
		})
		var value = fields.join("\t")+"\n";

		function tsvCollector(row) {
			var cells = [];
			visibleColumns.forEach(function (column) {
				var val = row.get(column.dataIndex);
				if (Ext.isString(val)) {
					val = val.replace(/\s+/g, ' '); // get rid of multiple whitespace (including newlines and tabs)
				}
				cells.push(val)
			});
			value += cells.join("\t") + "\n";
		}

		if (store.buffered) {
			store.data.forEach(tsvCollector);
		} else {
			store.each(tsvCollector);
		}

		Ext.Msg.show({
		    title: this.localize('exportDataTitle'),
		    message: this.localize('exportDataTsvMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: value
		});
	},
	exportGridCurrentHtml: function(grid, form) {
		var store = grid.getStore();
		var fields = store.getFields();
		var value = "<table>\n\t<thead>\n\t\t<tr>\n";
		var visibleColumns = grid.getColumnManager().headerCt.getVisibleGridColumns().filter(function(col) { return col.dataIndex && col.dataIndex.trim().length > 0 });
		visibleColumns.forEach(function(column) {
			value+="\t\t\t<td>"+column.text+"</td>\n";
		});

		value+="\t\t</tr>\n\t</thead>\n\t<tbody>\n";

		function htmlCollector(row) {
			value += "\t\t<tr>\n";
			visibleColumns.forEach(function (column) {
				var val = row.get(column.dataIndex);
				if (Ext.isString(val)) {
					val = val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&lg;');
				}
				value += "\t\t\t<td>" + val + "</td>\n";
			});
			value += "\t\t</tr>\n";
		}

		if (store.buffered) {
			store.data.forEach(htmlCollector);
		} else {
			store.each(htmlCollector);
		}

		value+="\t</tbody>\n</table>";
		Ext.Msg.show({
		    title: this.localize('exportDataTitle'),
		    message: this.localize('exportDataHtmlMessage'),
		    buttons: Ext.Msg.OK,
		    icon: Ext.Msg.INFO,
		    prompt: true,
	        multiline: true,
	        value: value
		});
	},
	exportGridAllJson: function(grid, form) {
		Ext.Msg.confirm(this.localize('exportAllTitle'), this.localize('exportAllJsonWarning'), function(btn) {
			if (btn=='yes') {
				var params = {start: 0};
				Ext.applyIf(params, grid.getStore().getProxy().getExtraParams());
				this.openUrl(this.getTromboneUrl()+"?"+Ext.Object.toQueryString(params));
			}
		}, this)
	},
	exportGridAllTsv: function(grid, form) {
		Ext.Msg.confirm(this.localize('exportAllTitle'), this.localize('exportAllTsvWarning'), function(btn) {
			if (btn=='yes') {
				var params = {start: 0, template: this.getXType()+"2tsv", outputFormat: 'text'};
				Ext.applyIf(params, grid.getStore().getProxy().getExtraParams());
				this.openUrl(this.getTromboneUrl()+"?"+Ext.Object.toQueryString(params));
			}
		}, this)
	},
	getExportUrl: function(asTool) {
		// start with the application api
		var api = this.getApplication().getModifiedApiParams();
		var toolForUrl = Ext.getClassName(this).split(".").pop();
		if (this.isXType('voyantheader')==false) {
			delete api.panels; // not needed for individual tools
			// add (and overwrite if need be) this tool's api
			Ext.apply(api, this.getModifiedApiParams());
			if (!asTool) {api.view=toolForUrl;}
		}
		if (!api.corpus) {
			api.corpus = this.getApplication().getCorpus().getAliasOrId();
		}
		return this.getApplication().getBaseUrl()+(asTool ? "tool/"+toolForUrl+"/" : "")+'?'+Ext.Object.toQueryString(api);
	},
	getExportBibTex: function() {
		var url = this.getExportUrl();
		var corpus = this.getApplication().getCorpus();
		
		var websiteTitle = this.isXType('voyantheader') ? 'Voyant Tools' : this.localize('title');

		var abstract = 'Voyant Tools analysis of ';
		if (corpus.getTitle() === '') {
			abstract += 'a corpus';
		} else {
			abstract += 'the corpus "'+corpus.getTitle()+'"';
		}
		if (this.isXType('voyantheader') === false) {
			abstract += ' using the '+this.localize('title')+' tool';
		}

		var now = new Date();
		var accessed = Ext.Date.format(now,'Y-m-d');
		var createdTime = new Date(this.getApplication().getCorpus().getCreatedTime());

		var lang = this.getApiParam('lang') || 'en';		

		var citekey = 'voyanttools_'+now.getTime();
		
		var bib = ['@misc{'+citekey+','];
		bib.push('title = {'+websiteTitle+'},');
		bib.push('author = {Sinclair, Stéfan and Rockwell, Geoffrey},');
		bib.push('year = '+createdTime.getFullYear()+',');
		bib.push('url = {'+url+'},');
		bib.push('urldate = {'+accessed+'},');
		bib.push('publisher = {Voyant Tools},');
		bib.push('copyright = {CC BY 4.0},');
		bib.push('abstract = {'+abstract+'},');
		bib.push('language = {'+lang+'},');
		
		return bib.join('<br/>&nbsp;&nbsp;') + '<br/>}';
	},
	helpToolClick: function(panel) {
		if (panel.isXType('voyanttabpanel')) {panel = panel.getActiveTab()}
		var help = panel.localize('help', {"default": false}) || panel.localize('helpTip');
		if (help==panel._localizeClass(Ext.ClassManager.get("Voyant.util.Toolable"), "helpTip")) {
			panel.openUrl( panel.getBaseUrl()+"docs/tutorial-"+panel.getXType()+'.html');
		}
		else {
			Ext.Msg.alert(panel.localize('title'), help +"<p><a href='"+panel.getBaseUrl()+
					"docs/"+ (panel.isXType('voyantheader') ? '' : "tutorial-"+panel.getXType()+'.html') +"' target='voyantdocs'>"+panel.localize("moreHelp")+"</a></p>")
		}
	},
	replacePanel: function(xtype) {
		var corpus = this.getApplication().getCorpus();
		var config = this.getInitialConfig();
		var parent;
		if (this.isXType('voyantheader') && this.getApplication().getViewComponent) {
			parent = this.getApplication().getViewComponent();
			parent.removeAll(true);
			var newTool = parent.add({xtype: xtype});
			if (corpus) {
				this.getApplication().dispatchEvent("loadedCorpus", parent, corpus);
			}
			
			var queryParams = Ext.Object.fromQueryString(document.location.search);
			var url = this.getApplication().getBaseUrl();
			url += '?corpus='+corpus.getAliasOrId();
			url += '&view='+xtype;
			for (var key in queryParams) {
				if (key !== 'corpus' && key !== 'view') {
					url += '&'+key+'='+queryParams[key];
				}
			}
			window.history.pushState({
				corpus: corpus.getAliasOrId(),
				view: xtype
			}, '', url);
		}
		else {
			parent = this.isXType('voyantheader') && this.getApplication().getViewComponent ? this.getApplication().getViewComponent() : this.up("component");
			parent.remove(this, true);
			var newTool = parent.add({xtype: xtype});
			if (parent.isXType("voyanttabpanel")) {
				parent.setActiveTab(newTool)
			}
			if (corpus) {
				newTool.fireEvent("loadedCorpus", newTool, corpus)
			}
		}
		this.getApplication().dispatchEvent('panelChange', this)
	}
});

// from http://www.sencha.com/forum/showthread.php?281658-add-dropdown-menu-to-panel-tool&p=1054579&viewfull=1#post1054579
// and http://www.sencha.com/forum/showthread.php?281953-Glyphs-in-panel-tool&p=1068934&viewfull=1#post1068934

Ext.define('Voyant.util.ToolMenu', {
    extend: 'Ext.panel.Tool',
    alias: 'widget.toolmenu',
    renderTpl: ['<div class="x-menu-tool-hover">' + '</div>'+
            '<tpl if="glyph">' + 
            '<span id="{id}-toolEl" class="{baseCls}-glyph {childElCls}" role="presentation" style="font-family: {glyphFontFamily}; '+
            	'<tpl if="Ext.os.name==\'iOS\'">'+ // FIXME: this is an awful hack..
            		'margin-right: 15px; '+
            	'</tpl>'+
            '">&#{glyph}</span>' + 
            '<tpl else>' + 
            '<img id="{id}-toolEl" src="{blank}" class="{baseCls}-img {baseCls}-{type}' + '{childElCls}" role="presentation"/>' + 
            '</tpl>'],
    privates: {
        onClick: function() {
            var me = this;
            var returnValue = me.callParent(arguments);

			if (returnValue) {
                me.showToolMenu.call(me);
            }

            return returnValue;
        },
        onDestroy: function() {
            Ext.destroyMembers(this, 'toolMenu'); //destructor
            this.callParent();
        }
    },
	showToolMenu: function() {
		if (this.items && this.items.length > 0) {
			if (!this.toolMenu || this.toolMenu.destroyed) {
				this.toolMenu = new Ext.menu.Menu({
					items: this.items
				});
			}
			this.toolMenu.showAt(0, 0);
			this.toolMenu.showAt(this.getX() + this.getWidth() - this.toolMenu.getWidth(), this.getY() + this.getHeight() + 10);
		}
	},
	initComponent: function() {
	    var me = this;
	    me.callParent(arguments);
	
	    var glyph, glyphParts, glyphFontFamily;
	    glyph = me.glyph || 'xf12e@FontAwesome';
	
	    if (glyph) {
	        if (typeof glyph === 'string') {
	            glyphParts = glyph.split('@');
	            glyph = glyphParts[0];
	            glyphFontFamily = glyphParts[1];
	        } else if (typeof glyph === 'object' && glyph.glyphConfig) {
	            glyphParts = glyph.glyphConfig.split('@');
	            glyph = glyphParts[0];
	            glyphFontFamily = glyphParts[1];
	        }
	
	
	        Ext.applyIf(me.renderData, {
	            baseCls: me.baseCls,
	            blank: Ext.BLANK_IMAGE_URL,
	            type: me.type,
	            glyph: glyph,
	            glyphFontFamily: glyphFontFamily
	        });
	    }
	}

});
