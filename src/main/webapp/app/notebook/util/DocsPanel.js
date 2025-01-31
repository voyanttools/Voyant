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
				'<a href="/docs/Spyral.Corpus.html">LoadCorpus</a> - Get Started with LoadCorpus.<br>' +
				'<a href="https://voyant-tools.org/spyral/learnspyral@gh/Tutorials/">Tutorials</a> - Link to tutorial notebooks.<br>' +
				'<a href="/docs/Spyral.Corpus.html#method-tool">Tools Documentation</a> - Full Tools Documentation.<br>' +
				'<br>' +
				'Alternatively take a look at our detailed Documentation:<br>' +
				'<br>' +
				'<a href="/docs" rel="help">Full API Documentation</a> - Open up detailed API Documentation<br>' +
				'<a href="/docs/Tools.html" rel="help">Full Tool Documentation</a> - Open up detailed Tool Documentation<br><hr>',
			outlineApi: 'Here is a list of the Spyral classes that can be used in your notebook:',
			loadingDocs: 'Loading Docs'
		}
	},

	lastDocEntryClass: undefined,
	lastDocEntryMethod: undefined,

	typedefsTemplate: new Ext.XTemplate(
		'<div class="subsection">',
			'<h4 class="members-subtitle">{memberof}~{name}</h4>',
			'<tpl for="props">',
				'<div id="{[parent.memberof.replace(".","_")]}-{parent.name}-{name}" class="member">',
					'<div class="title">',
						'<a href="/docs/{[parent.memberof.replace(".","_")]}-{parent.name}-{name}" class="name">{name}</a>',
						' : <span class="pre">',
						'<tpl for="type">{.}{[xindex < xcount ? "|" : ""]}</tpl>',
						'</span>',
					'</div>',
					'<div class="description">',
						'<div class="long">{desc}</div>',
					'</div>',
				'</div>',
			'</tpl>',
		'</div>',
		{ disableFormats: true }
	),

	membersTemplate: new Ext.XTemplate(
		'<div id="{[values.memberof.replace(".","_")]}-{[values.static ? "static-" : ""]}{type}-{name}" class="member">',
			'<div class="title">',
				'<a href="/docs/{[values.memberof.replace(".","_")]}-{type}-{name}" class="name">{name}</a>',
				'<tpl if="type == \'method\'">',
				'( <span class="pre">',
				'<tpl for="params">{name}{[xindex < xcount ? ", " : ""]}</tpl>',
				'</span> )',
				'</tpl>',
				'<tpl if="type == \'member\'">',
					' : <span class="pre"><tpl for="props">',
						'<tpl for="type">{.}{[xindex < xcount ? "|" : ""]}</tpl>',
					'</tpl></span>',
				'</tpl>',
				'<tpl if="returns"> : <tpl for="returns.type">',
					'{[this.getTypeLink(values)]}{[xindex < xcount ? "|" : ""]}',
				'</tpl></tpl>',
				'<tpl if="static">',
					'<span class="signature"><span class="static">static</span></span>',
				'</tpl>',
			'</div>',
			'<div class="description">',
				'<div class="long">',
					'{desc}',
					'<tpl if="type == \'member\'">',
						'<tpl for="props">',
							'{desc}',
						'</tpl>',
					'</tpl>',
					'<tpl if="params">',
						'<h3 class="pa">Parameters</h3>',
						'<ul><tpl for="params">',
							'<li><span class="pre">{name}</span> : <tpl for="type">{[this.getTypeLink(values)]}{[xindex < xcount ? "|" : ""]}</tpl>',
							'<div class="sub-desc">{desc}</div></li>',
							'<tpl if="subparams">',
								'<div class="sub-desc"><ul>',
									'<tpl for="subparams">',
										'<li><span class="pre">{name}</span> : <tpl for="type">{[this.getTypeLink(values)]}{[xindex < xcount ? "|" : ""]}</tpl><div class="sub-desc">{desc}</div></li>',
									'</tpl>',
								'</ul></div>',
							'</tpl>',
						'</tpl></ul>',
					'</tpl>',
					'<tpl if="returns">',
						'<h3 class="pa">Returns</h3>',
						'<ul><tpl for="returns.type">',
							'<li><span class="pre">{[this.getTypeLink(values)]}</span><div class="sub-desc">{desc}</div></li>',
						'</tpl></ul>',
					'</tpl>',
					'<tpl if="examples">',
						'<h3 class="pa">Example{[values.examples.length > 1 ? "s" : ""]}</h3>',
						'<tpl for="examples">{.}</tpl>',
					'</tpl>',
				'</div>',
			'</div>',
		'</div>',
		{
			disableFormats: true,
			getTypeLink: function(type) {
				if (type.indexOf('Spyral') !== 0) return type;
				return '<a href="/docs/'+type+'">'+type+'</a>';
			}
		}
	),

	outlineTemplate: new Ext.XTemplate(
		'<ul>',
			'<tpl for="groups">',
				'<li>{namespace}</li>',
				'<ul>',
				'<tpl for="members">',
					'<li><a href="/docs/{.}">{.}</a></li>',
				'</tpl>',
				'</ul>',
			'</tpl>',
		'</ul>'
	),
	typedefsTOCTemplate: new Ext.XTemplate(
		'<div class="members">',
			'<tpl for=".">',
				'<tpl for="props">',
				'<div class="member">',
					'<a href="/docs/{[parent.memberof.replace(".","_")]}~{parent.name}-{name}">{parent.name}.{name}</a>',
				'</div>',
				'</tpl>',
			'</tpl>',
		'</div>'
	),
	membersTOCTemplate: new Ext.XTemplate(
		'<div class="members">',
			'<tpl for=".">',
				'<div class="member">',
					'<tpl if="static">',
						'<span class="static" title="static">s</span>',
					'</tpl>',
					'<a href="/docs/{[values.memberof.replace(".","_")]}#{[values.static ? "static-" : ""]}{type}-{name}">{name}</a>',
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
			},'->',{
				tooltip: this.localize('openFull'),
				itemId: 'openfullBtn',
				glyph: 'xf128@FontAwesome',
				handler: function(btn) {
					this.openFullDocumentation();
				}.bind(this)
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
		this.getLayout().getRenderTarget().mask(this.localize('loadingDocs'));

		var docsUrl = Voyant.application.getBaseUrlFull()+'resources/spyral/inline/';

		Ext.Promise.all([
			Ext.Ajax.request({
				url: docsUrl+'Spyral.json'
			}),
			Ext.Ajax.request({
				url: docsUrl+'Tools.json'
			})
		]).then(function(responses) {
			var jsons = responses.map(function(response) {
				return JSON.parse(response.responseText)
			});
			this._loadExtOutline({
				"name": "Spyral",
				"groups": jsons.map(function(json) {
					return {
						"namespace": json[0].match(/^\w+/)[0],
						"members": json
					}
				})
			});
			
			this.getLayout().setActiveItem(0);
			this.getLayout().getRenderTarget().unmask();
		}.bind(this), function() {
			this.getLayout().setActiveItem(0);
			this.getLayout().getRenderTarget().unmask();
		}.bind(this));
	},

	handleDocLink: function(link, rel) {
		console.log('handleDocLink', link, rel);
		if (rel) {
			if (rel === 'external') {
				window.open(link, '_external');
			} else if (link.indexOf('/docs') === 0) {
				window.open(Voyant.application.getBaseUrlFull()+link.substring(1), '_spyral_docs');
			} else {
				console.log('unrecognized link', link, rel);
				window.open(link, '_external');
			}
		} else {
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
				console.log('unrecognized link', link, rel);
				window.open(link, '_external');
			}
		}
	},

	openFullDocumentation: function() {
		var entryId = '';
		if (this.lastDocEntryClass) {
			entryId += '/'+this.lastDocEntryClass+'.html';
			if (this.lastDocEntryMethod) {
				entryId += '#'+this.lastDocEntryMethod.replace('static-','.').replace(/(method|member)-/,'').replace(/(~\w+)(-\w+)/,'$1');
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
		}.bind(this), function(error) {
			console.log(error);
		}.bind(this)).always(function() {
			this.getLayout().getRenderTarget().unmask();
		}.bind(this));
	},

	_showDocEntry: function(entryClass, entryMember) {
		console.log('showDocEntry', entryClass, entryMember);
		var docsParentEl = this.down('#main').getEl().dom;
		docsParentEl.querySelectorAll('.doc-contents, .members-section > .subsection > div').forEach(function(el) { el.hidden = true; });

		this.lastDocEntryMethod = entryMember;
		
		if (entryMember && entryMember.indexOf('~') !== -1 && entryMember.indexOf('-') === -1) {
			// typedef parent handling
			this.getLayout().setActiveItem(1);
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

		this._setHtmlForCard('main', this._doClassTemplate(json));
		this.down('#overviewBtn').show();

		this._setHtmlForCard('configs', this.typedefsTOCTemplate.apply(json.typedefs));
		this.down('#configsBtn').setVisible(json.typedefs && json.typedefs.length > 0);

		this._setHtmlForCard('methods', this.membersTOCTemplate.apply(json.members));
		this.down('#methodsBtn').setVisible(json.members && json.members.length > 0);

		this._showDocEntry(docClass, docMethod);
	},

	_setHtmlForCard: function(cardId, html) {
		this.down('#'+cardId).setHtml(html);
		var cardEl = this.down('#'+cardId).getEl().dom;
		Ext.fly(cardEl).selectable();
	},

	_doClassTemplate: function(json) {
		var me = this;
		var classTemplate = new Ext.XTemplate(
			'<div>',
				'<div class="doc-contents">{overview}</div>',
				'<div class="members">',
					'<div class="members-section">',
						'<h3 class="members-title icon-method">Type Definitions</h3>',
						'<tpl for="typedefs">',
							'{[this.convertTypedef(values)]}',
						'</tpl>',
					'</div>',
					'<div class="members-section">',
						'<h3 class="members-title icon-method">Members</h3>',
						'<div class="subsection">',
						'<tpl for="members">',
							'{[this.convertMember(values)]}',
						'</tpl>',
						'</div>',
					'</div>',
					'<div class="members-section">',
						'<h3 class="members-title icon-method">Methods</h3>',
						'<div class="subsection">',
						'<tpl for="members">',
							'{[this.convertMethod(values)]}',
						'</tpl>',
						'</div>',
					'</div>',
				'</div>',
			'</div>',
			{
				disableFormats: true,
				convertTypedef: function(json) {
					return me.typedefsTemplate.apply(json);
				},
				convertMember: function(json) {
					if (json.type === 'member') {
						return me.membersTemplate.apply(json);
					} else {
						return '';
					}
				},
				convertMethod: function(json) {
					if (json.type === 'method') {
						return me.membersTemplate.apply(json);
					} else {
						return '';
					}
				}
			}
		);

		return classTemplate.apply(json);
	}
});