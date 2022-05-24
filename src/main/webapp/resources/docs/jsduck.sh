# generate docs (no spyral)
#/home/andrew/.gem/bin/solvas-jsduck --config resources/docs/en/config.json --output docs; cp docs/index.html docs/index.jsp; chmod 644 docs/extjs/ext-all.js;
#
# generate spyral source for api
python3 ../spyral/src-jsduck/jsdocs.py --input-dir ../spyral/node_modules/voyant/src ../spyral/src --output-file ../spyral/src-jsduck/spyral.js
#
# generate docs (with spyral)
/home/andrew/.gem/bin/solvas-jsduck --no-source --verbose --processes=1 --config ../docs/en/config.json --output ../../docs --ignore-global ../spyral/src-jsduck/; cp ../../docs/index.html ../../docs/index.jsp; cp mirrors.jsp ../../docs; cp servers.json ../../docs; chmod 644 docs/extjs/ext-all.js;