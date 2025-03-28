'use strict';

var doop = require('jsdoc/util/doop');
var env = require('jsdoc/env');
var fs = require('jsdoc/fs');
var helper = require('jsdoc/util/templateHelper');
var logger = require('jsdoc/util/logger');
var path = require('jsdoc/path');
var taffy = require('taffydb').taffy;
var template = require('jsdoc/template');
var tutorial = require('jsdoc/tutorial');
var util = require('util');
var cheerio = require('cheerio'); // for parse html to dom
var _ = require('underscore');

var htmlsafe = helper.htmlsafe;
var linkto = helper.linkto;
var resolveAuthorLinks = helper.resolveAuthorLinks;
var scopeToPunc = helper.scopeToPunc;
var hasOwnProp = Object.prototype.hasOwnProperty;

var data;
var view;
var tutorialsName;

var outdir = path.normalize(env.opts.destination);

env.conf.templates = _.extend({
    useCollapsibles: true
}, env.conf.templates);

env.conf.templates.tabNames = _.extend({
    api: 'API',
    tutorials: 'Examples'
}, env.conf.templates.tabNames);

tutorialsName = env.conf.templates.tabNames.tutorials;

// Set default useCollapsibles true
env.conf.templates.useCollapsibles = env.conf.templates.useCollapsibles !== false;

function find(spec) {
    return helper.find(data, spec);
}

function tutoriallink(tutorial) {
    return helper.toTutorial(tutorial, null, {
        tag: 'em',
        classname: 'disabled',
        prefix: 'Tutorial: '
    });
}

