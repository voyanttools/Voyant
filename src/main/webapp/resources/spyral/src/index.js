import {Corpus, Table, Load, Util, Chart, Categories} from 'voyant';

import {Notebook} from './notebook';
import {Metadata} from './metadata';
import {Storage} from './storage';
import {show, showError} from './show';

Util.Storage = Storage;

Util.show = show;
Util.showError = showError;

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
