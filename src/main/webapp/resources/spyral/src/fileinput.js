/* global Voyant, Ext, Spyral */ 

import Util from 'voyant/src/util';

/**
 * A multiple file input that features drag n drop as well as temporary file storage in session storage.
 */
class FileInput {

	/**
	 * The FileInput constructor
	 * @param {HTMLElement} target The element to place the file input into
	 * @param {Function} resolve A function to call with the file(s)
	 * @param {Function} reject A function to call if the input is cancelled
	 */
	constructor(target, resolve, reject) {
		this.target = target;
		this.resolve = resolve;
		this.reject = reject;
		
		this.inputParent = undefined;
		this.fileInput = undefined;
		this.inputLabel = undefined;

		if (target.querySelector('[spyral-temp-doc]') !== null) {
			FileInput.getStoredFiles(target).then((storedFiles) => {
				if (storedFiles !== null) {
					resolve(storedFiles);
				}
			});
		} else {
			this._init();
		}
	}

	_init() {
		// construct the elements
		this.inputParent = document.createElement('div');
		this.inputParent.setAttribute('style', 'padding: 8px; background-color: #fff; outline: 2px dashed #999; text-align: center;');
		document.body.setAttribute('spyral-temp-doc', Util.id(32));

		const fileInputId = Util.id(16);
		this.fileInput = document.createElement('input');
		this.fileInput.style.setProperty('display', 'none');
		this.fileInput.setAttribute('type', 'file');
		this.fileInput.setAttribute('multiple', 'multiple');
		this.fileInput.setAttribute('id', fileInputId);
		this.fileInput.addEventListener('change', (event) => {
			this._showFiles(event.target.files);
			this._storeFiles(event.target.files);
		});
		this.inputParent.appendChild(this.fileInput);

		this.inputLabel = document.createElement('label');
		this.inputLabel.setAttribute('for', fileInputId);
		this.inputParent.appendChild(this.inputLabel);
		
		const labelText = document.createElement('strong');
		labelText.style.setProperty('cursor', 'pointer');
		labelText.appendChild(document.createTextNode('Choose a file'));
		this.inputLabel.appendChild(labelText);

		const dndSpot = document.createElement('span');
		dndSpot.appendChild(document.createTextNode(' or drag it here'));
		this.inputLabel.appendChild(dndSpot);

		const resetButton = document.createElement('span');
		resetButton.setAttribute('style', 'width: 16px; height: 16px; border: 1px solid #999; float: right; line-height: 12px; color: #666; cursor: pointer;');
		resetButton.setAttribute('title', 'Remove File Input');
		// listener to remove the element, which can be called from a saved notebook
		resetButton.setAttribute('onclick', 'if (typeof Voyant !== "undefined" && typeof Ext !== "undefined") { Ext.getCmp(this.parentElement.parentElement.getAttribute("id")).destroy(); } else { this.parentElement.remove(); }');
		// additional listener to reject the promise, if this input was created through run code
		resetButton.addEventListener('click', function() {
			this.reject();
		}.bind(this));
		resetButton.appendChild(document.createTextNode('x'));
		this.inputParent.appendChild(resetButton);

		['drag','dragstart','dragend','dragover','dragenter','dragleave','drop'].forEach((event) => {
			this.inputParent.addEventListener(event, (e) => {
				e.preventDefault();
				e.stopPropagation();
			});
		});
		['dragover','dragenter'].forEach((event) => {
			this.inputParent.addEventListener(event, () => {
				this.inputParent.style.setProperty('background-color', '#ccc');
			});
		});
		['dragend','dragleave','drop'].forEach((event) => {
			this.inputParent.addEventListener(event, () => {
				this.inputParent.style.removeProperty('background-color');
			});
		});
		this.inputParent.addEventListener('drop', (event) => {
			this._showFiles(event.dataTransfer.files);
			this._storeFiles(event.dataTransfer.files);
		});

		this.target.appendChild(this.inputParent);
		console.log('init done');
	}

	// update label with file info
	_showFiles(files) {
		if (files.length > 0) {
			this.inputLabel.textContent = files.length > 1 ? Array.from(files).map(f => f.name).join(', ') : files[0].name;

			// prevent file input from being re-used
			this.fileInput.remove();
		}
	}

	_storeFiles(fileList) {
		const files = Array.from(fileList);
		const readFiles = [];
		let currIndex = 0;

		if (files.length > 0) {
			const fr = new FileReader();
			fr.onload = (e) => {
				readFiles.push({filename: files[currIndex].name, type: files[currIndex].type, data: e.target.result});
				currIndex++;
				if (currIndex < files.length) {
					fr.readAsDataURL(files[currIndex]);
				} else {
					// store each file in its own session storage entry
					const childIds = readFiles.map((val) => {
						const childId = Util.id(32);
						window.sessionStorage.setItem('filename-'+childId, val.filename);
						window.sessionStorage.setItem('data-'+childId, val.data);
						window.sessionStorage.setItem('type-'+childId, val.type);
						return childId;
					});
					// store the ids for each file for later retrieval
					window.sessionStorage.setItem(document.body.getAttribute('spyral-temp-doc'), childIds.join());

					createServerStorage();
					if (typeof Voyant !== 'undefined' && typeof Voyant.util.ServerStorage !== 'undefined') {
						const serverStorage = new Voyant.util.ServerStorage();
						serverStorage.storeResource(document.body.getAttribute('spyral-temp-doc'), childIds.join());
						readFiles.map((val, index) => {
							const childId = childIds[index];
							serverStorage.storeResource(childId, {filename: val.filename, data: val.data, type: val.type});
							return childId;
						});
					}
					
					this.resolve(files);
				}
			};

			fr.readAsDataURL(files[currIndex]);
		} else {
			this.resolve(files);
		}
	}

