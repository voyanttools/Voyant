/**
 * A helper for working with the Voyant Notebook app.
 * @memberof Spyral
 */
class Notebook {
	
	/**
	 * 
	 * @param {*} contents 
	 * @param {*} config 
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
	 * Returns the target element
	 * @returns {element}
	 */
	static getTarget() {
		const target = document.createElement("div");
		document.body.appendChild(target);
		return target;
	}

	/**
	 * Returns a new promise
	 * @returns {Promise} A promise
	 */
	static getPromise() {
		return new Promise();
	}

	/**
	 * Fetch and return the content of a notebook or a particular cell in a notebook
	 * @param {string} url The URL of the notebook to import
	 * @param {number} [cellIndex] The index of the cell to import
	 */
	static async import(url, cellIndex=undefined) {
		const urlHasHash = url.indexOf('#') !== -1;
		const isAbsoluteUrl = url.indexOf('http') === 0;

		let notebookId = '';
		let cellId = undefined;
		if (isAbsoluteUrl) {
			const urlParts = url.match(/\/[\w-]+/g);
			if (urlParts !== null) {
				notebookId = urlParts[urlParts.length-1].replace('/', '');
			} else {
				return;
			}
			if (urlHasHash) {
				cellId = url.split('#')[1];
			}
		} else {
			if (urlHasHash) {
				[notebookId, cellId] = url.split('#');
			} else {
				notebookId = url;
			}
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
			throw new Error('There was an error importing the notebook. Please ensure the URL and ID are correct.');
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
