Ext.define('Voyant.notebook.metadata.MetadataEditor', {
	extend: 'Ext.form.Panel',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.metadataeditor',
	statics: {
		i18n: {
			metadataAuthor: "Author(s)",
    		metadataTitle: "Title",
    		metadataTip: "Edit notebook metadata.",
    		metadataKeywords: "Keywords",
    		metadataDescription: "Description",
    		metadataLicense: "Licence",
    		metadataLanguage: "Language",
			metadataCatalogue: "Catalogue",
			metadataCatalogueInclude: "Include this notebook in the public Catalogue?"
		}
	},

	constructor: function(config) {
		Ext.apply(this, config, {
			trackResetOnLoad: true,
			items: {
				bodyPadding: 5,

				// Fields will be arranged vertically, stretched to full width
				layout: 'anchor',
				defaults: {
					anchor: '100%',
					labelAlign: "right"
				},

				// The fields
				defaultType: 'textfield',
				items: [{
					fieldLabel: this.localize("metadataAuthor"),
					name: 'author'
				},{
					fieldLabel: this.localize("metadataTitle"),
					name: 'title'
				},{
					fieldLabel: this.localize("metadataKeywords"),
					name: 'keywords',
					xtype: 'tagfield',
					store: {
						xtype: 'store.json',
						fields: [
							{name: 'label'},
							{name: 'count', type: 'integer'}
						]
					},
					displayField: 'label',
					valueField: 'label',
					queryMode: 'local',
					filterPickList: true,
					forceSelection: false,
					delimiter: ',',
					createNewOnEnter: true,
					listeners: {
						afterrender: function(cmp) {
							Spyral.Load.trombone({
								tool: 'notebook.CatalogueFacets',
								facets: 'facet.keywords',
								noCache: 1
							}).then(function(json) {
								cmp.getStore().loadRawData(json.catalogue.facets[0].results);
								// need to reset value to make sure previously set keywords show up
								cmp.setValue(cmp.getValue());
							});
						}
					}
				},{
					xtype: 'checkbox',
					fieldLabel: this.localize('metadataCatalogue'),
					boxLabel: this.localize('metadataCatalogueInclude'),
					name: 'catalogue',
					inputValue: 'true'
				},{
					xtype: 'textarea',
					fieldLabel: this.localize("metadataDescription"),
					name: 'description'
				},{
					xtype: 'combo',
					fieldLabel: this.localize("metadataLicense"),
					name: 'license',
					store: {
						fields: ['text'],
						data: [
							{"text": "Apache License 2.0"},
							{"text": "BSD 3-Clause \"New\" or \"Revised\" license"},
							{"text": "BSD 2-Clause \"Simplified\" or \"FreeBSD\" license"},
							{"text": "Creative Commons Attribution (CC BY)"},
							{"text": "Creative Commons Attribution-ShareAlike (CC BY-SA)"},
							{"text": "Creative Commons Zero (CC0)"},
							{"text": "GNU General Public License (GPL)"},
							{"text": "GNU Library or \"Lesser\" General Public License (LGPL)"},
							{"text": "MIT license"},
							{"text": "Mozilla Public License 2.0"},
							{"text": "Common Development and Distribution License"},
							{"text": "Eclipse Public License"}
						]
					}
				},{
					xtype: 'combo',
					name: 'language',
					fieldLabel: this.localize("metadataLanguage"),
					store: {
						fields: ['text'],
						data: [
							{"text": "Bengali"},
							{"text": "Bhojpuri"},
							{"text": "Egyptian Arabic"},
							{"text": "English"},
							{"text": "French"},
							{"text": "German"},
							{"text": "Gujarati"},
							{"text": "Hausa"},
							{"text": "Hindi"},
							{"text": "Indonesian"},
							{"text": "Italian"},
							{"text": "Japanese"},
							{"text": "Javanese"},
							{"text": "Kannada"},
							{"text": "Korean"},
							{"text": "Mandarin"},
							{"text": "Marathi"},
							{"text": "Persian"},
							{"text": "Portuguese"},
							{"text": "Russian"},
							{"text": "Southern Min"},
							{"text": "Spanish"},
							{"text": "Standard Arabic"},
							{"text": "Swahili"},
							{"text": "Tamil"},
							{"text": "Telugu"},
							{"text": "Thai"},
							{"text": "Turkish"},
							{"text": "Urdu"},
							{"text": "Vietnamese"},
							{"text": "Western Punjabi"},
							{"text": "Wu Chinese"},
							{"text": "Yue Chinese"}
						]
					}
				}]
			}
		});
		this.callParent(arguments);
	},
	loadMetadata: function(metadata) {
		if (metadata instanceof Spyral.Metadata) {
			this.loadRecord(Ext.create('Voyant.data.model.NotebookMetadata', {
				title: metadata.title,
				userId: metadata.userId,
				author: metadata.author,
				catalogue: metadata.catalogue,
				description: metadata.description,
				keywords: metadata.keywords,
				language: metadata.language,
				license: metadata.license
			}));
		}
	}
});

Ext.define('Voyant.data.model.NotebookMetadata', {
	extend: 'Ext.data.Model',
	fields: [
		{name: 'title', type: 'string'},
		{name: 'userId', type: 'string'},
		{name: 'author', type: 'string'},
		{name: 'catalogue', type: 'boolean', defaultValue: false},
		{name: 'description', type: 'string'},
		{name: 'keywords', type: 'string'},
		{name: 'language', type: 'string', defaultValue: 'English'},
		{name: 'license', type: 'string', defaultValue: 'Creative Commons Attribution (CC BY)'},
		{name: 'modified', type: 'date'},
		{name: 'created', type: 'date'}
	]
});