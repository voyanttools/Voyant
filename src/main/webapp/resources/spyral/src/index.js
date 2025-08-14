import {Corpus, Table, Load, Util, Chart, Categories, Analysis} from 'voyant';

import Notebook from './notebook';
import Metadata from './metadata';

import Storage from './storage';
Util.Storage = Storage;

import {show, showError} from './show';
Util.show = show;
Util.showError = showError;

import DataViewer from './dataviewer';
Util.DataViewer = DataViewer;

/**
 * These are the classes specific to Spyral.
 * @namespace Spyral
 */
const Spyral = {
	Notebook,
	Util,
	Metadata,
	Corpus,
	Table,
	Load,
	Chart,
	Categories,
	Analysis
};

/**
 * Assign the result of a Promise to a new or existing global variable.
 * @memberof Promise
 * @param {String} variableName The name of the variable to which the result of the Promise should be assigned.
 * @returns {*} The result of the Promise
 */
Promise.prototype.assign = function(variableName) {
	return this.then(promiseResult => {window[variableName] = promiseResult; return promiseResult;});
}

/**
 * These are helper methods that get added to global window variable.
 * @namespace window
 */
window;

/**
 * @borrows Spyral.Corpus.load as loadCorpus
 * @memberof window
 * @method loadCorpus
 * @static
 */
window.loadCorpus = Spyral.Corpus.load;
/**
 * @borrows Spyral.Table.create as createTable
 * @memberof window
 * @method createTable
 * @static
 */
window.createTable = Spyral.Table.create;

/**
 * @borrows Spyral.Util.show as show
 * @memberof window
 * @method show
 * @static
 */
window.show = Spyral.Util.show;
/**
 * @borrows Spyral.Util.showError as showError
 * @memberof window
 * @method showError
 * @static
 */
window.showError = Spyral.Util.showError;


export default Spyral;
