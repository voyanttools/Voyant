Ext.define('Voyant.data.model.Entity', {
	extend: 'Ext.data.Model',
	fields: [
		{name: 'term'},
		{name: 'normalized'},
		{name: 'type'},
		{name: 'docIndex', 'type': 'int'},
		{name: 'rawFreq', type: 'int'},
		{name: 'positions'},
		{name: 'offsets'},
		{name: 'distributions'}
	],
	getTerm: function() {return this.get('term');},
	getNormalized: function() {return this.get('normalized');},
	getType: function() {return this.get('type')},
	getDocIndex: function() {return this.get('docIndex')},
	getRawFreq: function() {return this.get('rawFreq')},
	getDistributions: function() {return this.get('distributions')},
	getPositions: function() {return this.get('positions')},
	getOffsets: function() {return this.get('offsets')}
});