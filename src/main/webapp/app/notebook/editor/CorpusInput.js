Ext.define('Voyant.notebook.editor.CorpusInput', {
	extend: 'Voyant.notebook.editor.CachedInput',
	alias: 'widget.notebookcorpusinput', 
	mixins: ['Voyant.util.Localization'],
	config: {
		corpusId: undefined
	},
	statics: {
		i18n: {
		}
	},

	constructor: function(config) {
		Ext.apply(this, {
			layout: {
				type: 'hbox',
				align: 'begin',
				pack: 'start'
			},
			height: 100,
			items: [{
				xtype: 'combo',
				fieldLabel: 'Corpus Input',
				labelAlign: 'right',
				margin: '5px',
				queryMode: 'local',
				allowBlank: false,
				editable: false,
				forceSelection: true,
				value: 'text',
				store: [['text','Text'],['variable','Variable'],['file','File']],
				listeners: {
					change: function(rg, val) {
						rg.nextSibling().getLayout().setActiveItem(val);
					},
					scope: this
				}
			},{
				xtype: 'container',
				layout: 'card',
				defaultType: 'container',
				itemId: 'cards',
				flex: 1,
				margin: '5px 5px 5px 0',
				items: [{
					itemId: 'text',
					items: [{
						xtype: 'textfield',
						width: '75%',
						name: 'text',
						fieldLabel: ''
					}]
				},{
					itemId: 'variable',
					items: [{
						xtype: 'combo',
						name: 'variable',
						fieldLabel: '',
						triggerAction: 'all',
						queryMode: 'local',
						editable: false,
						forceSelection: true,
						emptyText: 'Notebook Variables',
						store: { fields: ['text'] }
					}],
					listeners: {
						activate: function(crd) {
							this.populateVariables();
						},
						scope: this
					}
				},{
					itemId: 'file',
					xtype: 'notebookfileinput'
				}]
			}],
			listeners: {
				boxready: function(cmp) {
					cmp.up('notebookdatawrapper').results.on('sandboxMessage', function(msg) {
						// use sandbox listener to capture corpusId
						if (msg.type === 'result') {
							var corpusVarName = cmp.up('notebookdatawrapper').getDataName();
							var corpusVal = msg.variables.find(function(variable) { return variable.name === corpusVarName });
							Spyral.Util.blobToString(corpusVal.value).then(function(strVal) {
								var corpusJson = JSON.parse(strVal);
								cmp.setCorpusId(corpusJson.corpusid);
							})
						}
					});

					cmp.up('notebook').on('notebookRun', function(notebook) {
						cmp.populateVariables();
					})
				}
			}
		});

		this.callParent(arguments);
	},

	populateVariables: function() {
		var cmp = this.up('notebookdatawrapper');
		var prev = cmp.previousSibling();
		var variables = [];
		if (prev !== null) {
			variables = cmp.up('notebook').getNotebookVariables(cmp).map(function(vr) { return [vr.name] });
		}
		this.down('#variable combo').getStore().loadRawData(variables);
	},

	getCode: function(varName) {
		var dfd = new Ext.Deferred();

		if (this.getCorpusId()) {
			var val = varName+'=new Spyral.Corpus("'+this.getCorpusId()+'")';
			dfd.resolve(val);
		} else {
			var activeItem = this.down('#cards').getLayout().getActiveItem();
			var type = activeItem.getItemId();
			if (type === 'variable') {
				var inputVarName = activeItem.down('combo').getValue();
				if (inputVarName !== '') {
					var val = 'Spyral.Corpus.load({input:'+inputVarName+'}).then(function(){'+varName+'=arguments[0]})';
					dfd.resolve(val);
				} else {
					dfd.reject('No variable specified!');
				}
			} else if (type === 'file') {
				activeItem.getValue().then(function(blob) {
					Spyral.Util.blobToString(blob).then(function(strVal) {
						var text = strVal.replace('"', '\"');
						var val = 'Spyral.Corpus.load({input:"'+text+'"}).then(function(){'+varName+'=arguments[0]})';
						dfd.resolve(val);
					}, function() {
						dfd.reject();
					})
					
				});
			} else if (type === 'text') {
				var text = activeItem.down('textfield').getValue().replace('"', '\"');
				if (text !== '') {
					var val = 'Spyral.Corpus.load({input:"'+text+'"}).then(function(){'+varName+'=arguments[0]})';
					dfd.resolve(val);
				} else {
					dfd.reject('No text entered!');
				}
			}
		}

		return dfd.promise;
	},

	getInput: function() {
		return {
			corpusId: this.getCorpusId()
		}
	}
});