Ext.define('Voyant.panel.NSSI', {
	extend: 'Ext.grid.Panel',
	mixins: ['Voyant.panel.Panel'],
	alias: 'widget.nssi',

	statics: {
		i18n: {
			title: 'NSSI Results',
			entity: 'Entity',
			lemma: 'Lemma',
			classification: 'Classification',
			document: 'Document',
			start: 'Start',
			end: 'End'
		}
	},
	config: {
	},

	constructor: function(config) {
		this.mixins['Voyant.util.Api'].constructor.apply(this, arguments);
		this.callParent(arguments);
		this.mixins['Voyant.panel.Panel'].constructor.apply(this, arguments);
	},

	initComponent: function() {
		var me = this;

		var store = Ext.create('Ext.data.JsonStore', {
			fields: [
				{name: 'entity'},
				{name: 'lemma'},
				{name: 'classification'},
				{name: 'docId'},
				{name: 'start', type: 'int'},
				{name: 'end', type: 'int'}
			]
		});

		Ext.apply(me, {
			title: this.localize('title'),
			emptyText: this.localize('emptyText'),
			store : store,
			columns: [{
				text: this.localize('document'),
				dataIndex: 'docIndex',
				width: 'autoSize',
				sortable: true
			},{
				text: this.localize('classification'),
				dataIndex: 'classification',
				flex: .5,
				sortable: true
			},{
				text: this.localize('entity'),
				dataIndex: 'entity',
				flex: 1,
				sortable: true
			},{
				text: this.localize('lemma'),
				dataIndex: 'lemma',
				flex: 1,
				sortable: true
			},{
				text: this.localize('start'),
				dataIndex: 'start',
				width: 'autoSize',
				sortable: false
			},{
				text: this.localize('end'),
				dataIndex: 'end',
				width: 'autoSize',
				sortable: false
			}]
		});

		me.on('loadedCorpus', function() {
			var me = this;
			if (this.isVisible()) {
				this.load().then(function(data) {
					var parsedData = [];
					data.documents.forEach(function(doc) {
						var docIndex = me.getCorpus().getDocument(doc.id).getIndex();
						doc.entities.forEach(function(entity) {
							parsedData.push(Object.assign({ docIndex: docIndex }, entity));
						});
					});
					store.loadRawData(parsedData);
				}, function(err) {
					console.log(err);
				})
			}
		}, me);

		me.callParent(arguments);
	},

	load: function(params, dfd) {
		dfd = dfd || new Ext.Deferred();
		var me = this;

		Ext.Ajax.request({
			url: Voyant.application.getTromboneUrl(),
			params: {
				corpus: this.getCorpus().getAliasOrId(),
				tool: 'corpus.NSSI',
				useCache: false,
				noCache: true
			},
			scope: this
		}).then(function(response) {
			var data = Ext.JSON.decode(response.responseText);
			if (data && data.nssi && data.nssi.progress) {
				new Voyant.widget.ProgressMonitor({
					progress: data.nssi.progress,
					delay: 10000,
					maxMillisSinceStart: 1000*60*60, // an hour (!)
					success: function() {
						console.log('NSSI progress monitor success');
						me.load.call(me, params, dfd);
					},
					failure: function(responseOrProgress) {
						Voyant.application.showResponseError(me.localize("failedToFetchGeonames"), responseOrProgress);
					},
					scope: me
				});
			}
			if (data && data.nssi && !data.nssi.progress) {
				dfd.resolve(data.nssi);
			}
		}, function(response) {
			Voyant.application.showResponseError(me.localize('failedToFetchGeonames'), response);
		});
		return dfd.promise;
	}
});

