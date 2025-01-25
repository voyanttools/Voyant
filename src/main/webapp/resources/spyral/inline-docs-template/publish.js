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
					// it's a typdef
					console.log('typedef encountered')
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
			console.warn('no description for', doc.longname)
		}
		return desc;
	}

	function convertLinks(strWithLinks) {
		if (strWithLinks) {
			// TODO
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

	function convertParams(params) {
		if (params) {
			return params.map((param) => {
				var converted = {
					name: param.name,
					type: convertType(param.type),
					desc: convertDescription(param.description)
				}
				if (param.optional) {
					converted.opt = true;
				}
				return converted;
			})
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

			if (doc.kind === 'typedef') {
				console.log(doc.longname)
			}

			if (doc.kind === 'class') {

				var context = createEntriesForName(doc.longname, output);

				context['overview'] = convertDescription(doc.classdesc);
				context['members'] = [];
				if (doc.returns) {
					context['members'].push({
						"name": 'constructor',
						"type": 'constructor',
						"memberof": doc.longname,
						"params": convertParams(doc.params),
						"returns": convertParams(doc.returns)[0],
						"desc": convertDescription(doc.description)
					});
				}

				convertedEntry = context;

			} else if (doc.kind === 'typedef' && doc.properties) {

				var context = output;
				if (doc.scope === 'inner' && doc.memberof) {
					context = createEntriesForName(doc.memberof, output);
				} else {
					context = createEntriesForName('global', output);
				}
				if (context['typedefs'] === undefined) {
					context['typedefs'] = [];
				}
				var obj = {
					"name": doc.name,
					"type": doc.kind,
					"memberof": doc.memberof,
					"props": convertParams(doc.properties)
				};
				context['typedefs'].push(obj);

				convertedEntry = obj;

			} else {
				throw new Error("unhandled doc!", doc.longname);
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
				
				if (context['members'] === undefined) {
					console.log('no members for',doc.longname);
					context['members'] = [];
				}
				
				var member = {
					name: name,
					type: doc.kind,
					memberof: doc.memberof
				};
				if (doc.params && doc.params.length > 0) member['params'] = convertParams(doc.params);
				if (doc.returns) member['returns'] = convertParams(doc.returns)[0];
				if (doc.description) member['desc'] = convertDescription(doc.description);

				if (doc.scope === 'static') {
					member['static'] = true;
				}

				context['members'].push(member);

				convertedEntry = member;
			}
		} else {
			// unhandled kind
			console.log('unhandled',doc.longname)
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
		
		const entrySubclasses = Object.keys(entry).filter(subkey => {
			const firstLetter = subkey.charAt(0);
			return firstLetter === firstLetter.toUpperCase();
		});
		entrySubclasses.forEach(subclassKey => {
			fs.writeFileSync(opts.destination + '/Spyral.' + key + '.' + subclassKey + '.json', JSON.stringify(entry[subclassKey], null, 2));
			delete entry[subclassKey];
		})

		fs.writeFileSync(opts.destination + '/Spyral.' + key + '.json', JSON.stringify(entry, null, 2));
	});

	if (output['window']) {
		output['window']['overview'] = 'These are helper methods that get added to global window variable.';
		fs.writeFileSync(opts.destination + '/window.json', JSON.stringify(output['window'], null, 2));
	}
};