Ext.define('Voyant.notebook.Catalogue', {
	extend: 'Ext.Component',
    mixins: ['Voyant.util.Localization','Voyant.notebook.util.NotebooksList'],
	alias: 'widget.notebookcatalogue',
	statics: {
		i18n: {
			title: 'Spyral Notebooks Catalogue',
			browse: 'Browse Notebooks',
			keywords: 'Keywords',
			author: 'Author',
			language: 'Language',
			license: 'License',
			search: 'Search within notebooks',
			noResults: 'No matching notebooks',
			suggested: 'Suggested Notebooks',
			load: 'Open Selected Notebook',
			close: 'Close'
		}
	},

	window: undefined,

	gettingFacets: false,

	constructor: function() {
		this.suggestedStore = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name: 'id'},
				{name: 'author'},
				{name: 'title'},
				{name: 'description'},
				{name: 'keywords'},
				{name: 'language'},
				{name: 'license'},
				{name: 'created', type: 'date'},
				{name: 'modified', type: 'date'},
				{name: 'version'}
			]
		});
		this.suggestedTemplate = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="catalogue-notebook">',
					'<div class="title" title="{title}">{title}</div>',
					'<div class="description">{description}</div>',
				'</div>',
			'</tpl>'
		);
		this.callParent(arguments);
	},

	initComponent: function(config) {
		this.callParent(arguments);
	},

	showWindow: function() {
		if (this.window === undefined) {
			this.window = Ext.create('Ext.window.Window', {
				title: this.localize('title'),
				width: '80%',
				height: '80%',
				maximizable: true,
				modal: true,
				cls: 'catalogue',
				layout: 'border',
				items: [{
					xtype: 'panel',
					region: 'center',
					flex: 2,
					border: true,
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					items: [{
						xtype: 'toolbar',
						height: 30,
						layout: {
							type: 'hbox',
							pack: 'center'
						},
						items: [{xtype:'tbspacer', flex: .1},{
							xtype: 'textfield',
							itemId: 'queryfield',
							emptyText: this.localize('search'),
							flex: .8,
							enableKeyEvents: true,
							triggers: {
								cancel: {
									hidden: true,
									cls: 'fa-trigger form-fa-clear-trigger',
									handler: function(cmp) {
										cmp.setValue('');
										cmp.getTriggers()['cancel'].hide();
										this.getNotebooks();
									},
									scope: this
								},
								search: {
									cls: 'fa-trigger form-fa-search-trigger',
									handler: function(cmp) {
										this.getNotebooks();
									},
									scope: this
								}
							},
							listeners: {
								keyup: function(cmp, e) {
									if (e.getCharCode() === 13) {
										this.getNotebooks();
									}
									if (cmp.getValue().trim().length > 0) {
										cmp.getTriggers()['cancel'].show();
									} else {
										cmp.getTriggers()['cancel'].hide();
									}
								},
								scope: this
							}
						},{xtype:'tbspacer', flex: .1}]
					},{
						xtype: 'notebookslist',
						itemId: 'notebookslist',
						cls: 'catalogue-window',
						flex: 1,
						listeners: {
							itemdblclick: function(view, record, el) {
								this.fireEvent('notebookSelected', this, record.get('id'), this.hideWindow);
							},
							scope: this
						}
					}]
				},{
					xtype: 'panel',
					region: 'west',
					collapsible: true,
					title: this.localize('browse'),
					flex: 1,
					itemId: 'facets',
					cls: 'facets',
					layout: {
						type: 'accordion',
						animate: false,
						multi: true,
						fill: false,
						align: 'stretch',
						titleCollapse: true,
						hideCollapseTool: true
					},
					defaults: {
						xtype: 'grid',
						rowLines: false,
						hideHeaders: true,
        				selType: 'checkboxmodel',
						columns: [{ renderer: function(value, metaData, record) {return "("+record.get('count')+") "+record.get('label')}, flex: 1 }],
						store: {
							xtype: 'store.json',
							fields: [
								{name: 'label'},
								{name: 'count', type: 'integer'}
							]
						}
					},
					items: [{
						title: this.localize('keywords'),
						facet: 'facet.keywords',
						flex: 3
					},{
						title: this.localize('author'),
						facet: 'facet.author',
						flex: 2
					},{
						title: this.localize('language'),
						facet: 'facet.language',
						flex: 1
					},{
						title: this.localize('license'),
						facet: 'facet.license',
						flex: 1
					}]
				},{
					xtype: 'panel',
					region: 'east',
					collapsible: true,
					collapsed: false,
					title: this.localize('suggested'),
					width: 250,
					layout: 'fit',
					items: [{
						xtype: 'dataview',
						padding: 10,
						scrollable: 'vertical',
						itemId: 'suggestedNotebooks',
						store: this.suggestedStore,
						tpl: this.suggestedTemplate,
						itemSelector: 'div.catalogue-notebook',
						overItemCls: 'catalogue-notebook-over',
						selectedItemCls: 'catalogue-notebook-selected',
						listeners: {
							itemdblclick: function(view, record, el) {
								this.fireEvent('notebookSelected', this, record.get('id'), this.hideWindow);
							},
							scope: this
						}
					}]
				}],
				closeAction: 'hide',
				buttons: [{
					text: this.localize('close'),
					ui: 'default-toolbar',
					handler: function(but) {
						this.window.close();
					},
					scope: this
				},{
					text: this.localize('load'),
					glyph: 'xf115@FontAwesome',
					handler: function(but) {
						var record = this.window.down('#notebookslist').getSelection()[0];
						if (record === undefined) {
							record = this.window.down('#suggestedNotebooks').getSelection()[0];
						}
						if (record) {
							this.fireEvent('notebookSelected', this, record.get('id'), this.hideWindow)
						}
					},
					scope: this
				}]
			});
			this.window.query('#facets > grid').forEach(function(facetCmp) {
				facetCmp.getSelectionModel().on('selectionchange', this._loadFacets, this);
			}, this);
		} else {
			// reset catalogue
			this.window.query('#facets > grid').forEach(function(facetCmp) {
				facetCmp.getStore().clearFilter();
				facetCmp.getSelectionModel().deselectAll();
			});
			this.window.down('#queryfield').setValue('');
			this.window.down('#notebookslist').getSelectionModel().deselectAll();
			this.window.down('#suggestedNotebooks').getSelectionModel().deselectAll();
			this.window.down('#notebookslist').getStore().removeAll();
		}

		if (this.suggestedStore.isLoaded() === false) {
			this.getSuggestedNotebooks();
		}

		this.window.show();

		this._loadFacets();
	},

	hideWindow: function() {
		if (this.window !== undefined) {
			this.window.close();
		}
	},

	_getSelectedFacets: function() {
		var facets = [];
		this.window.query('#facets > grid').forEach(function(facetCmp) {
			facetCmp.getSelection().forEach(function(record) {
				facets.push([facetCmp.facet, record.get('label')]);
			})
		});
		return facets;
	},

	_loadFacets: function() {
		if (this.gettingFacets === false) {
			this.window.down('#facets').mask('Loading');
			this.gettingFacets = true;
			var facetQuery = this._getSelectedFacets().map(function(f) { return f.join('=') });

			var me = this;
			Spyral.Load.trombone({
				tool: 'notebook.CatalogueFacets',
				query: facetQuery,
				noCache: 1
			}).then(function(json) {
				json.catalogue.facets.forEach(function(facetResult) {
					var facetCmp = me.window.query('#facets > grid[facet='+facetResult.facet+']')[0];
					if (facetCmp) {
						var store = facetCmp.getStore();
						store.clearFilter();
						if (store.getCount() === 0) {
							store.loadRawData(facetResult.results);
						} else {
							var matches = [];
							store.each(function(record) {
								var label = record.get('label');
								for (var i = 0; i < facetResult.results.length; i++) {
									var result = facetResult.results[i];
									if (result.label === label) {
										record.set('count', result.count);
										matches.push(label);
										break;
									}
								}
							});
							store.filterBy(function(record) { return matches.indexOf(record.get('label')) !== -1 });
						}
					}
				});
				me.window.down('#facets').unmask();
				me.gettingFacets = false;
				
				me.getNotebooks();
			}).catch(function(err) {
				me.window.down('#facets').unmask();
				me.gettingFacets = false;
			});
		}
	},

	getNotebooks: function(queries) {
    	if (!queries) {
	    	queries = [];
			var facets = this._getSelectedFacets();
	    	facets.forEach(function(f) {
				queries.push(f.join(':'));
			})
			var queryfieldstring = this.window.down('#queryfield').getValue();
			if (queryfieldstring.trim().length > 0) {
				queries.push(queryfieldstring);
			}
			return this.getNotebooks(queries);
    	}
		if (queries.length === 0) {
			this.window.down('#notebookslist').getSelectionModel().deselectAll();
			this.window.down('#notebookslist').getStore().removeAll();
			return;
		}
		
		queries.push('facet.catalogue:true');

		this.window.down('#notebookslist').mask('Loading');
		this.window.down('#notebookslist').getSelectionModel().deselectAll();

		var me = this;
		Spyral.Load.trombone({
			tool: 'notebook.NotebookFinder',
			query: queries,
			noCache: 1
		}).then(function(json) {
			me.window.down('#notebookslist').unmask();
			me.window.down('#notebookslist').getStore().loadRawData(json.catalogue.notebooks);
			me.window.down('#notebookslist').getStore().sort('modified', 'DESC');
		}).catch(function(err) {
			me.window.unmask()
		});
	},

	getSuggestedNotebooks: function() {
		var notebookIds = ['Tutorials', 'aboutspyral', 'DialogicaWelcome'];
		var query = 'id:'+notebookIds.join('|id:');
		var me = this;
		Spyral.Load.trombone({
			tool: 'notebook.NotebookFinder',
			query: query,
			parse: false,
			noCache: 1
		}).then(function(json) {
			me.suggestedStore.loadRawData(json.catalogue.notebooks);
			me.suggestedStore.sort('modified', 'DESC');
		}).catch(function(err) {
		})
	}
});
