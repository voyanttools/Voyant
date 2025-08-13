Ext.namespace('Voyant.categories');

Ext.define('Voyant.categories.CategoriesOption', {
	extend: 'Ext.container.Container',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.categoriesoption',
	statics: {
		i18n: {
		}
	},
	initComponent: function() {
		var value = this.up('window').panel.getApiParam('categories');
    	var data = value ? [{name: value, value: value}] : [];
		if (value !== 'auto') {
			data.push({name: 'auto', value: 'auto'});
		}
		data.push({name: 'Harvard: Adjectives', value: 'categories.h_adjective'});
		data.push({name: 'Harvard: Cognitive Orientation', value: 'categories.h_cognitive'});
		data.push({name: 'Harvard: Communication', value: 'categories.h_communication'});
		data.push({name: 'Harvard: Institutions', value: 'categories.h_institution'});
		data.push({name: 'Harvard: Motivation', value: 'categories.h_motivation'});
		data.push({name: 'Harvard: Objects', value: 'categories.h_object'});
		data.push({name: 'Harvard: Over/Understatement', value: 'categories.h_overunderstate'});
		data.push({name: 'Harvard: Places', value: 'categories.h_place'});
		data.push({name: 'Harvard: Pleasure & Pain', value: 'categories.h_pleasurepain'});
		data.push({name: 'Harvard: Positive & Negative', value: 'categories.h_posneg'});
		data.push({name: 'Harvard: Processes', value: 'categories.h_process'});
		data.push({name: 'Harvard: Pronouns', value: 'categories.h_pronoun'});
		data.push({name: 'Harvard: Roles', value: 'categories.h_role'});
		data.push({name: 'Harvard: Social', value: 'categories.h_social'});
		data.push({name: 'Harvard: Verbs', value: 'categories.h_verb'});
		data.push({name: 'Harvard: Yes & No', value: 'categories.h_yesno'});
		
		Ext.apply(this, {
    		layout: 'hbox',
    		items: [{
    			xtype: 'combo',
    			queryMode: 'local',
    			triggerAction: 'all',
    			fieldLabel: this.localize('categories'),
    			labelAlign: 'right',
    			displayField: 'name',
    			valueField: 'value',
    			store: {
    				fields: ['name', 'value'],
    				data: data
    			},
    			name: 'categories',
    			value: value
    		}, {width: 10}, {xtype: 'tbspacer'}, {
    			xtype: 'button',
    			text: this.localize('edit'),
    			ui: 'default-toolbar',
    			handler: function() {
    				if (Voyant.categories.Builder === undefined) {
						Voyant.categories.Builder = Ext.create('Voyant.categories.CategoriesBuilder', {
							panel: this.up('window').panel
						});
					}
					Voyant.categories.Builder.on('close', function(win) {
						var id = win.getCategoriesId();
						if (id !== undefined) {
							var combo = this.down('combo');
							var name = id;
							combo.getStore().add({name: name, value: id});
							combo.setValue(id);
							
							this.up('window').panel.setApiParam('categories', id);
						}
					}, this, { single: true });
    				
    				var categoriesId = this.down('combo').getValue();
    				Voyant.categories.Builder.setCategoriesId(categoriesId);
					Voyant.categories.Builder.show();
    			},
    			scope: this
    		}]
    	});
		
		this.callParent(arguments);
	}
});

