Ext.define('Voyant.notebook.editor.CachedInput', {
	extend: 'Ext.container.Container',
	alias: 'widget.notebookcachedinput', 
	mixins: ['Voyant.util.Localization'],
	config: {
	},
	statics: {
		i18n: {
		}
	},

	constructor: function(config) {
		this.callParent(arguments);
	},

	/**
	 * Returns a Ext.Promise that resolves to a string of code, which, when run, assigns the cached value to the varName
	 * @param {String} varName The name of the variable to use for the cached value
	 */
	getCode: function(varName) {
		throw new Error('Subclass must override!');
	},

	getInput: function() {
		throw new Error('Subclass must override!');
	}
});