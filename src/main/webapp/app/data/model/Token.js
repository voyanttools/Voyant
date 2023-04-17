Ext.define('Voyant.data.model.Token', {
    extend: 'Ext.data.Model',
    fields: [
             {name: 'id'},
             {name: 'docId'},
             {name: 'docIndex', type: 'int'},
             {name: 'token'},
             {name: 'rawFreq'},
             {name: 'tokenType'},
             {name: 'position', type: 'int'},
             {name: 'startOffset', type: 'int'},
             {name: 'endOffset', type: 'int'}
        ],
    statics: {
		/**
		 * Parse an element's ID and return doc index and position info.
		 * @param {*} el Either an ExtJS element or an HTML element
		 * @returns {Object}
		 */
    	getInfoFromElement: function(el) {
    		if (el && el.id) {
    			var parts = el.id.split("_");
    			return {
    				docIndex: parseInt(parts[1]),
    				position: parseInt(parts[2])
    			};
    		}
    	}
    },
	isWord: function() {
		return this.getTokenType()=='lexical'; // maybe something else later?
	},
	isStopword: function() {
		return this.get("stopword")=="true";
	},
	getTokenType: function() {
		return this.get("tokenType");
	},
	getId: function() {
		return ["",this.getDocIndex(),this.getPosition()].join("_");
	},
	getDocIndex: function() {
		return this.get("docIndex");
	},
	getDocId: function() {
		return this.get("docId");
	},
	getTerm: function() {
		return this.get("term");
	},
	getTermWithLineSpacing: function(isPlainText) {
		var term = this.getTerm();
		if (isPlainText) {
			term = term.replace(/(\r\n|\r|\n)\s*/g,"<br />");
		} else {
			// alternate very general regex: <[^>]*>
			term = term.replace(/<\/?(.|\n|\r)*?>/gm, "<br /><br />").replace(/>\s+</g,"><").replace(/<br \/><br \/>(<br \/>)+/g,"<br \/><br \/>");
		}
		return term;
	},
	getPosition: function() {
		return this.get("position");
	},
	getDocumentRawFreq: function() {
		return this.get("rawFreq");
	}
});