Ext.define('Voyant.categories.CategoriesBuilder', {
    extend: 'Ext.window.Window',
    requires: ['Voyant.widget.FontFamilyOption'],
    mixins: ['Voyant.util.Localization','Voyant.util.Api'],
    alias: 'widget.categoriesbuilder',
    statics: {
    	i18n: {
    		title: 'Categories Builder',
    		terms: 'Terms',
    		term: 'Term',
    		rawFreq: 'Count',
    		relativeFreq: 'Relative',
    		categories: 'Categories',
    		addCategory: 'Add Category',
    		removeCategory: 'Remove Category',
    		removeTerms: 'Remove Selected Terms',
    		categoryName: 'Category Name',
    		add: 'Add',
    		cancel: 'Cancel',
    		exists: 'Category already exists',
    		confirmRemove: 'Are you sure you want to remove the category?',
    		save: 'Save',
    		features: 'Features',
			category: 'Category',
			increaseCategory: 'Increase Category Priority',
			decreaseCategory: 'Decrease Category Priority',
			setColorsFromPalette: 'Set Colors From Palette',
			loadingCategories: 'Loading Categories',
			errorLoadingCategories: 'Error loading Categories',
    		
    		color: 'Color',
    		font: 'Font',
    		orientation: 'Orientation'
    	},
    	api: {
    		stopList: 'auto',
    		query: undefined
    	},
    	features: {
        	color: {
        		xtype: 'colorfield',
        		format: '#hex6'
//        		,listeners: {
//        			render: function(field) {
//        				field.on('change', function(field, color) {
//        					field.inputEl.setStyle('background-color', color);
//        				});
//        			}
//        		}
        	},
        	font: {
        		xtype: 'combobox',
        		queryMode: 'local',
        		displayField: 'name',
        		valueField: 'value',
        		store: {
        			fields: ['name', 'value'],
        			data: Voyant.widget.FontFamilyOption.fonts
        		}
        	},
        	orientation: {
        		xtype: 'combobox',
        		queryMode: 'local',
        		displayField: 'name',
        		valueField: 'value',
        		store: {
        			fields: ['name', 'value'],
        			data: [{name: 'Horizontal', value: 0}, {name: 'Vertical', value: 90}]
        		}
        	}
        }
    },
    config: {
    	corpus: undefined,
    	builderWin: undefined,
    	addCategoryWin: undefined,
    	categoriesId: undefined
    },
    
    // window defaults
    closeAction: 'hide',
    modal: true,
	height: 250,
	width: 500,

    constructor: function(config) {
    	config = config || {};

    	if (config.panel) {
    		this.panel = config.panel;
			this.app = this.panel.getApplication();
			this.categoriesManager = this.app.getCategoriesManager();
		} else {
			console.warn('CategoriesBuilder cannot find panel!');
		}

		config.height = this.app.getViewport().getHeight()*0.75;
		config.width = this.app.getViewport().getWidth()*0.75;
    	
    	this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
    	this.callParent(arguments);
    },
    
    initComponent: function() {
    	Ext.apply(this, {
    		header: false,
    		layout: 'fit',
    		onEsc: Ext.emptyFn,
    		items: {
	    		xtype: 'tabpanel',
	    		title: this.localize('title'),
	    		tabBarHeaderPosition: 1,
	    		items: [{
		    		layout: 'border',
		    		title: this.localize('categories'),
		    		items: [{
		    			title: this.localize('terms'),
		    			split: true,
		    			width: 250,
		    			region: 'west',
		    			layout: 'fit',
		    			items: {
		    				itemId: 'terms',
		    				xtype: 'grid',
		    				store: Ext.create('Voyant.data.store.CorpusTermsBuffered', {
		    		        	parentPanel: this
		    		        }),
		    				viewConfig: {
		    					plugins: {
		    						ptype: 'gridviewdragdrop',
		    						ddGroup: 'terms',
		    						copy: true,
		    						enableDrop: false, // can't drop on grid with buffered store
		    						dragZone: {
		    							getDragText: function() {
		    								var text = '';
		    								this.dragData.records.forEach(function(d) {
		    									text += d.get('term')+', ';
		    								});
		    								text = text.substr(0, text.length-2);
		    								if (text.length > 20) {
		    									text = text.substr(0, 20) + '...';
		    								}
		    								return text;
		    							}
		    						}
		    					}
		    				},
		    				selModel: {
		    	    			mode: 'MULTI'
		    	    		},
		    				columns: [{
				    			text: this.localize('term'),
				        		dataIndex: 'term',
				        		flex: 1,
				                sortable: true
				            },{
				            	text: this.localize('rawFreq'),
				            	dataIndex: 'rawFreq',
				                width: 'autoSize',
				            	sortable: true
				            },{
				            	text: this.localize('relativeFreq'),
				            	dataIndex: 'relativeFreq',
				            	renderer: function(val) {
				            		return Ext.util.Format.number(val*1000000, "0,000");
				            	},
				                width: 'autoSize',
				                hidden: true,
				            	sortable: true
				            }],
				            dockedItems: [{
				                dock: 'bottom',
				                xtype: 'toolbar',
				                overflowHandler: 'scroller',
				                items: [{
				                    xtype: 'querysearchfield'
				                }]
				            }],
				            listeners: {
				            	query: function(src, query) {
				            		this.setApiParam('query', query);
				            		var store = this.queryById('terms').getStore();
				            		store.removeAll();
				            		store.load();
				            	},
				            	scope: this
				            }
		    			}
		    		},{
		    			title: this.localize('categories'),
		    			itemId: 'categories',
		    			region: 'center',
		    			xtype: 'panel',
		    			layout: {
		    				type: 'hbox',
		    				align: 'stretch'
		    			},
		    			scrollable: 'x',
		    			dockedItems: [{
		                    dock: 'bottom',
		                    xtype: 'toolbar',
		                    overflowHandler: 'scroller',
		                    items: [{
								xtype: 'textfield',
								itemId: 'categoryFilter',
								fieldLabel: 'Category Filter',
								labelAlign: 'right',
								enableKeyEvents: true,
								listeners: {
									keyup: function(cmp, e) {
										var query = cmp.getValue().trim();
										this.queryById('categories').query('grid').forEach(function(grid) {
											if (query === '') {
												grid.getStore().clearFilter();
											} else {
												grid.getStore().filter('term', query);
											}
										}, this);
									},
									scope: this
								}
							},'-',{
		                    	text: this.localize('addCategory'),
		                    	handler: function() {
		                    		this.getAddCategoryWin().show();
		                    	},
		                    	scope: this
		                    },{
		                    	text: this.localize('removeTerms'),
		                    	handler: function() {
		                    		this.queryById('categories').query('grid').forEach(function(grid) {
										var sels = grid.getSelection();
										sels.forEach(function(sel) {
											this.categoriesManager.removeTerm(grid.category, sel.get('term'));
										}, this);
		                    			grid.getStore().remove(sels);
		                    		}, this);
		                    	},
		                    	scope: this
		                    }]
		    			}],
		    			items: []
		    		}]
	    		},{
	    			layout: 'fit',
	    			itemId: 'features',
	    			title: this.localize('features'),
	    			xtype: 'grid',
	    			scrollable: 'y',
	    			store: Ext.create('Ext.data.JsonStore', {
		    			fields: ['category']
		    		}),
	    			columns: [{
	    				text: this.localize('category'),
	    				dataIndex: 'category',
	    				sortable: false,
	    				hideable: false,
	    				flex: 1
	    			}],
					bbar: [{
						xtype: 'colorpaletteoption'
					},' ',{
						text: this.localize('setColorsFromPalette'),
						handler: function(btn) {
							var palName = btn.up().down('colorpaletteoption').down('combo').getValue();
							var palColors = this.app.getColorPalette(palName, true);
							if (palColors.length > 0) {
								Object.keys(this.categoriesManager.getCategories()).forEach(function(categoryName, index) {
									var color = palColors[index % (palColors.length)];
									this.categoriesManager.setCategoryFeature(categoryName, 'color', color);
								}, this);
								this.buildFeatures();
							}
						},
						scope: this
					}]
	    		}]
    		},
    		buttons: [{
				text: this.localize('cancel'),
				ui: 'default-toolbar',
				handler: function(btn) {
					this.setCategoriesId(undefined);
					btn.up('window').close();
				},
				scope: this
			},{
				text: this.localize('save'),
				handler: function(btn) {
					this.processFeatures();
					this.setColorTermsFromCategoryFeatures();
					this.app.saveCategoryData().then(function(id) {
						this.setCategoriesId(id);
						btn.up('window').close();
					}.bind(this), function() {
						this.setCategoriesId(undefined);
						btn.up('window').close();
					}.bind(this));
				},
				scope: this
			}],
			listeners: {
				show: function() {
					this.down('tabpanel').setActiveTab(0);
					this.queryById('categoryFilter').setValue('');
					// check to see if the widget value is different from the API
					if (this.getCategoriesId() !== this.panel.getApiParam('categories')) {
						this.queryById('categories').mask(this.localize('loadingCategories'));
		    			this.app.loadCategoryData(this.getCategoriesId()).then(function(data) {
							this.queryById('categories').unmask();
							this.setColorTermsFromCategoryFeatures();
							this.buildCategories();
							this.buildFeatures();
						}.bind(this), function(error) {
							this.queryById('categories').unmask();
							this.panel.showError(this.localize('errorLoadingCategories'));
						}.bind(this));
					} else {
						this.buildCategories();
						this.buildFeatures();
					}
				},
				afterrender: function(builder) {
					builder.on('loadedCorpus', function(src, corpus) {
		    			this.setCorpus(corpus);
			    		var terms = this.queryById('terms');
			    		terms.getStore().load();
		    		}, builder);
		    		
					this.panel.on('loadedCorpus', function(src, corpus) {
	    				builder.fireEvent('loadedCorpus', src, corpus);
	    			}, builder);
	    			if (this.panel.getCorpus && this.panel.getCorpus()) {builder.fireEvent('loadedCorpus', builder, this.panel.getCorpus());}
	    			else if (this.panel.getStore && this.panel.getStore() && this.panel.getStore().getCorpus && this.panel.getStore().getCorpus()) {
	    				builder.fireEvent('loadedCorpus', builder, this.panel.getStore().getCorpus());
					}
				},
				scope: this
			}
    	});
    	
    	this.setAddCategoryWin(Ext.create('Ext.window.Window', {
    		title: this.localize('addCategory'),
    		modal: true,
    		closeAction: 'hide',
    		layout: 'fit',
    		items: {
    			xtype: 'form',
    			width: 300,
				bodyPadding: '10 5 5',
    			defaults: {
    				labelAlign: 'right'
    			},
	    		items: [{
	    			xtype: 'textfield',
	    			fieldLabel: this.localize('categoryName'),
	    			name: 'categoryName',
	    			allowBlank: false,
	    			validator: function(val) {
	    				return this.categoriesManager.getCategoryTerms(val) === undefined ? true : this.localize('exists');
	    			}.bind(this),
	    			enableKeyEvents: true,
	    			listeners: {
	    				keypress: function(field, evt) {
	    					if (evt.getKey() === Ext.event.Event.ENTER) {
	    						field.up('form').queryById('addCategoryButton').click();
	    					}
	    				},
	    				scope: this
	    			}
	    		}],
	    		buttons: [{
	    			text: this.localize('cancel'),
	    			handler: function(btn) {
	    				btn.up('window').close();
	    			}
	    		},{
	    			itemId: 'addCategoryButton',
	    			text: this.localize('add'),
	    			handler: function(btn) {
	    				var form = btn.up('form');
	    				if (form.isValid()) {
	    					var name = form.getValues()['categoryName'];
	    					this.addCategory(name);
	    					btn.up('window').close();
	    				}
	    			},
	    			scope: this
	    		}]
    		},
    		listeners: {
    			show: function(win) {
    				var form = win.down('form').getForm();
    				form.reset();
					form.clearInvalid();
    			}
    		}
		}));
    	
    	this.callParent(arguments);
    },
    
    addCategory: function(name) {
    	this.categoriesManager.addCategory(name);
    	
    	this.queryById('features').getStore().add({category: name});

    	var termsData = [];
    	var terms = this.categoriesManager.getCategoryTerms(name);
    	if (terms !== undefined) {
    		for (var i = 0; i < terms.length; i++) {
    			termsData.push({term: terms[i]});
    		}
    	}
    	
    	var grid = this.queryById('categories').add({
    		xtype: 'grid',
    		category: name,
    		title: name,
    		frame: true,
    		width: 150,
    		margin: '10 0 10 10',
    		layout: 'fit',
    		tools: [{
    			type: 'close',
    			tooltip: this.localize('removeCategory'),
    			callback: function(panel) {
    				Ext.Msg.confirm(this.localize('removeCategory'), this.localize('confirmRemove'), function(btn) {
    					if (btn === 'yes') {
    						this.removeCategory(name);
    					}
    				}, this);
    			},
    			scope: this
			}],
			bbar: [{
				xtype: 'button',
				text: '',
				tooltip: this.localize('increaseCategory'),
				glyph: 'xf067@FontAwesome',
				handler: function(b) {
					var grid = b.findParentByType('grid');
					var parent = this.queryById('categories');
					var prev = parent.prevChild(grid);
					if (prev !== null) {
						parent.moveBefore(grid, prev);
						this.app.getCategoriesManager().setCategoryRanking(grid.getTitle(), parent.items.indexOf(grid));
					}
				},
				scope: this
			},'->',{
				xtype: 'button',
				text: '',
				tooltip: this.localize('decreaseCategory'),
				glyph: 'xf068@FontAwesome',
				handler: function(b) {
					var grid = b.findParentByType('grid');
					var parent = this.queryById('categories');
					var next = parent.nextChild(grid);
					if (next !== null) {
						parent.moveAfter(grid, next);
						this.app.getCategoriesManager().setCategoryRanking(grid.getTitle(), parent.items.indexOf(grid));
					}
				},
				scope: this
			}],
    		
    		store: Ext.create('Ext.data.JsonStore', {
    			data: termsData,
    			fields: ['term']
    		}),
    		viewConfig: {
	    		plugins: {
	    			ptype: 'gridviewdragdrop',
					ddGroup: 'terms',
					dragZone: {
						getDragText: function() {
							var text = '';
							this.dragData.records.forEach(function(d) {
								text += d.get('term')+', ';
							});
							return text.substr(0, text.length-2);
						}
					}
	    		}
    		},
    		selModel: {
    			mode: 'MULTI'
    		},
    		columns: [{
        		dataIndex: 'term',
        		flex: 1,
                sortable: true
            }],
    		listeners: {
    			beforedrop: function(node, data) {
					var categoriesManager = this.up('categoriesbuilder').categoriesManager;
					var source = data.view.up('grid');

					if (source.category !== undefined) {
						// we're moving a term from one category to another
						for (var i = data.records.length-1; i >= 0; i--) {
							var term = data.records[i].get('term');
							categoriesManager.removeTerm(source.category, term);
						}
					}
    			},
    			drop: function(node, data) {
    				data.view.getSelectionModel().deselectAll();
    				this.getSelectionModel().deselectAll();
    				
    				var categoriesManager = this.up('categoriesbuilder').categoriesManager;
    				var terms = [];
    				for (var i = 0; i < data.records.length; i++) {
    					var term = data.records[i].get('term');
    					terms.push(term);
    				}
    				categoriesManager.addTerms(name, terms);
    			}
    		}
    	});
    	
    	var titleEditor = new Ext.Editor({
    		updateEl: true,
    		alignment: 'l-l',
    		autoSize: {
    			width: 'boundEl'
    		},
    		field: {
    			xtype: 'textfield',
    			allowBlank: false,
    			validator: function(val) {
    				return this.categoriesManager.getCategoryTerms(val) === undefined || val ===  grid.getTitle() ? true : this.localize('exists');
    			}.bind(this)
    		},
    		listeners: {
    			complete: function(ed, newvalue, oldvalue) {
    				this.categoriesManager.renameCategory(oldvalue, newvalue);
    				this.buildFeatures();
    			},
    			scope: this
    		}
    	});
    	
    	grid.header.getTitle().textEl.on('dblclick', function(e, t) {
    		titleEditor.startEdit(t);
		});
    },
    
    removeCategory: function(name) {
    	var categoriesParent = this.queryById('categories');
    	var panel = categoriesParent.queryBy(function(cmp) {
    		if (cmp.category && cmp.category == name) {
    			return true;
    		}
    		return false;
    	});
    	categoriesParent.remove(panel[0]);
    	
    	var featuresStore = this.queryById('features').getStore();
    	featuresStore.removeAt(featuresStore.findExact('category', name));
    	
		this.categoriesManager.removeCategory(name);
    },
    
    addFeature: function(name) {
		this.categoriesManager.addFeature(name);
		this.buildFeatures();
    },
    
    buildFeatures: function() {
    	this.queryById('features').getStore().removeAll();
    	
    	var fields = ['category'];
		var columns = [{
			sortable: false,
			text: this.localize('category'),
			dataIndex: 'category',
			flex: 1
		}];
		var data = [];
		
		for (var category in this.categoriesManager.getCategories()) {
			data.push({category: category});
		}
		
		var features = this.categoriesManager.getFeatures();
		var featuresConfigs = Ext.ClassManager.getClass(this).features;
		
		// populate with default features if there are none (can happen when creating categories programmatically)
		if (Object.entries(features).length === 0) {
			for (var feature in featuresConfigs) {
				features[feature] = {};
				for (var category in this.categoriesManager.getCategories()) {
					features[feature][category] = undefined;
				}
			}
		}

		for (var feature in features) {
			fields.push(feature);
			
			var featureConfig = featuresConfigs[feature];
			var widgetConfig = Ext.applyIf({
				feature: feature,
				listeners: {
					change: function(cmp, newvalue) {
						if (cmp.rendered) {
							var rowIndex = cmp.up('gridview').indexOf(cmp.el.up('table'));
							var record = cmp.up('grid').getStore().getAt(rowIndex);
							if (record) {
								record.set(cmp.feature, newvalue);
							} else {
								if (window.console) {
									console.warn('no record for', rowIndex, cmp);
								}
							}
						}
					},
					scope: this
				}
			}, featureConfig);
			if (featureConfig.listeners) {
				Ext.applyIf(widgetConfig.listeners, featureConfig.listeners);
			}
			
			columns.push({
				sortable: false,
				hideable: false,
				text: this.localize(feature),
				dataIndex: feature,
				flex: 0.5,
				xtype: 'widgetcolumn',
				widget: widgetConfig
			});
			
			for (var category in this.categoriesManager.getCategories()) {
				var value = this.categoriesManager.getCategoryFeature(category, feature);
				for (var i = 0; i < data.length; i++) {
					if (data[i].category == category) {
						data[i][feature] = value;
						break;
					}
				}
			}
		}
		
		var store = Ext.create('Ext.data.JsonStore', {
			fields: fields,
			data: data
		});
		this.queryById('features').reconfigure(store, columns);
    },
	
	processFeatures: function() {
		var store = this.queryById('features').getStore();
		var features = Object.keys(this.categoriesManager.getFeatures());
		store.each(function(record) {
			var category = record.get('category');
			features.forEach(function(feature) {
				var featureValue = record.get(feature);
				if (featureValue !== undefined) {
					this.categoriesManager.setCategoryFeature(category, feature, featureValue);
				}
			}, this)
		}, this)
	},

	setColorTermsFromCategoryFeatures: function() {
        for (var category in this.categoriesManager.getCategories()) {
            var color = this.categoriesManager.getCategoryFeature(category, 'color');
            if (color !== undefined) {
                var rgb = this.app.hexToRgb(color);
                var terms = this.categoriesManager.getCategoryTerms(category);
                for (var i = 0; i < terms.length; i++) {
                    this.app.setColorForTerm(terms[i], rgb);
                }
            }
        }
    },

    buildCategories: function() {

    	this.queryById('categories').removeAll();
    	
    	var cats = this.categoriesManager.getCategories();
    	for (var key in cats) {
    		this.addCategory(key);
    	}
    }
});

