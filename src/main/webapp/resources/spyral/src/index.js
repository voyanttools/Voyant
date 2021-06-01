import {Corpus, Table, Load, Util, Chart, Categories} from 'voyant';

import Notebook from './notebook';
import Metadata from './metadata';

import Storage from './storage';
Util.Storage = Storage;

import {show, showError} from './show';
Util.show = show;
Util.showError = showError;

import JsonViewer from './jsonviewer';
Util.JsonViewer = JsonViewer;

import FileInput from './fileinput';
Load.files = FileInput.files;

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