function getAncestorLinks(doclet) {
    return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet, hash) {
    var url;

    if ( !/^(#.+)/.test(hash) ) {
        return hash;
    }

    url = helper.createLink(doclet);
    url = url.replace(/(#.+|$)/, hash);

    return '<a href="' + url + '">' + hash + '</a>';
}

function needsSignature(doclet) {
    var needsSig = false;

    // function and class definitions always get a signature
    if (doclet.kind === 'function' || doclet.kind === 'class') {
        needsSig = true;
    }
    // typedefs that contain functions get a signature, too
    else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
        doclet.type.names.length) {
        for (var i = 0, l = doclet.type.names.length; i < l; i++) {
            if (doclet.type.names[i].toLowerCase() === 'function') {
                needsSig = true;
                break;
            }
        }
    }

    return needsSig;
}

function getSignatureAttributes(item) {
    var attributes = [];

    if (item.optional) {
        attributes.push('opt');
    }

    if (item.nullable === true) {
        attributes.push('nullable');
    }
    else if (item.nullable === false) {
        attributes.push('non-null');
    }

    return attributes;
}

function updateItemName(item) {
    var attributes = getSignatureAttributes(item);
    var itemName = item.name || '';

    if (item.variable) {
        itemName = '&hellip;' + itemName;
    }

    if (attributes && attributes.length) {
        itemName = util.format( '%s<span class="signature-attributes">%s</span>', itemName,
            attributes.join(', ') );
    }

    return itemName;
}

function addParamAttributes(params) {
    return params.filter(function(param) {
        return param.name && param.name.indexOf('.') === -1;
    }).map(updateItemName);
}

function buildItemTypeStrings(item) {
    var types = [];

    if (item && item.type && item.type.names) {
        item.type.names.forEach(function(name) {
            types.push( linkto(name, htmlsafe(name)) );
        });
    }

    return types;
}

function buildAttribsString(attribs) {
    var attribsString = '';

    if (attribs && attribs.length) {
        attribsString = util.format(
            '<span class="icon green">%s</span> ',
            attribs.join('</span>, <span class="icon green">')
        );
    }

    return attribsString;
}

function addNonParamAttributes(items) {
    var types = [];

    items.forEach(function(item) {
        types = types.concat( buildItemTypeStrings(item) );
    });

    return types;
}

function addSignatureParams(f) {
    var params = f.params ? addParamAttributes(f.params) : [];

    f.signature = util.format( '%s(%s)', (f.signature || ''), params.join(', ') );
}

function addSignatureReturns(f) {
    var attribs = [];
    var attribsString = '';
    var returnTypes = [];
    var returnTypesString = '';
    var source = f.yields || f.returns;

    // jam all the return-type attributes into an array. this could create odd results (for example,
    // if there are both nullable and non-nullable return types), but let's assume that most people
    // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
    if (source) {
        source.forEach(function(item) {
            helper.getAttribs(item).forEach(function(attrib) {
                if (attribs.indexOf(attrib) === -1) {
                    attribs.push(attrib);
                }
            });
        });

        attribsString = buildAttribsString(attribs);
    }

    if (source) {
        returnTypes = addNonParamAttributes(f.returns);
    }
    if (returnTypes.length) {
        returnTypesString = util.format( ' &rarr; %s{%s}', attribsString, returnTypes.join('|') );
    }

    f.signature = '<span class="signature">' + (f.signature || '') + '</span>' +
        '<span class="type-signature">' + returnTypesString + '</span>';
}

function addSignatureTypes(f) {
    var types = f.type ? buildItemTypeStrings(f) : [];

    f.signature = (f.signature || '') + '<span class="type-signature">' +
        (types.length ? ' :' + types.join('|') : '') + '</span>';
}

function addAttribs(f) {
    var attribs = helper.getAttribs(f);
    var attribsString = buildAttribsString(attribs);

    f.attribs = util.format('<span class="type-signature">%s</span>', attribsString);
}

function shortenPaths(files, commonPrefix) {
    Object.keys(files).forEach(function(file) {
        files[file].shortened = files[file].resolved.replace(commonPrefix, '')
            // always use forward slashes
            .replace(/\\/g, '/');
    });

    return files;
}

function getPathFromDoclet(doclet) {
    if (!doclet.meta) {
        return null;
    }

    return doclet.meta.path && doclet.meta.path !== 'null' ?
        path.join(doclet.meta.path, doclet.meta.filename) :
        doclet.meta.filename;
}

function generate(title, docs, filename, resolveLinks, isTutorial=false) {
    var docData;
    var html;
    var outpath;

    resolveLinks = resolveLinks === false ? false : true;

    docData = {
        env: env,
        isTutorial: isTutorial,
        title: title,
        docs: docs,
        package: find({kind: 'package'})[0]
    };

    outpath = path.join(outdir, filename);
    html = view.render('container.tmpl', docData);

    if (resolveLinks) {
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    }

    fs.writeFileSync(outpath, html, 'utf8');

    if (outpath.match(/js\.html$/) === null) { // don't handle src files
        // now do the inline version
        var dom = cheerio.load(html);
        dom('.container-source').remove();
        var inlineSection = dom('#main section');
        var inlineOutpath = outpath.replace(path.sep+'docs'+path.sep, path.sep+'docs'+path.sep+'inline'+path.sep);

        inlineSection = inlineSection.toString().replace('id="toString"', 'id="_toString"'); // hack for ExtJS bug when id = toString

        var inlineDir = outdir+path.sep+'inline';
        fs.mkPath(inlineDir);
        fs.writeFileSync(inlineOutpath, inlineSection, 'utf8');
    }
}

function generateSourceFiles(sourceFiles, encoding) {
    encoding = encoding || 'utf8';
    Object.keys(sourceFiles).forEach(function(file) {
        var source;
        // links are keyed to the shortened path in each doclet's `meta.shortpath` property
        var sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);
        helper.registerLink(sourceFiles[file].shortened, sourceOutfile);

        try {
            source = {
                kind: 'source',
                code: helper.htmlsafe( fs.readFileSync(sourceFiles[file].resolved, encoding) )
            };
        }
        catch (e) {
            logger.error('Error while generating source file %s: %s', file, e.message);
        }

        generate('Source: ' + sourceFiles[file].shortened, [source], sourceOutfile,
            false);
    });
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
    var symbols = {};

    // build a lookup table
    doclets.forEach(function(symbol) {
        symbols[symbol.longname] = symbols[symbol.longname] || [];
        symbols[symbol.longname].push(symbol);
    });

    return modules.map(function(module) {
        if (symbols[module.longname]) {
            module.modules = symbols[module.longname]
                // Only show symbols that have a description. Make an exception for classes, because
                // we want to show the constructor-signature heading no matter what.
                .filter(function(symbol) {
                    return symbol.description || symbol.kind === 'class';
                })
                .map(function(symbol) {
                    symbol = doop(symbol);

                    if (symbol.kind === 'class' || symbol.kind === 'function') {
                        symbol.name = symbol.name.replace('module:', '(require("') + '"))';
                    }

                    return symbol;
                });
        }
    });
}

/**
 * For lnb listing
 * -- 'Classes'
 * -- 'Namespaces'
 * @param obj
 */
function buildSubNav(obj) {
    var count = 0;

    var longname = obj.longname;

    var methods = find({
        kind: 'function',
        memberof: longname
    });
    count += methods.length;

    var events = find({
        kind: 'event',
        memberof: longname
    });
    count += events.length;

    var typedef = find({
        kind: 'typedef',
        memberof: longname
    });
    count += typedef.length;

    var members = find({
        memberof: longname
    });
    members = members.filter((member) => {
        return !methods.includes(member) && !events.includes(member) && !typedef.includes(member);
    })
    count += members.length;

    var children = [];
    if (Object.hasOwn(obj, "children")) {
        children = obj.children;
    }
    count += children.length;

    if (count > 0) {
        var html = '<div class="hidden" id="' + obj.longname.replace(/"/g, '_') + '_sub">';
        html += buildSubNavMembers(members, 'Members', linkto);
        html += buildSubNavMembers(methods, 'Methods', linkto);
        html += buildSubNavMembers(events, 'Events', linkto);
        html += buildSubNavMembers(typedef, 'Typedef', linkto);
        html += buildSubNavMembers(children, 'Guides', linktoTutorial);
        html += '</div>';
    return html;

    } else {
        return "";
    }

}

function buildSubNavMembers(list, type, linktoFn) {
    var html = '';

    if (list.length) {
        if (type !== 'Guides') {
            html += '<div class="member-type">' + type + '</div>';
        }
        html += '<ul class="inner">';
        list.forEach(function(item) {
            html += '<li>' + linktoFn(item.longname, item.name) + '</li>';
        });
        html += '</ul>';
    }

    return html;
}

function buildMemberNav(items, itemHeading, itemsSeen, linktoFn) {
    var nav = '';

    if (items.length) {
        var itemsNav = '';
        var className = itemHeading === tutorialsName ? 'lnb-examples hidden' : 'lnb-api hidden';
        var makeHtml = env.conf.templates.useCollapsibles ? makeCollapsibleItemHtmlInNav : makeItemHtmlInNav;

        items.forEach(function(item) {
            var linkHtml;

            if ( !hasOwnProp.call(item, 'longname') ) {
                itemsNav += '<li>' + linktoFn('', item.name) + buildSubNav(item) + '</li>';
            }
            else if ( !hasOwnProp.call(itemsSeen, item.longname) ) {
                var displayName;
                if (env.conf.templates.default.useLongnameInNav || item.kind === 'namespace') {
                    displayName = item.longname;
                } else {
                    displayName = item.name;
                }

                linkHtml = linktoFn(item.longname, displayName.replace(/\b(module|event):/g, ''));
                itemsNav += makeHtml(item, linkHtml);
            }

            itemsSeen[item.longname] = true;
        });

        if (itemsNav !== '') {
            nav += '<div class="' + className + '"><h3>' + itemHeading + '</h3><ul>' + itemsNav + '</ul></div>';
        }
    }

    return nav;
}

function makeItemHtmlInNav(item, linkHtml) {
    return '<li>'
        + linkHtml
        + buildSubNav(item)
        + '</li>';
}

function makeCollapsibleItemHtmlInNav(item, linkHtml) {
    var sub = buildSubNav(item);
    if (sub !== "") {
        return '<li>'
        + linkHtml
        + '<button type="button" class="hidden toggle-subnav btn btn-link">'
        + '  <span class="glyphicon glyphicon-plus"></span>'
        + '</button>'
        + buildSubNav(item)
        + '</li>';
    } else {
    return "";
    }
}

function linktoTutorial(longName, name) {
    return tutoriallink(name);
}

function linktoExternal(longName, name) {
    return linkto(longName, name.replace(/(^"|"$)/g, ''));
}

/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav(members) {
    var nav = '';
    var seen = {};
    var seenTutorials = {};

    nav += buildMemberNav(members.tutorials, tutorialsName, seenTutorials, linktoTutorial, true);
    nav += buildMemberNav(members.modules, 'Modules', {}, linkto);
    nav += buildMemberNav(members.externals, 'Externals', seen, linktoExternal);
    nav += buildMemberNav(members.namespaces, 'Namespaces', seen, linkto);

    // Remove any class that is already in namespaces.
    var classes = members.classes.filter(item => {
        // if (nav.includes(item.name + "</a>")) {
        //     return false;
        // } else {
            return true;
        // }
    })

    nav += buildMemberNav(classes, 'Classes', seen, linkto);
    nav += buildMemberNav(members.mixins, 'Mixins', seen, linkto);
    nav += buildMemberNav(members.interfaces, 'Interfaces', seen, linkto);

//    if (members.globals.length) {
//        var globalNav = '';
//        var useGlobalTitleLink = true;
//
//        members.globals.forEach(function(g) {
//            if ( !hasOwnProp.call(seen, g.longname) ) {
//                // tuidoc
//                //  - Add global-typedef in hidden to search api.
//                //  - Default template did not add this.
//                if (g.kind === 'typedef') {
//                    globalNav += '<li class="hidden">' + linkto(g.longname, g.name) + '</li>';
//                } else {
//                    globalNav += '<li>' + linkto(g.longname, g.name) + '</li>';
//                    useGlobalTitleLink = false;
//                }
//            }
//
//            seen[g.longname] = true;
//        });
//
//        if (useGlobalTitleLink) {
//            // turn the heading into a link so you can actually get to the global page
//            nav += '<div class="lnb-api hidden"><h3>' + linkto('global', 'Global') + '</h3></div>';
//        }
//        else {
//            nav += '<div class="lnb-api hidden"><h3>Global</h3><ul>' + globalNav + '</ul></div>';
//        }
//    }

    return nav;
}

/**
 * Look ma, it's cp -R.
 * @param {string} src The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
var copyRecursiveSync = function(src, dest) {
    var contents,
        srcExists = fs.existsSync(src),
        destExists = fs.existsSync(dest),
        stats = srcExists && fs.statSync(src),
        isDirectory = srcExists && stats.isDirectory();

    if (srcExists) {
        if (isDirectory) {
            if (!destExists) {
                fs.mkdirSync(dest);
            }
            fs.readdirSync(src).forEach(function(childItemName) {
                copyRecursiveSync(path.join(src, childItemName),
                    path.join(dest, childItemName));
            });
        } else {
            contents = fs.readFileSync(src);
            fs.writeFileSync(dest, contents);
        }
    }
};

/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = function(taffyData, opts, tutorials) {
    data = taffyData;

    var conf = env.conf.templates || {};
    conf.default = conf.default || {};

    var templatePath = path.normalize(opts.template);
    view = new template.Template( path.join(templatePath, 'tmpl') );

    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
    // doesn't try to hand them out later
    var indexUrl = helper.getUniqueFilename('index');
    // don't call registerLink() on this one! 'index' is also a valid longname

    var globalUrl = helper.getUniqueFilename('global');
    helper.registerLink('global', globalUrl);

    // set up templating
    view.layout = conf.default.layoutFile ?
        path.getResourcePath(path.dirname(conf.default.layoutFile),
            path.basename(conf.default.layoutFile) ) :
        'layout.tmpl';

    // set up tutorials for helper
    helper.setTutorials(tutorials);

    data = helper.prune(data);
    data.sort('longname, version, since');
    helper.addEventListeners(data);

    // @borrows creates 2 docs so we need special handling
    // remove @borrows entries
    data(function() { return this.comment && this.comment.indexOf('@borrows') !== -1}).remove();

    var sourceFiles = {};
    var sourceFilePaths = [];
    data().each(function(doclet) {
         doclet.attribs = '';

        if (doclet.examples) {
            doclet.examples = doclet.examples.map(function(example) {
                var caption, code;

                if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
                    caption = RegExp.$1;
                    code = RegExp.$3;
                }

                return {
                    caption: caption || '',
                    code: code || example
                };
            });
        }
        if (doclet.see) {
            doclet.see.forEach(function(seeItem, i) {
                doclet.see[i] = hashToLink(doclet, seeItem);
            });
        }

        // special handling for borrowed entries that are members of window
        if (doclet.longname.indexOf('window.') === 0) {
            doclet.longname = doclet.longname.substring(0, doclet.longname.lastIndexOf('.'));
            doclet.memberof = 'window';
		}

        // build a list of source files
        var sourcePath;
        if (doclet.meta) {
            sourcePath = getPathFromDoclet(doclet);
            sourceFiles[sourcePath] = {
                resolved: sourcePath,
                shortened: null
            };
            if (sourceFilePaths.indexOf(sourcePath) === -1) {
                sourceFilePaths.push(sourcePath);
            }
        }
    });

    fs.mkPath(outdir);

    // copy the template's static files to outdir
    var fromDir = path.join(templatePath, 'static');
    var staticFiles = fs.ls(fromDir, 3);

    staticFiles.forEach(function(fileName) {
        var toDir = fs.toDir( fileName.replace(fromDir, outdir) );
        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
    });

    // copy user-specified static files to outdir
    var staticFilePaths;
    var staticFileFilter;
    var staticFileScanner;
    if (conf.default.staticFiles) {
        // The canonical property name is `include`. We accept `paths` for backwards compatibility
        // with a bug in JSDoc 3.2.x.
        staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
        staticFileFilter = new (require('jsdoc/src/filter')).Filter(conf.default.staticFiles);
        staticFileScanner = new (require('jsdoc/src/scanner')).Scanner();

        staticFilePaths.forEach(function(filePath) {
            var extraStaticFiles;

            filePath = path.resolve(env.pwd, filePath);
            extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

            extraStaticFiles.forEach(function(fileName) {
                var sourcePath = fs.toDir(filePath);
                var toDir = fs.toDir( fileName.replace(sourcePath, outdir) );
                fs.mkPath(toDir);
                fs.copyFileSync(fileName, toDir);
            });
        });
    }

    if (sourceFilePaths.length) {
        sourceFiles = shortenPaths( sourceFiles, path.commonPrefix(sourceFilePaths) );
    }
    data().each(function(doclet) {
        var url = helper.createLink(doclet);
        helper.registerLink(doclet.longname, url);

        // add a shortened version of the full path
        var docletPath;
        if (doclet.meta) {
            docletPath = getPathFromDoclet(doclet);
            docletPath = sourceFiles[docletPath].shortened;
            if (docletPath) {
                doclet.meta.shortpath = docletPath;
            }
        }
    });

    data().each(function(doclet) {
        var url = helper.longnameToUrl[doclet.longname];

        if (url.indexOf('#') > -1) {
            doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
        }
        else {
            doclet.id = doclet.name;
        }

        if ( needsSignature(doclet) ) {
            addSignatureParams(doclet);
            addSignatureReturns(doclet);
            addAttribs(doclet);
        }
    });

    // do this after the urls have all been generated
    data().each(function(doclet) {
        doclet.ancestors = getAncestorLinks(doclet);

        if (doclet.kind === 'member') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
        }

        if (doclet.kind === 'constant') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
            doclet.kind = 'member';
        }
    });

    var members = helper.getMembers(data);

    members.tutorials = tutorials.children;

    // output pretty-printed source files by default
    var outputSourceFiles = conf.default && conf.default.outputSourceFiles !== false ? true :
        false;

    // add template helpers
    view.find = find;
    view.linkto = linkto;
    view.resolveAuthorLinks = resolveAuthorLinks;
    view.tutoriallink = tutoriallink;
    view.htmlsafe = htmlsafe;
    view.outputSourceFiles = outputSourceFiles;

    // once for all
    view.nav = buildNav(members);

    attachModuleSymbols( find({ longname: {left: 'module:'} }), members.modules );

    // generate the pretty-printed source files first so other pages can link to them
    if (outputSourceFiles) {
        generateSourceFiles(sourceFiles, opts.encoding);
    }

    if (members.globals.length) { generate('Global', [{kind: 'globalobj'}], globalUrl, true, true); }

    // index page displays information from package.json
    var packages = find({kind: 'package'});

    generate('Home',
        packages.concat(
            [{kind: 'mainpage', readme: opts.readme, longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'}]
        ),
    indexUrl, true, true);

    // set up the lists that we'll use to generate pages
    var classes = taffy(members.classes);
    var modules = taffy(members.modules);
    var namespaces = taffy(members.namespaces);
    var mixins = taffy(members.mixins);
    var externals = taffy(members.externals);
    var interfaces = taffy(members.interfaces);

    Object.keys(helper.longnameToUrl).forEach(function(longname) {
        var myModules = helper.find(modules, {longname: longname});
        if (myModules.length) {
            generate('Module: ' + myModules[0].name, myModules, helper.longnameToUrl[longname]);
        }

        var myClasses = helper.find(classes, {longname: longname});
        if (myClasses.length) {
            generate('Class: ' + myClasses[0].name, myClasses, helper.longnameToUrl[longname]);
        }

        var myNamespaces = helper.find(namespaces, {longname: longname});
        if (myNamespaces.length) {
            generate('Namespace: ' + myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname]);
        }

        var myMixins = helper.find(mixins, {longname: longname});
        if (myMixins.length) {
            generate('Mixin: ' + myMixins[0].name, myMixins, helper.longnameToUrl[longname]);
        }

        var myExternals = helper.find(externals, {longname: longname});
        if (myExternals.length) {
            generate('External: ' + myExternals[0].name, myExternals, helper.longnameToUrl[longname]);
        }

        var myInterfaces = helper.find(interfaces, {longname: longname});
        if (myInterfaces.length) {
            generate('Interface: ' + myInterfaces[0].name, myInterfaces, helper.longnameToUrl[longname]);
        }
    });

    if (env.opts.tutorials) {
        copyRecursiveSync(env.opts.tutorials, outdir + '/tutorials');
    }

    // TODO: move the tutorial functions to templateHelper.js
    function generateTutorial(title, tutorial, fileName, originalFileName, isHtmlTutorial) {
        var tutorialData = {
            docs: null, // If there is no "docs" prop, Erros in layout.tmpl. (For left-nav member listing control)
            isTutorial: true,
            env: env,
            title: title,
            header: tutorial.title,
            children: tutorial.children,
            isHtmlTutorial: isHtmlTutorial,
            package: find({kind: 'package'})[0]
        };

        if (isHtmlTutorial) {
            _.extend(tutorialData, generateHtmlTutorialData(tutorial, fileName, originalFileName));
        } else {
            tutorialData.content = tutorial.parse();
        }

        var tutorialPath = path.join(outdir, fileName),
            html = view.render('tutorial.tmpl', tutorialData);

        // yes, you can use {@link} in tutorials too!
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>

        fs.writeFileSync(tutorialPath, html, 'utf8');
    }

    function generateHtmlTutorialData(tutorial, filename, originalFileName) {
        var $ = cheerio.load(tutorial.parse(), {
            decodeEntities: false,
            normalizeWhitespace: false
        });

        return {
            codeHtml: htmlsafe($('div.code-html').html() || ''),
            codeJs: htmlsafe($('script.code-js').html() || ''),
            originalFileName: originalFileName
        };
    }

    // tutorials can have only one parent so there is no risk for loops
    function saveChildren(node) {
        node.children.forEach(function(child) {
            var originalFileName = child.name;
            var isHtmlTutorial = child.type === tutorial.TYPES.HTML;
            var title = 'Tutorial: ' + child.title;
            var fileName = helper.tutorialToUrl(child.name);

            generateTutorial(title, child, fileName, originalFileName, isHtmlTutorial);
            saveChildren(child);
        });
    }
    saveChildren(tutorials);
};
