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
			outlineApi: 'Here is a list of the Spyral classes that can be used in your notebook:'
		}
	},

	lastDocEntryClass: undefined,
	lastDocEntryMethod: undefined,

	constructor: function(config) {
		this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);

		config = config || {};
		Ext.apply(config, {
			title: 'Docs',
			width: 500,
			height: 500,
			scrollable: 'y',
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
				menu: {
					xtype: 'menu',
					itemId: 'docsConfigs',
					items: []
				}
			},{
				text: this.localize('methods'),
				itemId: 'methodsBtn',
				glyph: 'xf1b2@FontAwesome',
				menu: {
					xtype: 'menu',
					itemId: 'docsMethods',
					items: []
				}
			}],
			items: [{
				xtype: 'container',
				html: '<div id="docsWindowParent"><div></div></div>'
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
				minimize: function(win) {
					win.collapse(Ext.Component.DIRECTION_BOTTOM, false).anchorTo(Ext.getBody(), 'br-br');
					win.down('#restoreButton').show();
				}
			}
		});

		this.callParent([config]);
	},

	showDocs: function() {
		Ext.Ajax.request({
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
		}.bind(this));
	},

	showDocsForClassMethod: function(docClass, docMethod) {
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
		}.bind(this));
	},

	_showDocEntry: function(entryId) {
		var docsParentEl = this.getEl().getById('docsWindowParent', true);
		docsParentEl.querySelectorAll('.doc-contents, .members-section > .subsection > div').forEach(function(el) { el.hidden = true; });
		this.lastDocEntryMethod = entryId;
		if (entryId) {
			docsParentEl.querySelector('#'+entryId).hidden = false;
		} else {
			docsParentEl.querySelector('.doc-contents').hidden = false;
		}
		setTimeout(function() {
			this.body.scrollTo('top', 0, false);
		}.bind(this), 0);
	},

	_loadExtOutline: function(json) {
		this.lastDocEntryClass = undefined;
		this.lastDocEntryMethod = undefined;
		this.setTitle(this.localize('docs')+' '+this.localize('home'));
		this.show().anchorTo(Ext.getBody(), 'br-br');
		this.down('#restoreButton').hide();

		var html = '<p>'+this.localize('outlineIntro')+'</p><p>'+this.localize('outlineApi')+'</p>';

		var outlineTemplate = new Ext.XTemplate(
			'<ul>',
				'<tpl for="groups">',
					'<tpl for="classes">',
						'<li><a href="#!/api/{.}">{.}</a></li>',
					'</tpl>',
				'</tpl>',
			'</ul>'
		);
		html += outlineTemplate.apply(json);

		var docsParentEl = this.getEl().getById('docsWindowParent', true);
		docsParentEl.innerHTML = html;
		this._handleLinks(docsParentEl);
		this.body.scrollTo('top', 0, false);

		this.down('#overviewBtn').hide();
		this.down('#configsBtn').hide();
		this.down('#methodsBtn').hide();

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
		this.show().anchorTo(Ext.getBody(), 'br-br');
		this.down('#restoreButton').hide();

		var docsParentEl = this.getEl().getById('docsWindowParent', true);
		docsParentEl.innerHTML = json.html;
		this._handleLinks(docsParentEl);
		Ext.fly(docsParentEl).selectable();

		this._showDocEntry(docMethod);

		this.down('#overviewBtn').show();

		var configMembers = [];
		var methodMembers = [];
		json.members.forEach(function(member) {
			var menuItem = {
				xtype: 'menuitem',
				text: member.name,
				data: member.id,
				handler: function(item) {
					item.up('window')._showDocEntry(member.id);
				}
			}
			if (member.tagname === 'cfg') {
				configMembers.push(menuItem);
			} else if (member.tagname === 'method') {
				if (member.meta.static) {
					// TODO add icon to indicate it's static?
				}
				methodMembers.push(menuItem);
			}
		});

		if (configMembers.length > 0) {
			this.down('#configsBtn').show();
			var configsMenu = this.down('#docsConfigs');
			configsMenu.removeAll();
			configsMenu.add(configMembers);
		} else {
			this.down('#configsBtn').hide();
		}

		if (methodMembers.length > 0) {
			this.down('#methodsBtn').show();
			var methodsMenu = this.down('#docsMethods');
			methodsMenu.removeAll();
			methodsMenu.add(methodMembers);
		} else {
			this.down('#methodsBtn').hide();
		}

		if (this.getCollapsed()) {
			this.expand(false);
			setTimeout(function() {
				this.anchorTo(Ext.getBody(), 'br-br');
			}.bind(this), 10);
		}
	},

	_handleLinks: function(docsParentEl) {
		docsParentEl.addEventListener('click', function(e) {
			if (e.target.tagName.toLowerCase() === 'a') {
				e.preventDefault();
				e.stopPropagation();
				var link = e.target.getAttribute('href');
				var matches = link.match(/.*?\/api\/(\w+.\w+)-?(.*)?/);
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
			}
		}.bind(this));
	}
});