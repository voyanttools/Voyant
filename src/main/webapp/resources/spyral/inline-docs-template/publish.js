var fs = require('fs');
var helper = require("jsdoc/util/templateHelper");
var showdown = require('showdown');
var converter = new showdown.Converter(); // https://www.npmjs.com/package/showdown#valid-options

var apiUrlRoot = '';

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
	};

	var library = {};

	/**
	 * 
	 * @param {Object} typeObj 
	 * @returns {Array}
	 */
	function convertType(typeObj) {
		if (typeObj.names) {
			return typeObj.names.map((name) => {
				if (name.indexOf('~') !== -1) {
					// it's a typedef
					console.log('typedef encountered', name)
				}
				return name.replace('\.<', '<').replace('<','&lt;').replace('>','&gt;')
			});
		} else {
			return undefined
		}
	}

	function convertDescription(desc) {
		if (desc) {
			desc = convertLinks(desc);
			desc = converter.makeHtml(desc);
		} else {
			//console.warn('no description for', doc.longname)
		}
		return desc;
	}

	function convertLinks(strWithLinks) {
		// construct an actual html link
		// TODO support other link text formats: {@link URL|TEXT} and {@link URL TEXT}
		return strWithLinks.replace(/(?:\[(.*?)\])?{@link\s+(.*?)}/g, function(match, p1, p2) {
			if (p2.startsWith('http')) {
				console.log('external link', p2);
				return `<a rel="external" href="${p2}">${p1 ? p1 : p2}</a>`;
			} else {
				return `<a rel="help" href="${apiUrlRoot}/docs/${p2}.html">${p1 ? p1 : p2}</a>`
			}
		}).replace(/(?:\[(.*?)\])?{@tutorial\s+(.*?)}/g, function(match, p1, p2) {
			return `<a rel="help" href="${apiUrlRoot}/docs/tutorial-${p2}.html">${p1 ? p1 : p2}</a>`
		});
	}

	function convertParams(params) {
		if (params) {
			var convertedParams = params.map((param) => {

				var converted = {
					name: param.name,
					type: convertType(param.type),
					desc: convertDescription(param.description)
				}
				
				// handling for typedefs
				// TODO maybe don't do this for Corpus??
				/*
				if (converted.type[0].indexOf('~') !== -1) {
					var typeMatches = converted.type[0].match(/(.*)?~(.*)/);
					var longname = typeMatches[1];
					var typedefName = typeMatches[2];
					var entry = createEntriesForName(longname, output);
					if (entry && entry.typedefs) {
						var typedef = entry.typedefs.find(function(typedef) { return typedef.name === typedefName });
						converted.type = typedef.type;
						converted.subparams = typedef.props;
					} else {
						console.warn('no typedef entry for',typedefName)
					}
				}
				*/

				if (param.optional) {
					converted.opt = true;
				}
				return converted;
			});

			// handling for param properties
			var parentParam = null;
			convertedParams.forEach(function(param, i) {
				var paramRegExp;

				if (!param) { return; }

				if (parentParam && parentParam.name && param.name) {
					paramRegExp = new RegExp('^(?:' + parentParam.name + '(?:\\[\\])*)\\.(.+)$');

					if (paramRegExp.test(param.name)) {
						param.name = RegExp.$1;
						parentParam.subparams = parentParam.subparams || [];
						parentParam.subparams.push(param);
						convertedParams[i] = null;
					} else {
						parentParam = param;
					}
				} else {
					parentParam = param;
				}
			});

			convertedParams = convertedParams.filter(function(param) { return param !== null });

			return convertedParams;
		}
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

		if (doc.ignore || doc?.access === 'private') {
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

		if (doc.kind === undefined) {
			console.log('no kind', doc.longname);
			return;
		}

		if (doc.kind === 'namespace') {
			createEntriesForName(doc.longname, output);
		} else if (doc.kind === 'class') {

			var context = createEntriesForName(doc.longname, output);

			context['overview'] = convertDescription(doc.classdesc || doc.description);
			context['members'] = [];
			if (doc.returns) {
				context['members'].push({
					"name": 'constructor',
					"type": 'method',
					"memberof": doc.longname,
					"params": convertParams(doc.params),
					"returns": convertParams(doc.returns)[0],
					"desc": convertDescription(doc.description)
				});
				convertedEntry = context['members'][0];
			} else {
				convertedEntry = context;
			}

		} else if (doc.kind === 'typedef') {

			var memberof = doc.memberof ? doc.memberof : 'global';
			var context = createEntriesForName(memberof, output);
			if (context['typedefs'] === undefined) {
				context['typedefs'] = [];
			}
			var obj = {
				"name": doc.name,
				"type": convertType(doc.type),
				"desc": convertDescription(doc.description),
				"memberof": memberof
			};
			if (doc.properties) obj["props"] = convertParams(doc.properties);
			context['typedefs'].push(obj);

			convertedEntry = obj;

		} else if (doc.kind === 'member' || doc.kind === 'function') {

			// @memberof Tools hack
			if (doc.meta.path.match(/panel$/)) {
				doc.memberof = 'Tools.'+doc.memberof;
			}
			var context = createEntriesForName(doc.memberof, output);
			
			var name = doc.name.replace('exports.', '');
			
			if (context['members'] === undefined) {
				console.log('no members for',doc.longname);
				context['members'] = [];
			}
			
			var member = {
				name: name,
				type: doc.kind === 'function' ? 'method' : doc.kind,
				memberof: doc.memberof
			};
			if (doc.params && doc.params.length > 0) member['params'] = convertParams(doc.params);
			if (doc.returns) member['returns'] = convertParams(doc.returns)[0];
			if (doc.description) member['desc'] = convertDescription(doc.description);
			if (doc.properties) {
				// assume it's a typedef and that there's only one
				var typeDefName = doc.properties[0].type.names[0]
				var globalTypeDef = output?.global?.typedefs.find((td) => td.name === typeDefName);
				if (globalTypeDef) {
					member['props'] = [{
						name: globalTypeDef.name,
						type: globalTypeDef.type,
						desc: globalTypeDef.desc
					}];
				} else {
					// console.log('no global typedef found', doc.longname, typeDefName);
					member['props'] = convertParams(doc.properties);
				}
			}

			if (doc.scope === 'static') {
				member['static'] = true;
			}

			context['members'].push(member);

			convertedEntry = member;
		} else {
			// unhandled kind
			console.log('unhandled kind',doc.longname, doc.kind)
		}

		if (convertedEntry !== undefined) {
			if (doc.examples) {
				convertedEntry['examples'] = doc.examples.map((example) => convertDescription("```\n"+example+"\n```"));
			}

			if (doc.see) {
				console.warn('see encountered', doc.longname, doc.see)
			}
		}
	}

	docs.sort(function(a, b) {
		if (a.scope === 'global') return -1;
		if (b.scope === 'global') return 1;
		return 0;
	})

	for (var d in docs) {
		var doc = docs[d];
		convertDoc(doc);
	}

	if (Object.keys(library).length > 0) {
		output[pkg.name] = library;
	}

	function writeFiles(parentKey) {
		if (!output[parentKey]) return;
		
		var toc = [];

		Object.keys(output[parentKey]).forEach(key => {
			const entry = output[parentKey][key];
			
			const entrySubclasses = Object.keys(entry).filter(subkey => {
				const firstLetter = subkey.charAt(0);
				return firstLetter === firstLetter.toUpperCase();
			});
			entrySubclasses.forEach(subclassKey => {
				var filename = parentKey+'.'+key+'.'+subclassKey;
				toc.push(filename)
				fs.writeFileSync(opts.destination+'/'+filename+'.json', JSON.stringify(entry[subclassKey], null, 2));
				delete entry[subclassKey];
			})
	
			var filename = parentKey+'.'+key;
			toc.push(filename);
			fs.writeFileSync(opts.destination+'/'+filename+'.json', JSON.stringify(entry, null, 2));
		});

		fs.writeFileSync(opts.destination+'/'+parentKey+'.json', JSON.stringify(toc, null, 0));
	}

	writeFiles('Tools');
	writeFiles('Spyral');
	

	if (output['window']) {
		output['window']['overview'] = 'These are helper methods that get added to global window variable.';
		fs.writeFileSync(opts.destination + '/window.json', JSON.stringify(output['window'], null, 2));
	}
};