	static async getStoredFiles(target) {
		if (target.hasAttribute('spyral-temp-doc') || target.querySelector('[spyral-temp-doc]') !== null) {
			const spyralTempDoc = target.getAttribute('spyral-temp-doc') || target.querySelector('[spyral-temp-doc]').getAttribute('spyral-temp-doc');
			// check local storage
			let fileIds = window.sessionStorage.getItem(spyralTempDoc);
			if (fileIds !== null) {
				let storedFiles = [];
				fileIds = fileIds.split(',');
				for (let i = 0; i < fileIds.length; i++) {
					const fileId = fileIds[i];
					const filename = window.sessionStorage.getItem('filename-'+fileId);
					const data = window.sessionStorage.getItem('data-'+fileId);
					const type = window.sessionStorage.getItem('type-'+fileId);
					const file = await FileInput.dataUrlToFile(data, filename, type);
					storedFiles.push(file);
				}
				return storedFiles;
			} else {
				// check server storage (if available)
				createServerStorage();
				if (typeof Voyant !== 'undefined' && typeof Voyant.util.ServerStorage !== 'undefined') {
					const serverStorage = new Voyant.util.ServerStorage();
					try {
						fileIds = await serverStorage.getStoredResource(spyralTempDoc);
						if (fileIds !== undefined) {
							let storedFiles = [];
							fileIds = fileIds.split(',');
							for (let i = 0; i < fileIds.length; i++) {
								const storedFile = await serverStorage.getStoredResource(fileIds[i]);
								const file = await FileInput.dataUrlToFile(storedFile.data, storedFile.filename, storedFile.type);
								storedFiles.push(file);
							}
							return storedFiles;
						} else {
							return null;
						}
					} catch(error) {
						return null;
					}
				}
			}
		}
		return null;
	}

	static async dataUrlToFile(dataUrl, fileName, mimeType) {
		const res = await fetch(dataUrl);
		const buf = await res.arrayBuffer();
		const file = new File([buf], fileName, {type:mimeType});
		return file;
	}

	static destroy(target) {
		if (typeof Voyant !== 'undefined' && typeof Ext !== 'undefined') {
			if (target.hasAttribute('spyral-temp-doc')) {
				target = target.parentElement;
			}
			Ext.getCmp(target.getAttribute('id')).destroy();
		} else {
			target.remove();
		}
	}

	/* currently unused
	static clearStoredFiles(target) {
		if (target.hasAttribute('spyral-temp-doc') || target.querySelector('[spyral-temp-doc]') !== null) {
			const spyralTempDoc = target.getAttribute('spyral-temp-doc') || target.querySelector('[spyral-temp-doc]').getAttribute('spyral-temp-doc');
			let fileIds = window.sessionStorage.getItem(spyralTempDoc);
			if (fileIds !== null) {
				fileIds.split(',').forEach((fileId) => {
					window.sessionStorage.removeItem('filename-'+fileId);
					window.sessionStorage.removeItem('data-'+fileId);
					window.sessionStorage.removeItem('type-'+fileId);
				})
				window.sessionStorage.removeItem(spyralTempDoc);
			}
			// TODO also clear server storage?
		}
	}
	*/


	/**
	 * Create a file input in the target element and returns a Promise that's resolved with the file(s) that is added to the input.
	 * The file is also temporarily stored in the session storage for successive retrieval.
	 * @param {HTMLElement} target The target element to append the input to
	 * @returns {Promise}
	 */
	static files() {
		function createTarget() {
			let target = document.createElement('div');
			target.setAttribute('class', 'target');
			document.body.appendChild(target);
			return target;
		}

		let target = createTarget();

		let hasPreExistingFiles = document.body.hasAttribute('spyral-temp-doc');


		let promise;
		if (hasPreExistingFiles) {
			console.log('pre-exist:',document.body.getAttribute('spyral-temp-doc'))
			promise = new Promise(async(resolve, reject) => {
				const storedFiles = await FileInput.getStoredFiles(document.body);
				if (storedFiles !== null) {
					resolve(storedFiles);
					return;
				} else {
					// files have been removed so re-create the input
					FileInput.destroy(target);
					target = createTarget();

					const deleteMsg = 'The previously added files have been deleted. You will need to add new files.';
					if (typeof Voyant !== 'undefined' && typeof Ext !== 'undefined') {
						Ext.ComponentQuery.query('notebook')[0].toastError({
							html: deleteMsg,
							anchor: 'tr'
						});
					} else {
						alert(deleteMsg);
					}
				}

				new FileInput(target, resolve, reject);
			});
		} else {
			promise = new Promise((resolve, reject) => {
				new FileInput(target, resolve, reject);
			});
		}
		
		// graft this function to avoid need for then
		promise.setNextBlockFromFiles = function() {
			var args = arguments;
			return this.then(files => {
				return Spyral.Notebook.setNextBlockFromFiles.apply(Load, [files].concat(Array.from(args)));
			});
		};
		
		promise.loadCorpusFromFiles = function() {
			var args = arguments;
			return this.then(files => {
				return Spyral.Corpus.load.apply(Spyral.Corpus, [files].concat(Array.from(args)));
			});
		};
		
		return promise;
	}

}

function createServerStorage() {
	if (typeof Voyant !== 'undefined' && typeof Ext !== 'undefined') {
		if (typeof Voyant.util.ServerStorage === 'undefined') {
			Ext.define('Voyant.util.ServerStorage', {
				extend: 'Voyant.util.Storage',
				getTromboneUrl: function() {
					return Voyant.application.getTromboneUrl();
				}
			});
		}
	}
}

export default FileInput;
