LOC1="/home/ryan/local/voyantjs/src/"
LOC2="../spyral/src/"
LOC3="../../app/panel"
OUTPUT_DIR="../../docs"
CONFIG_FILE="config.json"

npm install
rm -r ../../docs/*
node_modules/.bin/jsdoc -c "${CONFIG_FILE}" -d "${OUTPUT_DIR}" "${LOC1}" "${LOC2}" "${LOC3}"
