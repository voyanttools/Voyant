/**
 * This template produces the tools.json file that is used to display the config options for the corpus.tool() method in Spyral.
 */

var fs = require('fs');
var helper = require("jsdoc/util/templateHelper");

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
        "!name": 'tools',
        "!define": {
        }
    };

    var library = {};

    function processDescription(desc) {
        if (desc) {
            desc = desc.replace(/\r+/g, "\n\n");
            desc = convertLinks(desc);
        } else {
            desc = '';
        }
        return desc;
    }

    function convertLinks(strWithLinks) {
        if (strWithLinks) {
            return strWithLinks
                .replace(/\[(.*?)\]\{@tutorial (.*?)\}/g, '<a target="_spyral_docs" href="'+apiUrlRoot+'/docs/tutorial-$2.html">$1</a>')
                .replace(/\[(.*?)\]\{@link (http.*?)\}/g, '<a target="_external" href="$2">$1</a>')
                .replace(/\[(.*?)\]\{@link (.*?)(#.*?)?\}/g, '<a target="_spyral_docs" href="'+apiUrlRoot+'/docs/$2.html$3">$1</a>')
        }   
    }

    

    function convertTypeDef(doc) {
        var convertedEntry = {
            type: doc.type.names,
            doc: processDescription(doc.description)
        }

        return convertedEntry;
    }

    // first create class and typedef entries
    for (var d in docs) {
        var doc = docs[d];
        
        if (doc.access && doc.access === 'private') continue;

        if (doc.kind === 'typedef') {
            output['!define'][doc.name] = convertTypeDef(doc);
        }

        if (doc.kind === 'class') {
            var desc = doc.description.replace("\r", ' ');
            desc += "\n\n<a target=\"_spyral_docs\" href=\""+apiUrlRoot+"/docs/"+doc.longname+".html\">More documentation</a>";
            output[doc.name] = {
                doc: desc,
                params: {
                    "style": {
                        "type": "String",
                        "doc": "A string of CSS properties to use as the style attribute for the tool's parent tag."
                    },
                    "width": {
                        "type": "Number",
                        "doc": "Specify the display width of the tool in pixels."
                    },
                    "height": {
                        "type": "Number",
                        "doc": "Specify the display height of the tool in pixels."
                    }
                }
            }
        }
    }

    for (var d in docs) {
        var doc = docs[d];
        
        if (doc.access && doc.access === 'private') continue;

        if (doc.kind === 'typedef') continue;

        if (doc.kind === 'member') {
            var parent = doc.memberof.replace(/^Tools\./, '');
            output[parent]['params'][doc.name] = {};
            
            // TODO handle multiple types
            var firstType = doc.properties[0].type.names[0];

            if (output['!define'][firstType] !== undefined) {
                var additionalDoc = doc.properties[0].description;
                if (additionalDoc !== undefined) {
                    additionalDoc = "\n\n"+additionalDoc;
                } else {
                    additionalDoc = '';
                }
                var typedef = output['!define'][firstType];
                output[parent]['params'][doc.name].type = typedef.type[0];
                output[parent]['params'][doc.name].doc = typedef.doc + additionalDoc;
            } else {
                output[parent]['params'][doc.name].type = firstType;
                output[parent]['params'][doc.name].doc = doc.properties[0].description;
            }
            output[parent]['params'][doc.name].doc = processDescription(output[parent]['params'][doc.name].doc);
        }
    }

    if (Object.keys(library).length > 0) {
        output[pkg.name] = library;
    }

    fs.writeFileSync(opts.destination + '/tools.json', JSON.stringify(output, null, 2));

};