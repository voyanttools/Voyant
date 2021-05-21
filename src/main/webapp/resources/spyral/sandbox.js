window.Corpus = Spyral.Corpus;
window.Table = Spyral.Table;

window.loadCorpus = function() {
	return Spyral.Corpus.load.apply(Spyral.Corpus.load, arguments)
}

window.createTable = function() {
	return Spyral.Table.create.apply(Spyral.Table, arguments)
}

window.show = Spyral.Util.show;
window.showError = Spyral.Util.showError;

function Sandboxer(event) {
	var me = this;

	me.result = {
		type: 'result',
		value: undefined,
		height: undefined,
		variables: []
	};

	me.evalSuccess = true;

	this.handleEvent = function() {
		try {
			var messageObj = JSON.parse(event.data);
			if (messageObj.type === 'code') {
				this.runCode(messageObj.value, messageObj.variables);
			} else {
				if (messageObj.type === 'command') {
					me.result.type = 'command';
					switch (messageObj.command) {
						case 'update':
							document.body.innerHTML = messageObj.value;
							break;
						case 'clear':
							document.body.innerHTML = '';
							break;
						case 'getContents':
							me.result.value = document.body.outerHTML;
							break;
						case 'init':
							break;
					}
					me.result.command = messageObj.command;
					me.result.height = document.firstElementChild.offsetHeight;
					event.source.postMessage(JSON.stringify(me.result), event.origin);
				}
			}
		} catch (err) {
			me.handleError(err);
		}
	}



	this.isPromiseLike = function(thing) {
		return thing != undefined && thing.then !== undefined && thing.catch !== undefined && thing.finally !== undefined;
	}

	this.isFunction = function(thing) {
		return thing && (Object.prototype.toString.call(thing) === "[object Function]" || "function" === typeof thing || thing instanceof Function);
	}

	this.getSpyralClass = function(thing) {
		if (thing != undefined) {
			if (thing instanceof Spyral.Categories) {
				return 'Spyral.Categories'
			} else if (thing instanceof Spyral.Chart) {
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

	this.isElement = function(thing) {
		return thing instanceof Element || thing instanceof HTMLDocument;  
	}



	this.loadComplexVariables = function(cvs) {
		if (cvs.length === 0) {
			return Promise.resolve();
		} else {
			var cv = cvs.shift();
			return me.loadComplexVariable(cv).then(function() {
				return me.loadComplexVariables(cvs);
			});
		}
	}

	this.loadComplexVariable = function(cv) {
		return new Promise(function(resolve, reject) {
			if (cv.isSpyralClass) {
				switch (cv.isSpyralClass) {
					case 'Spyral.Categories':
						break;
					case 'Spyral.Chart':
						break;
					case 'Spyral.Corpus':
						return Spyral.Corpus.load(cv.value.corpusid).then(function(corpus) {
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
							if (cv.value[prop] != undefined) {
								table[prop] = cv.value[prop];
							}
						})
						window[cv.name] = table;
						resolve();
						break;
				}
				reject('no match');
			} else {
				reject('not spyral class');
			}
		});

	}



	this.runCode = function(code, priorVariables) {
		// collect all the declared variables
		var hasAssigner = false;
		var esr = esprima.parseScript(code, {}, function(node, metadata) {
			if (hasAssigner && node.type === 'Literal') {
				// hack to get variable name inside assign function
				me.result.variables.push(node.value);
				hasAssigner = false;
			} else if (node.type === 'VariableDeclaration') {
				if (node.declarations[0] && node.declarations[0].id && node.declarations[0].id.type === 'Identifier') {
					me.result.variables.push(node.declarations[0].id.name);
				}
			} else if (node.type === 'MemberExpression') {
				if (node.property.type === 'Identifier' && node.property.name === 'assign') {
					hasAssigner = true;
				}
			}
		});
		// console.log('code vars', me.result.variables);

		try {
			// set variables from prior code cells
			var prString = '';
			var complexVariables = [];
			priorVariables.forEach(function(pr) {
				if (pr.isSpyralClass || pr.isFunction || pr.isElement) {
					complexVariables.push(pr);
				} else {
					console.log('adding var:', pr.name);
					// prString += pr.name + '=' + JSON.stringify(pr.value) + ';';
					window[pr.name] = pr.value;
				}
			});

			console.log('loading complex vars');

			this.loadComplexVariables(complexVariables).then(function() {
				// actually run the code
				console.log('running code:', code);
				var result = undefined;
				try {
					result = eval(code);
				} catch (err) {
					me.evalSuccess = false;
					me.handleError(err);
				}
				console.log('eval result', result);

				if (me.evalSuccess) {
					Promise.resolve(result).then(function(prResult) {
						console.log('prResult', prResult);
						me.result.value = prResult;

						var variableNames = me.result.variables;
						var variables = [];
						for (var i = 0; i < variableNames.length; i++) {
							var varName = variableNames[i];
							var varValue = eval(varName);
							variables.push({name: varName, value: varValue, isSpyralClass: me.getSpyralClass(varValue), isFunction: me.isFunction(varValue), isElement: me.isElement(varValue)});
						}
						me.result.variables = variables;

						me.resolveEvent();
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

	this.handleError = function(error) {
		me.result.type = 'error';
		me.result.value = 'exception: '+error.message;
		me.result.error = error;
		me.resolveEvent();
	}

	this.resolveEvent = function() {
		try {
			if (me.result.type === 'error') {
				// always display error
				me.result.value = '<div class="error">'+me.result.value+'</div>';
				// document.body.innerHTML = me.result.value;
				showError(me.result.error);
			} else if (document.body.firstChild === null) {
				// only display result value if the body is empty
				if (typeof me.result.value === 'string' || typeof me.result.value === 'undefined') {
					document.body.innerHTML = '<div class="success">'+me.result.value+'</div>';
				} else {
					// TODO would be nice to use toString but corpus toString returns a promise :(
					// if (typeof me.result.value.toString === 'function') {
					// 	document.body.innerHTML = me.result.value.toString();
					// } else {
						document.body.innerHTML = JSON.stringify(me.result.value);
					// }
				}
			}
			
			setTimeout(function() {
				me.result.height = document.firstElementChild.offsetHeight;
				me.result.output = document.body.outerHTML;
				try {
					event.source.postMessage(JSON.stringify(me.result), event.origin);
				} catch (err) {
					// most likely an error sending the result value so remove it
					me.result.value = '';
					event.source.postMessage(JSON.stringify(me.result), event.origin);
				}
			}, 25);
		} catch (err) {
			event.source.postMessage(JSON.stringify({
				type: 'error',
				value: 'exception: '+err.message
			}), event.origin);
		}
	}
}

window.addEventListener('message', function(event) {

	var sandboxer = new Sandboxer(event);
	sandboxer.handleEvent();
	
});