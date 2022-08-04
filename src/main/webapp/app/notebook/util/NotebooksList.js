Ext.define('Voyant.notebook.util.NotebooksList', {
	extend: 'Ext.view.View',
	alias: 'widget.notebookslist',

	constructor: function(config) {
		Ext.apply(config, {
			width: '100%',
			padding: 10,
			scrollable: 'vertical',
			store: Ext.create('Ext.data.JsonStore', {
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
					{name: 'catalogue', type: 'boolean'},
					{name: 'version'}
				]
			}),
			tpl: new Ext.XTemplate(
				'<tpl for=".">',
					'<div class="catalogue-notebook">',
						'<div class="id">{id}</div>',
						'<div class="title nowrap" title="{title}">',
						'<tpl if="catalogue"><i class="fa fa-th-list published" aria-hidden="true" title="In Catalogue"></i> </tpl>',
						'{title}</div>',
						'<div class="author nowrap"><i class="fa fa-user" aria-hidden="true"></i> {author}</div>',
						'<div class="description">{description}</div>',
						'<tpl if="keywords.length &gt; 0">',
							'<div class="keywords nowrap">',
								'<i class="fa fa-tags" aria-hidden="true"></i> ',
								'<tpl for="keywords">',
									'<span>{.}</span>',
								'</tpl>',
							'</div>',
						'</tpl>',
						'<div class="dates"><span class="date"><i class="fa fa-clock-o" aria-hidden="true"></i> {[Ext.Date.format(values.modified, "M j Y")]}</span></div>',
					'</div>',
				'</tpl>'
			),
			itemSelector: 'div.catalogue-notebook',
			overItemCls: 'catalogue-notebook-over',
			selectedItemCls: 'catalogue-notebook-selected'
		});

		this.callParent(arguments);
	}
});
