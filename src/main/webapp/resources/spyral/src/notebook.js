/**
 * A helper for working with the Voyant Notebook app.
 * @memberof Spyral
 */
class Notebook {
	
	/**
	 * 
	 * @param {*} contents 
	 * @param {*} config
	 * @static 
	 */
	static show(contents, config) {
		var contents = Spyral.Util.toString(contents);
		if (contents instanceof Promise) {
			contents.then(c => Spyral.Util.show(c))
		} else {
			Spyral.Util.show(contents);
		}
	}
	/**
	 * Returns the first DIV element that's a child of the document body. If none exists then one will be created.
	 * @returns {element}
	 * @static
	 */
	static getTarget() {
		if (document.body.firstElementChild !== null && document.body.firstElementChild.nodeName === 'DIV') {
			return document.body.firstElementChild
		}
		const target = document.createElement("div");
		document.body.appendChild(target);
		return target;
	}

	/**
	 * Returns a new promise
	 * @returns {Promise} A promise
	 * @static
	 */
	static getPromise() {
		return new Promise();
	}

	/**
	 * Fetch and return the content of a notebook or a particular cell in a notebook.
	 * All code and data cells from the imported notebook will have their functions and variables available for use.
	 * One specific cell can be imported by providing the cellIndex, or by including the cellId in the URL, e.g. "learnspyral@gh/terms/#kwu44vrk".
	 * @param {string} url The URL of the notebook to import. Can either be the full URL or a shortened version, e.g. "learnspyral@gh/terms"
	 * @param {number} [cellIndex] The index of the cell to import
	 * @static
	 */
	static async import(url, cellIndex=undefined) {
		let notebookId = '';
		let cellId = undefined;

		if (url.indexOf('#') !== -1) {
			[url, cellId] = url.split('#');
		}
		const urlParts = url.match(/\/?[\w@-]+/g);
		if (urlParts !== null) {
			if (urlParts.length === 1) {
				notebookId = urlParts[0];
			} else {
				try {
					let notebookName = urlParts[urlParts.length-1].replace('/', '');
					let userId = urlParts[urlParts.length-2].replace('/', '');
					notebookId = userId+'_'+notebookName;
				} catch (e) {
					throw new Error('There was an error importing the notebook. Please ensure the URL is correct.');
				}
			}
		} else {
			notebookId = url;
		}

		let json;
		try {
			json = await Spyral.Load.trombone({
				tool: 'notebook.GitNotebookManager',
				action: 'load',
				id: notebookId,
				noCache: 1
			})
		} catch (e) {
			throw new Error('There was an error importing the notebook. Please ensure the URL is correct.');
		}

		const notebook = JSON.parse(json.notebook.data);

		function getCodeStringForDataCell(dataCellContent) {
			let code = '';
			switch(dataCellContent.mode) {
				case 'text':
					code = dataCellContent.dataName+'=`'+dataCellContent.input+'`';
					break;
				case 'json':
					code = dataCellContent.dataName+'= JSON.parse(`'+dataCellContent.input+'`)';
					break;
				case 'xml':
					code = dataCellContent.dataName+'= new DOMParser().parseFromString(`'+dataCellContent.input+'`, "application/xml")';
					break;
				case 'html':
					code = dataCellContent.dataName+'= new DOMParser().parseFromString(`'+dataCellContent.input+'`, "application/xml")';
					break;
			}
			return code;
		}
		
		const cells2import = notebook.cells.filter((cell, index) => {
			if (cell.type === 'code' || cell.type === 'data') {
				if (cellId === undefined && cellIndex === undefined) {
					return true;
				} else if (cell.cellId === cellId) {
					return true;
				} else if (cellIndex !== undefined && cellIndex === index+1) { // the index shown notebook counter is one-based
					return true;
				}
			}
		});

		const importedCode = cells2import.map((cell) => {
			if (cell.type === 'data') {
				return getCodeStringForDataCell(cell.content);
			} else {
				return cell.content.input;
			}
		})

		console.log('imported:', importedCode);

		async function __doRun(code) {
			// console.log('running:',code);
			try {
				const result = eval.call(window, code);
				const prResult = await Promise.resolve(result);
				if (importedCode.length > 0) {
					return __doRun(importedCode.shift());
				} else {
					return prResult;
				}
			} catch(e) {
				throw new Error('There was an error importing the notebook: '+e.message);
			}
		}

		if (importedCode.length > 0) {
			return __doRun(importedCode.shift());
		} else {
			throw new Error('There was an error importing the notebook. No code found for the specified '+ (cellId === undefined && cellIndex === undefined ? 'notebook' : 'cell')+'.');
		}
	}
}

export default Notebook
