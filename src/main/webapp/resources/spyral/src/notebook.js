/**
 * A helper for working with the Voyant Notebook app.
 * @memberof Spyral
 */
class Notebook {
	/**
	 * Returns the previous block.
	 * @returns {string}
	 */
	// static getPreviousBlock(config) {
	// 	return Spyral.Notebook.getBlock(-1, config);
	// }
	/**
	 * Returns the next block.
	 * @returns {string}
	 */
	// static getNextBlock(config) {
	// 	return Spyral.Notebook.getBlock(1, config);
	// }
	/**
	 * Returns the current block.
	 * @param {number} [offset] If specified, returns the block whose position is offset from the current block
	 * @returns {string}
	 */
	// static getBlock() {
	// 	if (Voyant && Voyant.notebook) {
	// 		return Voyant.notebook.Notebook.currentNotebook.getBlock.apply(Voyant.notebook.Notebook.currentNotebook, arguments)
	// 	}
	// }
	
	// static setNextBlockFromFiles(files, mode, config) {
	// 	if (!mode) {
	// 		if (files[0].name.endsWith("html")) {mode="html"}
	// 		else if (files[0].name.endsWith("xml")) {mode="xml"}
	// 		else if (files[0].name.endsWith("json")) {mode="json"}
	// 		else {mode="text"}
	// 	}
	// 	return files[0].text().then(text => {
	// 		return Spyral.Notebook.setNextBlock(text, mode, config);
	// 	})
	// }

	// static setNextBlock(data, mode, config) {
	// 	return Spyral.Notebook.setBlock(data, 1, mode, config);
	// }
	
	// static setBlock(data, offset, mode, config) {
	// 	if (Voyant && Voyant.notebook) {
	// 		return Voyant.notebook.Notebook.currentNotebook.setBlock.apply(Voyant.notebook.Notebook.currentNotebook, arguments)
	// 	}
	// }
	
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
				tool: 'notebook.NotebookManager',
				action: 'load',
				id: notebookId,
				noCache: 1
			})
		} catch (e) {
			throw new Error('There was an error importing the notebook. Please ensure the URL and ID are correct.');
		}

		const notebook = json.notebook.data;
		const parser = new DOMParser();
		const htmlDoc = parser.parseFromString(notebook, 'text/html');
		
		let importedCode = [];
		let error = undefined;
		if (cellId !== undefined) {
			const cell = htmlDoc.querySelector('#'+cellId);
			if (cell !== null && cell.classList.contains('notebookcodeeditorwrapper')) {
				importedCode.push(cell.querySelector('pre').textContent);
			}
		} else {
			const allCells = htmlDoc.querySelectorAll('section.notebook-editor-wrapper')
			if (cellIndex !== undefined) {
				const cell = allCells[cellIndex];
				if (cell !== undefined) {
					importedCode.push(cell.querySelector('pre').textContent);
				}
			} else {
				allCells.forEach((cell, i) => {
					if (cell.classList.contains('notebookcodeeditorwrapper')) {
						importedCode.push(cell.querySelector('pre').textContent);
					}
				});
			}
		}

		// console.log('imported:', importedCode);

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
