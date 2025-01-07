var fs = require('fs');
var helper = require("jsdoc/util/templateHelper");
var showdown = require('showdown');
var converter = new showdown.Converter(); // https://www.npmjs.com/package/showdown#valid-options

var apiUrlRoot = 'https://voyant-tools.org';

/**
 * Publish hook for the JSDoc template.  Writes to JSON stdout.
 * @param {function} data The root of the Taffy DB containing doclet records.
 * @param {Object} opts Options.
 */
exports.publish = function(data, opts, tutorials) {
	data({ undocumented: true }).remove();

	var docs = data().get();

	const pkg = (helper.find(data, { kind: 'package' }) || [])[0];

	var output = {
		"!define": {
		}
	};

	var library = {};

	function convertType(typeObj, returnString) {
		if (typeObj) {
			var type = typeObj.type.names.join('|');
			//arrays
			if (type.indexOf('Array.<') !== -1) {
				type = type.replace(/Array\.\</g, '[').replace(/\>/g, ']');
			}
			//arraylike
			else if (type.indexOf('ArrayLike.<') !== -1) {
				// type = '?';
			}
			//promise
			else if (type.indexOf('Promise') === 0) {
			}
			//any
			else if (type === '*' || type === 'any') {
				// type = type.replace(/\*/g, '?');
			}
			//functions
			else if (type.indexOf('function') !== -1) {
				// type = type.replace(/function/g, 'fn()');
			}
			//boolean
			else if (type.search(/boolean/i) !== -1) {
				// type = type.replace(/boolean/ig, 'boolean')
			}
			else if (type.indexOf('String') !== -1) {
				// type = type.replace(/String/g, 'string')
			}
			else if (type.indexOf('Number') !== -1) {
				// type = type.replace(/Number/g, 'number')
			}

			// types with constructors
			else if ((output[type] && output[type].prototype) || /[A-Z]/.test(type[0])) {
				type = '+' + type;
			}

			if (returnString) {
				return type;
			} else {
				var convertedObj = {
					"sig": type
				};
				if (typeObj.description) {
					convertedObj["docs"] = convertDescription(typeObj.description);
				}
				return convertedObj;
			}
		}
	}

	function convertDescription(desc) {
		if (desc) {
			desc = convertLinks(desc);
			desc = converter.makeHtml(desc);
		} else {
			console.warn('no entry for', doc.longname)
		}
		return desc;
	}

	function convertLinks(strWithLinks) {
		if (strWithLinks) {
			return strWithLinks.replace(/(?:{@link\s)(.*?)(?:(?:\|.*?})|})/g, '$1');  // extract the actual link from the link tag
		}   
	}

	function convertSee(sees) {
		if (sees) {
			var see = sees[0];
			if (see) {
				return convertLinks(see);
			}
		}
	}

	function convertParams(doc) {
		var paramsOutput = 'fn()';
		if (doc.params) {

			// tern doesn't support parameters with properties ( https://discuss.ternjs.net/t/functions-optional-parameters-overloads/59 )
			// so, create type definitions for them
			var definitions = undefined;
			doc.params.forEach(param => {
				if (param.name.indexOf('.') !== -1) {
					if (definitions === undefined) definitions = {};

					var [paramName, propName] = param.name.split('.');
					if (definitions[paramName] === undefined) {
						definitions[paramName] = {};
					}
					definitions[paramName][propName] = convertType(param);
				}
			});

			var convertedParams = [];
			doc.params
				.filter(param => param.name.indexOf('.') === -1)
				.forEach((param) => {
					if (definitions && definitions[param.name]) {
						// create the full type definition name, prepending class, method
						var paramTypeName = `${doc.longname.replace(/\.|#/g, '_')}_${param.name}`;
						convertedParams.push(`${param.name + (param.optional ? '?' : '')}: +${paramTypeName}`);
						// replace the old name with the new one
						definitions[paramTypeName] = definitions[param.name];
						delete definitions[param.name];
					} else {
						convertedParams.push(`${param.name + (param.optional ? '?' : '')}: ${convertType(param, true)}`);
					}
				});

			if (definitions) {
				// add the new type definitions
				Object.assign(output['!define'], definitions);
			}

			paramsOutput = 'fn(' + convertedParams.join(', ') + ')';
		}
		if (doc.returns) {
			paramsOutput += convertReturns(doc.returns);
		}
		return paramsOutput;
	}

	function convertReturns(returns) {
		if (returns && returns[0].type.names.join('|') === 'void')
			return '';
		return returns ? ' -> ' + convertType(returns[0], true) : '';
	}

	function createEntriesForName(name, context) {
		var namepath = name.split('.');
		namepath.forEach((namepart, index) => {
			if (namepart !== '') {
				if (context[namepart] === undefined) {
					context[namepart] = {}
				}
				context = context[namepart];
			}
		})
		return context;
	}

	function convertDoc(doc) {
		var convertedEntry = undefined;

		if (doc.ignore) {
			return;
		}

		// @borrows creates 2 docs so we need special handling
		if (doc.comment && doc.comment.indexOf('@borrows') !== -1) {
			return; // skip @borrows entries
		}
		// special handling for borrowed entries that are members of window
		if (doc.longname.indexOf('window.') === 0) {
			doc.longname = doc.longname.substring(0, doc.longname.lastIndexOf('.'));
			doc.memberof = 'window';
		}

		if (doc.kind && doc.kind === 'namespace') {
			createEntriesForName(doc.longname, output);

		} else if (doc.kind && (doc.kind === 'module' || doc.kind === 'class' || doc.kind === 'typedef')) {

			if (doc.kind === 'class') {

				var context = createEntriesForName(doc.longname, output);

				context['overview'] = convertDescription(doc.classdesc);

				context['constructor'] = {
					"sig": convertParams(doc),
					"doc": convertDescription(doc.description)
				};
				context['methods'] = {};

				convertedEntry = context;

			} else if (doc.kind === 'typedef' && doc.properties) {

				var obj = {};
				for (var p in doc.properties) {
					var dp = doc.properties[p];
					obj[dp.name] = convertType(dp);
				}
				output['!define'][doc.name] = obj;

				convertedEntry = output['!define'][doc.name];

			} else if (doc.kind === 'typedef' && doc.params) {

				output[doc.name] = {
					"sig": convertParams(doc)
				};

				convertedEntry = output[doc.name]

			}

		} else if (doc.kind === 'member' || doc.kind === 'function') {
			if (doc.kind === 'member' && doc.type === undefined) {
				return;
			}

			var memberName = doc.memberof.replace('module:', '');
			if (memberName === pkg.name) {
				library[doc.name] = {
					"sig": convertParams(doc)
				};
				convertedEntry = library[doc.name];
			} else {
				var context = createEntriesForName(memberName, output);
				
				var name = doc.name.replace('exports.', '');
				
				if (context['methods'] === undefined) {
					console.log('HERE');
					context['methods'] = {};
				}
				context = context['methods'];
				
				context[name] = {
					"sig": doc.kind === 'function' ? convertParams(doc) : convertType(doc.type.names.join('|')),
					"doc": convertDescription(doc.description)
				}
				if (doc.scope === 'static') {
					context[name].static = true;
				}

				convertedEntry = context[name];
			}
		} else {
			// unhandled kind
		}

		if (convertedEntry !== undefined) {
			var url = convertSee(doc.see);
			if (url) {
				convertedEntry['url'] = url;
			}

			if ((doc.kind === 'function' || doc.kind === 'class') && url) {
				// auto-generate API urls
				if (!desc) {
					// link to overview by default
					convertedEntry['url'] = apiUrlRoot+'/docs/#!/api/'+doc.longname;
				} else {
					if (doc.kind === 'class') {
						convertedEntry['url'] = apiUrlRoot+'/docs/#!/api/'+doc.longname+'-method-constructor';
					} else if (doc.scope === 'instance') {
						convertedEntry['url'] = apiUrlRoot+'/docs/#!/api/'+(doc.longname.replace('#', '-method-'));
					} else if (doc.scope === 'static') {
						convertedEntry['url'] = apiUrlRoot+'/docs/#!/api/'+(doc.longname.replace(/\.(\w+)$/, '-static-method-$1'));
					}
				}
			}
		}
	}

	for (var d in docs) {
		var doc = docs[d];
		convertDoc(doc);
	}

	if (Object.keys(library).length > 0) {
		output[pkg.name] = library;
	}

	Object.keys(output['Spyral']).forEach(key => {
		const entry = output['Spyral'][key];
		fs.writeFileSync(opts.destination + '/Spyral.' + key + '.json', JSON.stringify(entry, null, 2));
	});
};