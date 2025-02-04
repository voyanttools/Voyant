Ext.define('Voyant.notebook.util.DocsPanel', {
	extend: 'Ext.panel.Panel',
	mixins: ['Voyant.util.Localization'],
	alias: 'widget.spyralDocsPanel',
	statics: {
		i18n: {
			home: 'Home',
			overview: 'Overview',
			configs: 'Configs',
			methods: 'Methods',
			openFull: 'Open Full Documentation',
			docs: 'Docs',
			splitView: 'Show Split View',
			outlineIntro: 'Welcome to the Spyral Docs. Here are some links to help you navigate.<br><br>' +
				'<a href="Spyral.Corpus.html">LoadCorpus</a> - Get Started with LoadCorpus.<br>' +
				'<a href="https://voyant-tools.org/spyral/learnspyral@gh/Tutorials/">Tutorials</a> - Link to tutorial notebooks.<br>' +
				'<a href="Spyral.html">Spyral Classes</a><br>' +
				'<a href="Tools.html">Tools Documentation</a><br>' +
				'<a href="global.html">Globals</a><br>' +
				'<br>' +
				'Alternatively take a look at our detailed Documentation:<br>' +
				'<br>' +
				'<a href="" rel="help">Full API Documentation</a> - Open up detailed API Documentation<br>',
			outlineApi: 'Here is a list of the Spyral classes that can be used in your notebook:',
			loadingDocs: 'Loading Docs'
		}
	},

	lastEntry: undefined,
	lastMember: undefined,
	
	inlineDocsUrl: undefined,
	fullDocsUrl: undefined,

	constructor: function(config) {
		this.inlineDocsUrl = Voyant.application.getBaseUrlFull()+'docs/inline/';
		this.fullDocsUrl = Voyant.application.getBaseUrlFull()+'docs/';

		this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);

		config = config || {};
		Ext.apply(config, {
			dockedItems: [{
				itemId: 'toolbar',
				xtype: 'toolbar',
				dock: 'top',
				items: [{
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
					text: this.localize('methods'),
					itemId: 'methodsBtn',
					glyph: 'xf1b2@FontAwesome',
					menu: {
						items: [],
						listeners: {
							click: function(menu, item) {
								var method = item.itemId;
								this._showDocEntry(this.lastEntry, method);
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
				boxready: function(win) {
					win.body.addListener('click', function(evt) {
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
	},

	showDocs: function() {
		this.lastEntry = undefined;
		this.lastMember = undefined;

		// this.getLayout().getRenderTarget().mask(this.localize('loadingDocs'));

		var html = '<p>'+this.localize('outlineIntro')+'</p>';
			
		this.up().setTitle(this.localize('docs')+' '+this.localize('home'));
		this.down('#overviewBtn').hide();
		this.down('#methodsBtn').hide();

		this._setHtmlForCard('main', html);

		this.body.scrollTo('top', 0, false);
		// this.getLayout().getRenderTarget().unmask();
	},

	handleDocLink: function(link, rel) {
		console.log('handleDocLink', link, rel);
		if (link.indexOf('http') === 0) {
			window.open(link, '_external');
		} else if (link.indexOf('tutorial') === 0 || rel === 'help') {
			window.open(this.fullDocsUrl+link, '_spyral_docs');
		} else {
			this.loadDocsEntry(link);
		}
	},

	openFullDocumentation: function() {
		if (this.lastEntry !== undefined) {
			var url = this.fullDocsUrl+this.lastEntry;
			if (this.lastMember !== undefined) {
				url += '#'+this.lastMember;
			}
			window.open(url, '_spyral_docs');
		}
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

		var isNamespace = dom.querySelector('h2 .ancestors') === null;

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

		docsParentEl.querySelectorAll('article > *').forEach(function(el) { el.hidden = !isNamespace; });

		var methods = Array.from(docsParentEl.querySelectorAll('article > dl.methods > dt > h4')).map(function(h4) {
			return h4.getAttribute('id');
		});

		// TODO handle constructor

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
				methodsMenu.add({text: method, itemId: method});
			});
			methodsBtn.show();
		} else {
			methodsBtn.hide();
		}
	},

	_showDocEntry: function(entryClass, entryMember) {
		console.log('showDocEntry', entryClass, entryMember);

		this.lastMember = entryMember;

		var docsParentEl = this.down('#main').getEl().dom;

		docsParentEl.querySelectorAll('article > *').forEach(function(el) { el.hidden = true; });

		if (entryMember === undefined) {
			// show overview
			docsParentEl.querySelector('header').hidden = false;
		} else if (entryMember === 'constructor') {
			docsParentEl.querySelector('article > .container-overview').hidden = false;
		} else {
			docsParentEl.querySelector('header').hidden = true;

			var entryEl = docsParentEl.querySelector('#'+entryMember.replace('.', '\\.')).parentElement;
			
			// hide all other members
			var entryParent = entryEl.closest('dl');
			entryParent.children.forEach(function(el) { el.hidden = true; });
			
			// show member
			entryEl.hidden = false;
			entryEl.nextElementSibling.hidden = false;

			// show member parent
			entryParent.hidden = false;
		}

		/*
		this.lastDocEntryMethod = entryMember;
		
		if (entryMember && entryMember.indexOf('~') !== -1 && entryMember.indexOf('-') === -1) {
			// typedef parent handling
			// this.getLayout().setActiveItem(1);
			console.log('typedef');
		} else {
			var entryId = undefined;
			if (entryClass && entryMember) {
				entryId = entryClass.replace('.','_')+'-'+entryMember.replace('~','');
			}
			if (entryId) {
				docsParentEl.querySelector('#'+entryId).hidden = false;
			} else {
				if (entryClass === undefined) entryClass = this.lastDocEntryClass;
				if (entryClass.indexOf('Tools') === 0) {
					// special Tools handling
					this.down('#overviewBtn').hide();
					this.down('#configsBtn').hide();
					this.down('#methodsBtn').hide();
					docsParentEl.querySelectorAll('.doc-contents, .members-section > .subsection > div').forEach(function(el) { el.hidden = false; });
				} else {
					docsParentEl.querySelector('.doc-contents').hidden = false;
				}
			}
			this.getLayout().setActiveItem(0);
			setTimeout(function() {
				this.down('#main').body.scrollTo('top', 0, false);
			}.bind(this), 0);
		}
			*/
	},

	_setHtmlForCard: function(cardId, html) {
		this.down('#'+cardId).setHtml(html);
		var cardEl = this.down('#'+cardId).getEl().dom;
		Ext.fly(cardEl).selectable();
	}
});