Ext.define('Voyant.notebook.util.DocsPanel', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.spyralDocsPanel',
	statics: {
		i18n: {
			home: 'Home',
			overview: 'Overview',
			classes: 'Classes',
			tools: 'Tools',
			globals: 'Globals',
			configs: 'Configs',
			methods: 'Methods',
			openFull: 'Open Full Documentation',
			docs: 'Docs',
			splitView: 'Show Split View',
			outlineIntro: '<h2>Spyral Documentation</h2><p>Welcome to the Spyral Docs. Here are some links to help you navigate.</p><ul>' +
				'<li><a href="Spyral.Corpus.html">LoadCorpus</a> - Get Started with LoadCorpus.</li>' +
				'<li><a href="https://voyant-tools.org/spyral/learnspyral@gh/Tutorials/">Tutorials</a> - Link to tutorial notebooks.</li>' +
				'<li><a href="Spyral.html">Spyral Classes</a></li>' +
				'<li><a href="Tools.html">Tools Documentation</a></li>' +
				'<li><a href="window.html">Globals</a></li>' +
				'</ul>' +
				'<p>Alternatively take a look at our detailed Documentation:</p>' +
				'<p><a href="Spyral.html" rel="help">Full API Documentation</a> - Open up detailed API Documentation</p>',
			outlineApi: 'Here is a list of the Spyral classes that can be used in your notebook:',
			loadingDocs: 'Loading Docs'
		}
	},

	lastEntry: undefined,
	lastMember: undefined,
	
	inlineDocsUrl: undefined,
	fullDocsUrl: undefined,

	constructor: function(config) {
		this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);

		config = config || {};
		Ext.apply(config, {
			dockedItems: [{
				itemId: 'toolbar',
				xtype: 'toolbar',
				dock: 'top',
				items: [{
					itemId: 'navBtn',
					glyph: 'xf0c9@FontAwesome',
					menu: {
						items: [{
							text: this.localize('home'),
							glyph: 'xf015@FontAwesome',
							handler: function(btn) {
								this.showDocs();
							}.bind(this)
						},{
							text: this.localize('classes'),
							itemId: 'classesMenu',
							glyph: 'xf02d@FontAwesome',
							menu: {
								items: [],
								listeners: {
									click: function(menu, item) {
										this.loadDocsEntry('Spyral.'+item.itemId+'.html');
									},
									scope: this
								}
							}
						},{
							text: this.localize('tools'),
							itemId: 'toolsMenu',
							glyph: 'xf0ad@FontAwesome',
							menu: {
								items: [],
								listeners: {
									click: function(menu, item) {
										this.loadDocsEntry('Tools.'+item.itemId+'.html');
									},
									scope: this
								}
							}
						},{
							text: this.localize('globals'),
							itemId: 'globalsMenu',
							glyph: 'xf0ad@FontAwesome',
							menu: {
								items: [],
								listeners: {
									click: function(menu, item) {
										this.loadDocsEntry('window.html#'+item.itemId);
									},
									scope: this
								}
							}
						}]
					}
				},{
					text: this.localize('overview'),
					itemId: 'overviewBtn',
					glyph: 'xf05a@FontAwesome',
					handler: function(btn) {
						this._showDocEntry();
					}.bind(this)
				},{
					text: this.localize('methods'),
					itemId: 'methodsBtn',
					glyph: 'xf1b2@FontAwesome',
					menu: {
						items: [],
						listeners: {
							click: function(menu, item) {
								if (item) {
									var method = item.itemId.replace(/^_/, '');
									this._showDocEntry(this.lastEntry, method);
								}
							},
							scope: this
						}
					}
				},{
					text: this.localize('configs'),
					itemId: 'configsBtn',
					glyph: 'xf013@FontAwesome',
					width: 100,
					menu: {
						items: [],
						listeners: {
							click: function(menu, item) {
								if (item) {
									this._showDocEntry(this.lastEntry, item.itemId);
								}
							},
							scope: this
						}
					}
				},'->',{
					tooltip: this.localize('openFull'),
					itemId: 'openfullBtn',
					glyph: 'xf128@FontAwesome',
					handler: function(btn) {
						this.openFullDocumentation();
					}.bind(this)
				}]
			}],
			layout: 'fit',
			items: [{
				itemId: 'main',
				cls: 'docsWindowContent',
				scrollable: 'y',
				html: ''
			}],
			listeners: {
				boxready: function(cmp) {
					cmp.body.addListener('click', function(evt) {
						if (evt.target.tagName.toLowerCase() === 'a') {
							evt.preventDefault();
							evt.stopPropagation();
							var link = evt.target.getAttribute('href');
							var rel = evt.target.getAttribute('rel');
							this.handleDocLink(link, rel);
						}
					}, this);
				},
				scope: this
			}
		});

		this.callParent([config]);

		this.inlineDocsUrl = Voyant.application.getBaseUrlFull()+'docs/inline/';
		this.fullDocsUrl = Voyant.application.getBaseUrlFull()+'docs/';

		this._populateNavMenu('classesMenu', 'Spyral.html');
		this._populateNavMenu('toolsMenu', 'Tools.html');
		this._populateNavMenu('globalsMenu', 'window.html');
	},

	showDocs: function() {
		this.lastEntry = undefined;
		this.lastMember = undefined;

		this.up().setTitle(this.localize('docs')+' '+this.localize('home'));
		this.down('#overviewBtn').hide();
		this.down('#methodsBtn').hide();
		this.down('#configsBtn').hide();

		var html = '<p>'+this.localize('outlineIntro')+'</p>';
		this._setHtmlForCard('main', html);

		this.up().show().expand();

		this.body.scrollTo('top', 0, false);
	},

	handleDocLink: function(link, rel) {
		console.log('handleDocLink', link, rel);
		link = link.replace(/^https:\/\/voyant-tools.org\//, '');
		if (link.indexOf('spyral') === 0) {
			var notebookId = link.replace(/^spyral\//, '').replace(/\/$/, '').replace(/\//, '_');
			var parent = this.findParentByType('notebook');
			parent.fireEvent('notebookSelected', parent, notebookId, null);
		} else if (link.indexOf('http') === 0) {
			window.open(link, '_external');
		} else if (link.indexOf('tutorial') === 0 || rel === 'help') {
			window.open(this.fullDocsUrl+link, '_spyral_docs');
		} else {
			this.up().show().expand();
			this.loadDocsEntry(link);
		}
	},

	openFullDocumentation: function() {
		var url = this.fullDocsUrl;
		if (this.lastEntry !== undefined) {
			url += this.lastEntry;
		}
		if (this.lastMember !== undefined) {
			url += '#'+this.lastMember;
		}
		window.open(url, '_spyral_docs');
	},

	loadDocsEntry: function(entry) {
		var parts = entry.split('#');
		this.lastEntry = parts[0];
		if (parts[1]) {
			this.lastMember = parts[1];
		} else {
			this.lastMember = undefined;
		}

		console.log('loadDocsEntry', entry);
		this.getLayout().getRenderTarget().mask(this.localize('loadingDocs'));

		Ext.Ajax.request({
			url: this.inlineDocsUrl+this.lastEntry
		}).then(function(response) {
			this.getLayout().getRenderTarget().unmask();
			this._processDocEntry(response.responseText);
			if (this.lastMember) {
				this._showDocEntry(this.lastEntry, this.lastMember);
			}
		}.bind(this), function(error) {
			this.lastEntry = undefined;
			this.getLayout().getRenderTarget().unmask();
			console.log(error);
		}.bind(this));
	},

	_processDocEntry: function(html) {
		var parser = new DOMParser();
		var dom = parser.parseFromString(html, 'text/html');

		var isNamespace = dom.querySelector('header h2 .ancestors') === null;
		
		var isToolsEntry = false;
		if (!isNamespace) {
			isToolsEntry = dom.querySelector('header h2 .ancestors a').textContent === 'Tools';
		}

		var title = '';
		if (isNamespace) {
			title = dom.querySelector('h2').textContent;
		} else {
			title = dom.querySelector('h2 .ancestors').textContent + dom.querySelector('h2 .ancestors').nextSibling.textContent;
		}
		this.up().setTitle(this.localize('docs')+': '+title);

		this._setHtmlForCard('main', html);
		this.down('#overviewBtn').show();

		var docsParentEl = this.down('#main').getEl().dom;

		docsParentEl.querySelectorAll('article > *').forEach(function(el) { el.hidden = !isNamespace && !isToolsEntry; });

		// populate methods
		var methods = Array.from(docsParentEl.querySelectorAll('article > dl.methods > dt > h4')).map(function(h4) {
			return h4.getAttribute('id');
		});
		if (!isNamespace && !isToolsEntry && docsParentEl.querySelector('article .container-overview') !== null) {
			methods.unshift('constructor');
		}
		var methodsBtn = this.down('#methodsBtn');
		if (methods.length > 0) {
			var methodsMenu = methodsBtn.getMenu();
			var toRemove = [];
			methodsMenu.items.eachKey(function(key) {
				toRemove.push(key);
			});
			toRemove.forEach(function(key) {
				methodsMenu.remove(key);
			});
			methods.forEach(function(method) {
				var text = method.replace(/^\./, '<span class="green icon">static</span> '); // static methods
				text = text.replace(/^_/, '');
				methodsMenu.add({text: text, itemId: '_'+method, margin: '0 0 0 -20px'}); // prepend _ because some methods are reserved (e.g. toString)
			});
			methodsBtn.show();
		} else {
			methodsBtn.hide();
		}

		// populate configs
		var configs = Array.from(docsParentEl.querySelectorAll('article > dl.typedefs > dt > h4')).map(function(h4) {
			return h4.getAttribute('id');
		});
		var configsBtn = this.down('#configsBtn');
		if (configs.length > 0) {
			var configsMenu = configsBtn.getMenu();
			var toRemove = [];
			configsMenu.items.eachKey(function(key) {
				toRemove.push(key);
			});
			toRemove.forEach(function(key) {
				configsMenu.remove(key);
			});
			configs.forEach(function(config) {
				configsMenu.add({text: config, itemId: config, margin: '0 0 0 -20px'});
			});
			configsBtn.show();
		} else {
			configsBtn.hide();
		}
	},

	_showDocEntry: function(entryClass, entryMember) {
		console.log('showDocEntry', entryClass, entryMember);

		this.lastMember = entryMember;

		var docsParentEl = this.down('#main').getEl().dom;

		var isNamespace = docsParentEl.querySelector('header h2 .ancestors') === null;

		docsParentEl.querySelectorAll('article > *').forEach(function(el) { el.hidden = !isNamespace; });

		if (entryMember === undefined) {
			// show overview
			docsParentEl.querySelector('header').hidden = false;
		} else if (entryMember === 'constructor') {
			docsParentEl.querySelector('header').hidden = true;
			docsParentEl.querySelector('article > .container-overview').hidden = false;
		} else {
			docsParentEl.querySelector('header').hidden = true;

			var entryEl = docsParentEl.querySelector('#'+entryMember.replace('.', '\\.').replace('~', '\\~')).parentElement;
			
			// hide all other members
			var entryParent = entryEl.closest('dl');
			entryParent.children.forEach(function(el) { el.hidden = true; });
			
			// show member
			entryEl.hidden = false;
			entryEl.nextElementSibling.hidden = false;

			// show member parent
			entryParent.hidden = false;
		}

		this.body.scrollTo('top', 0, false);
	},

	_setHtmlForCard: function(cardId, html) {
		this.down('#'+cardId).setHtml(html);
		var cardEl = this.down('#'+cardId).getEl().dom;
		Ext.fly(cardEl).selectable();
	},

	_populateNavMenu: function(menuId, file) {
		Ext.Ajax.request({
			url: this.inlineDocsUrl+file
		}).then(function(response) {
			var parser = new DOMParser();
			var dom = parser.parseFromString(response.responseText, 'text/html');
			var dl = dom.querySelector('article > dl:first-of-type');
			
			var menuItems = [];
			if (dl.className.indexOf('methods') !== -1) {
				menuItems = Array.from(dl.querySelectorAll('h4')).map(function(h4) {
					var method = h4.id.replace(/^\./, '<span class="green icon">static</span> ');
					return {text: method, itemId: h4.id, margin: '0 0 0 -20px'};
				});
			} else {
				menuItems = Array.from(dl.querySelectorAll('a')).map(function(link) {
					return {text: link.textContent, itemId: link.textContent, margin: '0 0 0 -20px'};
				});
			}
			this.down('#'+menuId).getMenu().add(menuItems);
		}.bind(this));
	}
});