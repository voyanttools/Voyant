import {Corpus, Table, Load, Util, Chart, Categories} from 'voyant';

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
	Categories
};

export default Spyral;