Ext.define('Voyant.categories.CategoriesMenu', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.categoriesmenu',

	config: {
		terms: []
	},

	constructor: function(config) {
		config = config || {};
		if (config.panel) {
			this.panel = config.panel;
			this.app = this.panel.getApplication();
			this.categoriesManager = this.app.getCategoriesManager();
		} else {
			if (window.console) {
				console.warn('can\'t find panel!');
			}
		}
		this.callParent(arguments);
	},

	setColorTermsFromCategoryFeatures: function() {
		for (var category in this.categoriesManager.getCategories()) {
			var color = this.categoriesManager.getCategoryFeature(category, 'color');
			if (color !== undefined) {
				var rgb = this.app.hexToRgb(color);
				var terms = this.categoriesManager.getCategoryTerms(category);
				for (var i = 0; i < terms.length; i++) {
					this.app.setColorForTerm(terms[i], rgb);
				}
			}
		}
	},

	initComponent: function() {
		Ext.apply(this, {
			items: [{
				text: 'Set category for selected terms',
				menu: {
					minWidth: 250,
					itemId: 'cats',
					items: [],
					minButtonWidth: 50,
					fbar: [{
						xtype: 'button',
						text: 'Ok',
						handler: function(button) {
							var terms = this.getTerms();
							var addCats = [];
							var remCats = [];
							button.up('menu').items.each(function(item) {
								if (item.checked) {
									addCats.push(item.text);
								} else {
									remCats.push(item.text);
								}
							});
							remCats.forEach(function(cat) { this.categoriesManager.removeTerms(cat, terms); }, this);
							addCats.forEach(function(cat) { this.categoriesManager.addTerms(cat, terms); }, this);
		
							button.up('menu').up('menu').hide();

							this.setColorTermsFromCategoryFeatures();
							this.fireEvent('categorySet', this, addCats);
						},
						scope: this
					},{
						xtype: 'button',
						text: 'Cancel',
						handler: function(button) {
							button.up('menu').up('menu').hide();
						}
					},{xtype: 'tbfill'},{
						xtype: 'button',
						glyph: 'xf013@FontAwesome',
						tooltip: 'Show Categories Builder',
						handler: function(button) {
							if (Voyant.categories.Builder === undefined) {
								Voyant.categories.Builder = Ext.create('Voyant.categories.CategoriesBuilder', {
									panel: this.panel
								});
							}
							Voyant.categories.Builder.show();
						},
						scope: this
					}]
				}
			}],
			listeners: {
				beforeshow: function(menu) {
					var categories = this.categoriesManager.getCategories();
					var catsMenu = menu.down('#cats');
					catsMenu.removeAll();

					var terms = this.getTerms();
					var term = Array.isArray(terms) ? terms[0] : terms;
					var termCats = this.categoriesManager.getCategoriesForTerm(term);

					catsMenu.add(Object.keys(categories).map(function(cat) { return {text: cat, xtype: 'menucheckitem', checked: termCats.indexOf(cat) !== -1} }));
				},
				scope: this
			}
		});

		this.callParent(arguments);
	}
})