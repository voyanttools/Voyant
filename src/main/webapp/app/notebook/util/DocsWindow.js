Ext.define('Voyant.notebook.util.DocsWindow', {
	extend: 'Ext.window.Window',
	mixins: ['Voyant.util.Localization'],
	statics: {
		i18n: {
			home: 'Home',
			overview: 'Overview',
			configs: 'Configs',
			methods: 'Methods',
			docs: 'Docs',
			openFull: 'Open Full Documentation',
			outlineIntro: 'This is an inline version of the API documentation for <a href="#!/guide/notebook">Spyral Notebooks</a>. You can also <a href="#!/api">view the full documentation</a> in a new window.',
			outlineApi: 'Here is a list of the Spyral classes that can be used in your notebook:',
			loadingDocs: 'Loading Docs'
		}
	},

	lastDocEntryClass: undefined,
	lastDocEntryMethod: undefined,

	outlineTemplate: new Ext.XTemplate(
		'<ul>',
			'<tpl for="groups">',
				'<tpl for="classes">',
					'<li><a href="#!/api/{.}">{.}</a></li>',
				'</tpl>',
			'</tpl>',
		'</ul>'
	),
	membersTemplate: new Ext.XTemplate(
		'<div class="members">',
			'<tpl for=".">',
				'<div class="member">',
					'<tpl if="meta.static">',
						'<span class="static" title="static">s</span>',
					'</tpl>',
					'<a href="#!/api/{owner}-{id}">{name}</a>',
				'</div>',
			'</tpl>',
		'</div>'
	),

	constructor: function(config) {
		this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);

		config = config || {};
		Ext.apply(config, {
			title: this.localize('docs'),
			width: 500,
			height: 500,
			minimizable: true,
			closeAction: 'hide',
			tbar: [{
				text: this.localize('home'),
				itemId: 'homeBtn',
				glyph: 'xf015@FontAwesome',
				handler: function(btn) {
					this.showDocs();
				}.bind(this)
			},{
				text: this.localize('overview'),
				itemId: 'overviewBtn',
				glyph: 'xf05a@FontAwesome',
				handler: function(btn) {
					this._showDocEntry();
				}.bind(this)
			},{
				text: this.localize('configs'),
				itemId: 'configsBtn',
				glyph: 'xf013@FontAwesome',
				handler: function(btn) {
					btn.up('window').getLayout().setActiveItem(1);
				}
			},{
				text: this.localize('methods'),
				itemId: 'methodsBtn',
				glyph: 'xf1b2@FontAwesome',
				handler: function(btn) {
					btn.up('window').getLayout().setActiveItem(2);
				}
			}],
			layout: 'card',
			items: [{
				itemId: 'main',
				cls: 'docsWindowContent',
				scrollable: 'y',
				html: ''
			},{
				itemId: 'configs',
				cls: 'docsWindowContent',
				scrollable: 'x',
				layout: 'fit',
				html: ''
			},{
				itemId: 'methods',
				cls: 'docsWindowContent',
				scrollable: 'x',
				layout: 'fit',
				html: ''
			}],
			tools: [{
				type: 'help',
				tooltip: this.localize('openFull'),
				callback: function(parent, tool, event) {
					var entryId = '';
					if (this.lastDocEntryClass) {
						entryId += '/'+this.lastDocEntryClass;
					}
					if (this.lastDocEntryMethod) {
						entryId += '-'+this.lastDocEntryMethod;
					}
					window.open(Voyant.application.getBaseUrlFull()+'docs/#!/api'+entryId, '_spyral_docs');
				}.bind(this)
			},{
				type: 'restore',
				itemId: 'restoreButton',
				hidden: true,
				handler: function(evt, el, owner, tool) {
					tool.hide();
					var win = owner.up('window');
					win.expand(false);
					setTimeout(function() {
						win.anchorTo(Ext.getBody(), 'br-br');
					}, 10);
				}
			}],
			listeners: {
				boxready: function(win) {
					win.body.addListener('click', function(evt) {
						if (evt.target.tagName.toLowerCase() === 'a') {
							evt.preventDefault();
							evt.stopPropagation();
							var link = evt.target.getAttribute('href');
							this.handleDocLink(link);
						}
					}, this);
				},
				minimize: function(win) {
					win.collapse(Ext.Component.DIRECTION_BOTTOM, false).anchorTo(Ext.getBody(), 'br-br');
					win.down('#restoreButton').show();
				},
				scope: this
			}
		});

		this.callParent([config]);
	},

	showDocs: function() {
		this.show().anchorTo(Ext.getBody(), 'br-br');
		this.getLayout().getRenderTarget().mask(this.localize('loadingDocs'));

		Ext.Ajax.request({
			// TODO inaccessible on server?
			url: Voyant.application.getBaseUrlFull()+'resources/docs/en/categories.json'
		}).then(function(response) {
			var json;
			try {
				json = JSON.parse(response.responseText);
			} catch (e) {
				console.warn('error parsing api doc json', e);
			}
			if (json) {
				this._loadExtOutline(json[0]);
			}
		}.bind(this), function() {
			this._loadExtOutline({
				"name": "Spyral",
				"groups": [
					{
						"name": "Base",
						"classes": [
							"Spyral.Corpus",
							"Spyral.Table",
							"Spyral.Chart",
							"Spyral.Load",
							"Spyral.Util",
							"Spyral.Categories"
						]
					},{
						"name": "Notebook",
						"classes": [
							"Spyral.Metadata",
							"Spyral.Notebook",
							"Spyral.Util.Storage"
						]
					},{
						"name": "Global",
						"classes": [
							"window"
						]
					}
				]
			})
		}.bind(this)).always(function() {
			this.getLayout().setActiveItem(0);
			this.getLayout().getRenderTarget().unmask();
		}.bind(this));
	},

	handleDocLink: function(link) {
		var matches = link.match(/.*?\/api\/([\w.]+)-?(.*)?/);
		if (matches) {
			var linkClass = matches[1];
			var linkMethod = matches[2];
			if (linkClass !== this.lastDocEntryClass) {
				this.showDocsForClassMethod(linkClass, linkMethod);
			} else {
				this._showDocEntry(linkMethod);
			}
		} else {
			if (link.indexOf('#!') === 0) {
				window.open(Voyant.application.getBaseUrlFull()+'docs/'+link, '_spyral_docs');
			} else {
				window.open(link, '_external');
			}
		}
	},

	showDocsForClassMethod: function(docClass, docMethod) {
		this.show().anchorTo(Ext.getBody(), 'br-br');
		this.getLayout().getRenderTarget().mask(this.localize('loadingDocs'));

		Ext.Ajax.request({
			url: Voyant.application.getBaseUrlFull()+'docs/output/'+docClass+'.js'
		}).then(function(response) {
			var jsonpText = response.responseText; // response has JSON-P wrapper which we'll need to remove
			var json;
			try {
				json = JSON.parse(jsonpText.substring(jsonpText.indexOf('{'), jsonpText.length-2));
			} catch (e) {
				console.warn('error parsing api doc json', e);
			}
			if (json) {
				this._loadExtDocs(json, docClass, docMethod);
			}
		}.bind(this)).always(function() {
			this.getLayout().getRenderTarget().unmask();
		}.bind(this));
	},

	_showDocEntry: function(entryId) {
		if (this.isHidden()) {
			this.show().anchorTo(Ext.getBody(), 'br-br');
		}
		var docsParentEl = this.down('#main').getEl().dom;
		docsParentEl.querySelectorAll('.doc-contents, .members-section > .subsection > div').forEach(function(el) { el.hidden = true; });
		this.lastDocEntryMethod = entryId;
		if (entryId) {
			docsParentEl.querySelector('#'+entryId).hidden = false;
		} else {
			docsParentEl.querySelector('.doc-contents').hidden = false;
		}
		this.getLayout().setActiveItem(0);
		setTimeout(function() {
			this.down('#main').body.scrollTo('top', 0, false);
		}.bind(this), 0);
	},

	_loadExtOutline: function(json) {
		this.lastDocEntryClass = undefined;
		this.lastDocEntryMethod = undefined;

		this.setTitle(this.localize('docs')+' '+this.localize('home'));
		this.down('#restoreButton').hide();
		this.down('#overviewBtn').hide();
		this.down('#configsBtn').hide();
		this.down('#methodsBtn').hide();

		var html = '<p>'+this.localize('outlineIntro')+'</p><p>'+this.localize('outlineApi')+'</p>';
		html += this.outlineTemplate.apply(json);

		this._setHtmlForCard('main', html);

		this.body.scrollTo('top', 0, false);

		if (this.getCollapsed()) {
			this.expand(false);
			setTimeout(function() {
				this.anchorTo(Ext.getBody(), 'br-br');
			}.bind(this), 10);
		}
	},

	_loadExtDocs: function(json, docClass, docMethod) {
		this.lastDocEntryClass = docClass;
		this.lastDocEntryMethod = docMethod;

		this.setTitle(this.localize('docs')+': '+json.name);
		this.down('#restoreButton').hide();

		this._setHtmlForCard('main', json.html);

		this._showDocEntry(docMethod);

		this.down('#overviewBtn').show();

		var configMembers = [];
		var methodMembers = [];
		json.members.forEach(function(member) {
			if (member.tagname === 'cfg') {
				configMembers.push(member);
			} else if (member.tagname === 'method') {
				if (member.meta.static) {
					// TODO add icon to indicate it's static?
				}
				methodMembers.push(member);
			}
		});

		this._setHtmlForCard('configs', this.membersTemplate.apply(configMembers));
		this.down('#configsBtn').setVisible(configMembers.length > 0);

		this._setHtmlForCard('methods', this.membersTemplate.apply(methodMembers));
		this.down('#methodsBtn').setVisible(methodMembers.length > 0);

		if (this.getCollapsed()) {
			this.expand(false);
			setTimeout(function() {
				this.anchorTo(Ext.getBody(), 'br-br');
			}.bind(this), 10);
		}
	},

	_setHtmlForCard: function(cardId, html) {
		this.down('#'+cardId).setHtml(html);
		var cardEl = this.down('#'+cardId).getEl().dom;
		Ext.fly(cardEl).selectable();
	}
});