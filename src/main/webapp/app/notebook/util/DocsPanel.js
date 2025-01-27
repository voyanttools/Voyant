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

			docs: 'Docs',
			splitView: 'Show Split View',
			outlineIntro: 'Welcome to the Spyral Docs. Here are some links to help you navigate.<br><br>' +
				'<a href="/docs/Spyral.Corpus.html">LoadCorpus</a> - Get Started with LoadCorpus.<br>' +
				'<a href="https://voyant-tools.org/spyral/learnspyral@gh/Tutorials/">Tutorials</a> - Link to tutorial notebooks.<br>' +
				'<a href="/docs/Spyral.Corpus.html#method-tool">Tools Documentation</a> - Full Tools Documentation.<br>' +
				'<br>' +
				'Alternativly take a look at our detailed Documentation:<br>' +
				'<br>' +
				'<a href="/docs">Full API Documentation</a> - Open up detailed API Documentation<br>' +
				'<a href="/docs/tools">Full Tool Documentation</a> - Open up detailed Tool Documentation<br><hr>',
			outlineApi: 'Here is a list of the Spyral classes that can be used in your notebook:',
			loadingDocs: 'Loading Docs'
		}
	},

	lastDocEntryClass: undefined,
	lastDocEntryMethod: undefined,

	classTemplate: new Ext.XTemplate(
		'<div>',
			'<div class="doc-contents">{overview}</div>',
			'<div class="members">',
			'<div class="members-section">',
				'<h3 class="members-title icon-method">Type Definitions</h3>',
				'<tpl for="typedefs">',
				'<div class="subsection">',
					'<h4 class="members-subtitle">{memberof}~{name}</h4>',
					'<tpl for="props">',
						'<div id="{[parent.memberof.replace(".","_")]}-{parent.name}-{name}" class="member">',
							'<div class="title">',
								'<a href="/docs/{[parent.memberof.replace(".","_")]}-{parent.name}-{name}" class="name">{name}</a>',
								'( <span class="pre">',
								'<tpl for="type">{.}{[xindex < xcount ? "|" : ""]}</tpl>',
								'</span> )',
							'</div>',
							'<div class="description">',
								'<div class="long">{desc}</div>',
							'</div>',
						'</div>',
					'</tpl>',
				'</div>',
				'</tpl>',
			'</div>',
			'<div class="members-section">',
				'<h3 class="members-title icon-method">Methods</h3>',
				'<div class="subsection">',
				'<tpl for="members">',
					'<div id="{[values.memberof.replace(".","_")]}-{type}-{name}" class="member">',
						'<div class="title">',
							'<a href="/docs/{[values.memberof.replace(".","_")]}-{type}-{name}" class="name">{name}</a>',
							'( <span class="pre">',
							'<tpl for="params">{name}{[xindex < xcount ? ", " : ""]}</tpl>',
							'</span> )',
							'<tpl if="returns">',
								' : {returns.type}',
							'</tpl>',
							'<tpl if="static">',
								'<span class="signature"><span class="static">static</span></span>',
							'</tpl>',
						'</div>',
						'<div class="description">',
							'<div class="long">',
								'{desc}',
								'<tpl if="params">',
									'<h3 class="pa">Parameters</h3>',
									'<ul><tpl for="params">',
										'<li><span class="pre">{name}</span> : {type} <div class="sub-desc">{desc}</div></li>',
									'</tpl></ul>',
								'</tpl>',
								'<tpl if="returns">',
									'<h3 class="pa">Returns</h3>',
									'<ul><tpl for="returns.type">',
										'<li><span class="pre">{.}</span><div class="sub-desc">{desc}</div></li>',
									'</tpl></ul>',
								'</tpl>',
							'</div>',
						'</div>',
					'</div>',
				'</tpl>',
				'</div>',
			'</div>',
			'</div>',
		'</div>'
	),

	outlineTemplate: new Ext.XTemplate(
		'<ul>',
			'<tpl for="groups">',
				'<tpl for="classes">',
					'<li><a href="/docs/{.}">{.}</a></li>',
				'</tpl>',
			'</tpl>',
		'</ul>'
	),
	typedefsTemplate: new Ext.XTemplate(
		'<div class="members">',
			'<tpl for=".">',
				'<tpl for="props">',
				'<div class="member">',
					'<a href="/docs/{[parent.memberof.replace(".","_")]}-{parent.name}-{name}">{parent.name}.{name}</a>',
				'</div>',
				'</tpl>',
			'</tpl>',
		'</div>'
	),
	membersTemplate: new Ext.XTemplate(
		'<div class="members">',
			'<tpl for=".">',
				'<div class="member">',
					'<tpl if="static">',
						'<span class="static" title="static">s</span>',
					'</tpl>',
					'<a href="/docs/{[values.memberof.replace(".","_")]}#{type}-{name}">{name}</a>',
				'</div>',
			'</tpl>',
		'</div>'
	),

	constructor: function(config) {
		this.mixins['Voyant.util.Localization'].constructor.apply(this, arguments);

		config = config || {};
		Ext.apply(config, {
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
					btn.up('panel').getLayout().setActiveItem(1);
				}
			},{
				text: this.localize('methods'),
				itemId: 'methodsBtn',
				glyph: 'xf1b2@FontAwesome',
				handler: function(btn) {
					btn.up('panel').getLayout().setActiveItem(2);
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
				scope: this
			}
		});

		this.callParent([config]);
	},

	showDocs: function() {
		this.getLayout().getRenderTarget().mask(this.localize('loadingDocs'));

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
		});
		
		this.getLayout().setActiveItem(0);
		this.getLayout().getRenderTarget().unmask();
	},

	handleDocLink: function(link) {
		console.log('handleDocLink', link);
		var matches = link.match(/.*?\/docs\/([\w.]+)[#-]?(.*)?/);
		console.log(matches);
		if (matches) {
			var linkClass = matches[1].replace('_', '.').replace('.html', '');
			var linkMethod = matches[2];
			if (linkClass !== this.lastDocEntryClass) {
				this.showDocsForClassMethod(linkClass, linkMethod);
			} else {
				this._showDocEntry(linkClass, linkMethod);
			}
		} else {
			if (link.indexOf('#!') === 0) {
				window.open(Voyant.application.getBaseUrlFull()+'docs/'+link, '_spyral_docs');
			} else {
				window.open(link, '_external');
			}
		}
	},

	openFullDocumentation: function() {
		var entryId = '';
		if (this.lastDocEntryClass) {
			entryId += '/'+this.lastDocEntryClass+'.html';
			if (this.lastDocEntryMethod) {
				entryId += '#'+this.lastDocEntryMethod;
			}
		}
		window.open(Voyant.application.getBaseUrlFull()+'docs'+entryId, '_spyral_docs');
	},

	showDocsForClassMethod: function(docClass, docMethod) {
		console.log('showDocsForClassMethod', docClass, docMethod);
		this.getLayout().getRenderTarget().mask(this.localize('loadingDocs'));

		var docsUrl = Voyant.application.getBaseUrlFull()+'resources/spyral/inline/';

		Ext.Ajax.request({
			url: docsUrl+docClass+'.json'
		}).then(function(response) {
			var jsonText = response.responseText;
			var json;
			try {
				json = JSON.parse(jsonText);
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

	_showDocEntry: function(entryClass, entryMember) {
		console.log('showDocEntry', entryClass, entryMember);
		var docsParentEl = this.down('#main').getEl().dom;
		docsParentEl.querySelectorAll('.doc-contents, .members-section > .subsection > div').forEach(function(el) { el.hidden = true; });

		this.lastDocEntryMethod = entryMember;
		
		var entryId = undefined;
		if (entryClass && entryMember) {
			entryId = entryClass.replace('.','_')+'-'+entryMember;
		}
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

		this.up().setTitle(this.localize('docs')+' '+this.localize('home'));
		this.down('#overviewBtn').hide();
		this.down('#configsBtn').hide();
		this.down('#methodsBtn').hide();

		var html = '<p>'+this.localize('outlineIntro')+'</p><p>'+this.localize('outlineApi')+'</p>';
		html += this.outlineTemplate.apply(json);

		this._setHtmlForCard('main', html);

		this.body.scrollTo('top', 0, false);
	},

	_loadExtDocs: function(json, docClass, docMethod) {
		this.lastDocEntryClass = docClass;
		this.lastDocEntryMethod = docMethod;

		this.up().setTitle(this.localize('docs')+': '+docClass);

		this._setHtmlForCard('main', this.classTemplate.apply(json));

		this._showDocEntry(docClass, docMethod);

		this.down('#overviewBtn').show();		

		this._setHtmlForCard('configs', this.typedefsTemplate.apply(json.typedefs));
		this.down('#configsBtn').setVisible(json.typedefs && json.typedefs.length > 0);

		this._setHtmlForCard('methods', this.membersTemplate.apply(json.members));
		this.down('#methodsBtn').setVisible(json.members && json.members.length > 0);
	},

	_setHtmlForCard: function(cardId, html) {
		this.down('#'+cardId).setHtml(html);
		var cardEl = this.down('#'+cardId).getEl().dom;
		Ext.fly(cardEl).selectable();
	}
});