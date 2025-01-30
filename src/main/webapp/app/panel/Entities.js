Ext.define('Voyant.panel.Entities', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.entities',

	statics: {
		i18n: {
			title: 'Named Entity Recognition',
			entity: 'Entity',
			lemma: 'Lemma',
			classification: 'Classification',
			document: 'Document',
			start: 'Start',
			end: 'End',
			entityType: 'entity type',
			nerVoyant: 'Entity Identification with Voyant',
			nerNssi: 'Entity Identification with NSSI',
			nerSpacy: 'Entity Identification with SpaCy',
		},
		api: {
			/**
			 * @memberof Contexts
			 * @instance
			 * @property {DocId}
			 */
    		docId: undefined,
		}
	},

	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		this.callParent(arguments);
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},

	initComponent: function() {
		var me = this;

		Ext.apply(me, {
			title: this.localize('title'),
			layout: 'fit',
			items: [{
				xtype: 'entitieslist',
				listeners: {
					boxready: function(cmp) {
						cmp.getColumns().forEach(function(col) {
							col.show();
						})
					},
					scope: this
				}
			}],
			dockedItems: [{
				dock: 'bottom', 
				xtype: 'toolbar',
				items: [{
					xtype: 'corpusdocumentselector'
				},{
					itemId: 'annotatorType',
					xtype: 'combo',
					queryMode: 'local',
					triggerAction: 'all',
					fieldLabel: 'NER Annotator',
					labelAlign: 'right',
					value: 'spacy',
					forceSelection: true,
					allowBlank: false,
					editable: false,
					valueField: 'value',
					displayField: 'name',
					store: new Ext.data.ArrayStore({
						fields: ['name', 'value'],
						data: [['Spacy', 'spacy'], ['NSSI', 'nssi'], ['Voyant', 'stanford']]
					})
				},{
					xtype: 'button',
					text: 'Find Entities',
					handler: function(btn) {
						var annotator = btn.up().queryById('annotatorType').getValue();
						if (annotator !== null) {
							this.nerServiceHandler(annotator);
						}
					},
					scope: this
				},'->',{
					xtype: 'textfield',
					itemId: 'entitySearch',
					fieldLabel: 'Filter Entities',
					labelAlign: 'right',
					enableKeyEvents: true,
					triggers: {
						search: {
							cls: 'fa-trigger form-fa-search-trigger',
							handler: function(cmp) {
								this.searchEntities(cmp.getValue());
							},
							scope: this
						}
					},
					listeners: {
						keyup: function(cmp, e) {
							if (e.getCharCode() === 13) {
								this.searchEntities(cmp.getValue());
							}
						},
						scope: this
					}
				}]
			}],
			listeners: {
				corpusSelected: function(src, corpus) {
					this.setApiParam('docId', undefined);
				},

				documentsSelected: function(src, docIds) {
					this.setApiParam('docId', docIds);
				},

				entitiesClicked: function(src, ents) {
				},

				entityLocationClicked: function(src, ent) {
				},

				scope: this
			}
		});

		me.callParent(arguments);
	},

	nerServiceHandler: function(annotator) {
		var entitiesList = this.down('entitieslist');
		entitiesList.clearEntities();
		entitiesList.getEntities(annotator, this.getApiParam('docId'));
	},

	searchEntities: function(query) {
		query = query.trim().toLowerCase();
		var entitiesList = this.down('entitieslist');
		if (query.length > 0) {
			entitiesList.getStore().filterBy(function(record) {
				return record.getTerm().toLowerCase().indexOf(query) !== -1;
			});
			entitiesList.getView().findFeature('grouping').expandAll();
		} else {
			entitiesList.getStore().clearFilter();
			entitiesList.getView().findFeature('grouping').collapseAll();
		}
	}
});

