function Sandboxer(event) {
	var me = this;

	me.result = {
		type: 'result', // 'result' or 'error' or 'command'
		name: undefined, // variable name associated with result value
		value: undefined, // result of running the code
		output: undefined, // html result of running the code
		height: undefined, // height of the this document
		variables: [] // variables created as a result of running the code
	};

	this.handleEvent = function() {
		try {
			var messageObj = event.data;
			if (messageObj.type === 'code') {
				this.runCode(messageObj.value, messageObj.variables);
			} else {
				if (messageObj.type === 'command') {
					me.result.type = 'command';
					switch (messageObj.command) {
						case 'update':
							if (messageObj.html !== undefined) {
								document.body.classList.value = '';
								document.body.innerHTML = messageObj.html;
							} else {
								me.showData(messageObj.dataName, messageObj.dataValue);
							}
							break;
						case 'clear':
							document.body.innerHTML = '';
							document.body.classList.value = '';
							break;
						case 'getContents':
							me.result.value = document.body.outerHTML;
							break;
						case 'init':
							break;
					}
					me.result.command = messageObj.command;
					me.result.height = document.firstElementChild.offsetHeight;
					event.source.postMessage(me.result, event.origin);
				}
			}
		} catch (err) {
			me.handleError(err);
		}
	}



	this.getSpyralClass = function(thing) {
		if (thing != undefined) {
			if (thing instanceof Spyral.Categories) {
				return 'Spyral.Categories'
			} else if (thing instanceof Spyral.Chart || thing instanceof Highcharts.Chart) {
				return 'Spyral.Chart'
			} else if (thing instanceof Spyral.Corpus) {
				return 'Spyral.Corpus'
			} else if (thing instanceof Spyral.Metadata) {
				return 'Spyral.Metadata'
			} else if (thing instanceof Spyral.Notebook) {
				return 'Spyral.Notebook'
			} else if (thing instanceof Spyral.Table) {
				return 'Spyral.Table'
			}
		}
		return false;
	}

	this.notifyHeightChange = function(e) {
		me.result.type = 'command';
		me.result.command = 'update';
		me.result.height = document.firstElementChild.offsetHeight;
		event.source.postMessage(me.result, event.origin);
	}


	this.var2Blob = function(thing) {
		var me = this;
		return new Promise(function(resolve, reject) {
			if (thing instanceof Blob) {
				resolve(thing);
			}

			var type = '';
			var blobData = '';
			if (Spyral.Util.isPromise(thing)) {
				Promise.resolve(thing).then(function(prResult) {
					resolve(me.var2Blob(prResult));
				}, function(err) {
					reject(err);
				});
			} else {
				var spyralClass = me.getSpyralClass(thing);
				if (spyralClass === 'Spyral.Chart') {
					type = 'application/json';
					blobData = JSON.stringify({userOptions: thing.userOptions, renderTo: thing.renderTo});
				} else if (Spyral.Util.isString(thing)) {
					type = 'text/string';
					blobData = thing;
				} else if (Spyral.Util.isObject(thing) || Spyral.Util.isArray(thing)) {
					// TODO deep / recursive analysis
					type = 'application/json';
					blobData = JSON.stringify(thing);
				} else if (Spyral.Util.isFunction(thing)) {
					type = 'application/javascript';
					blobData = thing.toString();
				} else if (Spyral.Util.isNode(thing)) {
					type = 'text/xml';
					blobData = new XMLSerializer().serializeToString(thing);
				}
				resolve(new Blob([blobData], {type: type}));
			}
		});
	}

	this.blob2Var = function(blob) {
		return new Promise(function(resolve, reject) {
			if (blob.type.search(/application\/(?!json|javascript)/) === 0) {
				// probably a non-browser file type
				resolve(blob);
			} else {
				var reader = new FileReader();
				reader.addEventListener('loadend', function(ev) {
					try {
						var td = new TextDecoder();
						var data = td.decode(ev.target.result);
						if (blob.type === 'text/string' || blob.type === 'text/plain') {
							// already taken care of
						} else if (blob.type === 'application/json') {
							data = JSON.parse(data);
						} else if (blob.type === 'application/javascript') {
							// it's a function and we'll eval it in loadVariable
						} else if (blob.type === 'text/xml' || blob.type === 'text/html') {
							data = new DOMParser().parseFromString(data, 'text/xml');
						} else {
							console.warn('unknown blob type: '+blob.type);
						}
						resolve(data);
					} catch (err) {
						reject(err);
					}
				});
				reader.readAsArrayBuffer(blob);
			}
		});
	}

	this.loadVariables = function(cvs) {
		if (cvs.length === 0) {
			return Promise.resolve();
		} else {
			var cv = cvs.shift();
			return me.loadVariable(cv).then(function() {
				return me.loadVariables(cvs);
			}, function(err) {
				return Promise.reject(err);
			});
		}
	}

	this.loadVariable = function(cv) {
		return new Promise(function(resolve, reject) {
			me.blob2Var(cv.value).then(function(data) {
				if (cv.isSpyralClass) {
					switch (cv.isSpyralClass) {
						case 'Spyral.Categories':
							window[cv.name] = new Spyral.Categories(data);
							resolve();
							break;
						case 'Spyral.Chart':
							window[cv.name] = Spyral.Chart.create(data.renderTo, data.userOptions);
							resolve();
							break;
						case 'Spyral.Corpus':
							return Spyral.Corpus.load(data.corpusid).then(function(corpus) {
								window[cv.name] = corpus;
								resolve();
							})
							break;
						case 'Spyral.Metadata':
							break;
						case 'Spyral.Notebook':
							break;
						case 'Spyral.Table':
							var table = new Spyral.Table();
							['_rows', '_headers', '_rowKeyColumnIndex'].forEach(function(prop) {
								if (data[prop] != undefined) {
									table[prop] = data[prop];
								}
							})
							window[cv.name] = table;
							resolve();
							break;
					}
					reject('no match for spyral class: '+cv.isSpyralClass);
				} else if (cv.value.type === 'application/javascript') {
					if (data.search(/^function\s+\w+\(/) !== -1) {
						// named function
						window.eval(data);
					} else {
						// anonymous function
						window.eval(cv.name+'='+data);
					}
					resolve();
				} else {
					window[cv.name] = data;
					resolve();
				}
			}, function(err) {
				reject(err);
			});
		});

	}

	this.getNewWindowKeys = function() {
		var newKeys = [];

		var currWindowKeys = Object.keys(window);
		for (var i = 0; i < currWindowKeys.length; i++) {
			var key = currWindowKeys[i];
			if (window['__defaultWindowKeys__'].indexOf(key) === -1) {
				newKeys.push(key);
			}
		}

		return newKeys;
	}



	this.runCode = function(code, priorVariables) {
		try {

			// collect all the declared variables
			var hasAssigner = false;
			var declaredVariables = [];
			var esr = esprima.parseScript(code, {}, function(node, metadata) {
				if (hasAssigner && node.type === 'Literal') {
					// hack to get variable name inside assign function
					declaredVariables.push(node.value);
					hasAssigner = false;
				} else if (node.type === 'VariableDeclaration') {
					if (node.declarations[0] && node.declarations[0].id && node.declarations[0].id.type === 'Identifier') {
						declaredVariables.push(node.declarations[0].id.name);
					}
				} else if (node.type === 'MemberExpression') {
					if (node.property.type === 'Identifier' && node.property.name === 'assign') {
						hasAssigner = true;
					}
				}
			});

			// remove variables from previous times this code has run
			this.getNewWindowKeys().forEach(function(newKey) {
				delete window[newKey];
			});

			this.loadVariables(priorVariables).then(function() {
				// actually run the code
				console.log('running code:', code);
				var result = undefined;
				var evalSuccess = true;
				try {
					result = eval.call(window, code);
				} catch (err) {
					evalSuccess = false;
					me.handleError(err);
				}
				// console.log('eval result', result);

				if (evalSuccess) {
					Promise.resolve(result).then(function(prResult) {
						// console.log('prResult', prResult);
						me.result.value = prResult;

						if (Spyral.Util.isNode(me.result.value)) {
							var error = Spyral.Util._getParserError(me.result.value, true);
							if (error) {
								me.handleError(error);
								return;
							}
						}

						var newKeys = me.getNewWindowKeys();
						var variables = [];
						var variableValues = [];
						for (var i = 0; i < newKeys.length; i++) {
							var varName = newKeys[i];
							var varValue = window[varName];//eval.call(window, varName);

							if (varValue === me.result.value) {
								me.result.name = varName;
							}

							variables.push({name: varName, isSpyralClass: me.getSpyralClass(varValue)});
							variableValues.push(me.var2Blob(varValue));
						}

						Promise.all(variableValues).then(function(prValues) {
							prValues.forEach(function(prValue, index) {
								variables[index].value = prValue;
							})
							
							me.result.variables = variables;
							me.resolveEvent();
						}, function(err) {
							me.handleError(err);
						})
					}, function(err) {
						me.handleError(err);
					})
				}
			}, function(err) {
				me.handleError(err);
			});
		} catch (err) {
			me.handleError(err);
		}
	}

	this.showData = function(dataName, dataValue) {
		document.body.innerHTML = '<div></div>';
		var container = document.body.firstElementChild;
		container.removeEventListener('spyral-dv-toggle', me.notifyHeightChange); // unnecessary? removed by clear command
		var dataViewer = new Spyral.Util.DataViewer({
			container: container,
			name: dataName,
			data: dataValue
		});
		container.addEventListener('spyral-dv-toggle', me.notifyHeightChange);
	}

	this.handleError = function(error) {
		me.result.type = 'error';
		me.result.value = 'exception: '+error.message;
		me.result.error = error;
		me.resolveEvent();
	}

	this.getErrorLocation = function(error) {
		if (error.lineNumber !== undefined) {
			var row = error.lineNumber;
			var column = error.column !== undefined ? error.column : error.columnNumber !== undefined ? error.columnNumber : 0;
			return [row, column];
		} else if (error.stack !== undefined) {
			var locationDetailsRegex = /<anonymous>:(\d+):(\d+)/;
			if (navigator.userAgent.indexOf('Chrome') === -1) { // very naive browser detection
				locationDetailsRegex = />\seval:(\d+):(\d+)/; // firefox style stack trace
			}
			var locationDetails = error.stack.match(locationDetailsRegex);
			if (locationDetails !== null) {
				var row = parseInt(locationDetails[1]);
				var column = parseInt(locationDetails[2]);
				return [row, column];
			}
		}
		return undefined;
	}

	this.resolveEvent = function() {
		try {
			if (me.result.type === 'error') {
				// always display error
				showError(me.result.error);
				// event listener to adjust height when showing error details
				document.body.querySelector('.error > pre > span:first-child').addEventListener('click', me.notifyHeightChange);

				// replace error since firefox can't clone it
				me.result.error = {
					message: me.result.error.toString(),
					location: me.getErrorLocation(me.result.error)
				};
			} else {
				if (document.body.firstChild === null) {
					// .tool() output check
					if (me.result.name === undefined && Spyral.Util.isString(me.result.value) && me.result.value.indexOf('<iframe') === 0) {
						// probably tool output
						document.body.innerHTML = me.result.value;
					} else {
						me.showData(me.result.name, me.result.value);
					}
				}
			}
			
			setTimeout(function() {
				me.result.height = document.firstElementChild.offsetHeight;
				me.result.output = document.body.innerHTML;
				try {
					event.source.postMessage(me.result, event.origin);
				} catch (err) {
					// most likely an error sending the result value so remove it
					me.result.value = '';
					event.source.postMessage(me.result, event.origin);
				}
			}, 25);
		} catch (err) {
			var result = { type: 'error', value: 'exception: '+err.message };
			event.source.postMessage(result, event.origin);
		}
	}
}

window.addEventListener('load', function(event) {
	// store the default window keys
	window['__defaultWindowKeys__'] = [];
	window['__defaultWindowKeys__'] = Object.keys(window);
});

window.addEventListener('message', function(event) {
	var sandboxer = new Sandboxer(event);
	sandboxer.handleEvent();
});