/**
 * A class for storing Notebook metadata
 * @memberof Spyral
 */
class Metadata {
	
	/** 
	 * The metadata constructor.
	 * @constructor
	 * @param {Object} config The metadata config object
	 * @param {String} config.title The title of the Notebook
	 * @param {String} config.userId The user ID of the author of the Notebook
	 * @param {String} config.author The name of the author of the Notebook
	 * @param {Boolean} config.catalogue Whether to include the Notebook in the Catalogue
	 * @param {String} config.description The description of the Notebook
	 * @param {Array} config.keywords The keywords for the Notebook
	 * @param {String} config.created When the Notebook was created
	 * @param {String} config.language The language of the Notebook
	 * @param {String} config.license The license for the Notebook
	 * @returns {Spyral.Metadata}
	 */
	constructor(config) {
		['title', 'userId', 'author', 'description', 'catalogue', 'keywords', 'modified', 'created', 'language', 'license'].forEach(key => {
			if (key === 'keywords') {
				this[key] = [];
			} else if (key === 'catalogue') {
				this[key] = false;
			} else {
				this[key] = '';
			}
		})
		this.version = "0.1"; // may be changed by config
		if (config instanceof HTMLDocument) {
			config.querySelectorAll("meta").forEach(function(meta) {
				var name =  meta.getAttribute("name");
				if (name && this.hasOwnProperty(name)) {
					var content = meta.getAttribute("content");
					if (content) {
						if (name === 'keywords') {
							var spaces = content.match(/\s+/g);
							if (content.search(',') === -1 && spaces !== null && spaces.length > 1) {
								// backwards compatibility: if there are no commas but multiple spaces then assume space delimited keywords
								content = content.split(/\s+/);
							} else {
								content = content.split(',');
							}
						} else if (name === 'catalogue') {
							content = content.toLowerCase() === 'true';
						}
						this[name] = content;
					}
				}
			}, this);
		} else {
			this.set(config);
		}
		if (!this.created) {this.setDateNow("created")}
	}

	/**
	 * Set metadata properties.
	 * @param {Object} config A config object
	 */
	set(config) {
		for (var key in config) {
			if (this.hasOwnProperty(key)) {
				this[key] = config[key];
			}
		}
	}

	/**
	 * Sets the specified field to the current date and time.
	 * @param {String} field 
	 */
	setDateNow(field) {
		this[field] = new Date().toISOString();
	}

	/**
	 * Gets the specified field as a short date.
	 * @param {String} field
	 * @returns {(String|undefined)}
	 */
	shortDate(field) {
		return this[field] ? (new Date(Date.parse(this[field])).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })) : undefined;
	}

	/**
	 * Gets the fields as a set of HTML meta tags.
	 * @returns {String}
	 */
	getHeaders() {
		var quotes = /"/g, newlines = /(\r\n|\r|\n)/g, tags = /<\/?\w+.*?>/g,
			headers = "<title>"+(this.title || "").replace(tags,"")+"</title>\n"
		for (var key in this) {
			if (this[key]) {
				if (Array.isArray(this[key])) {
					const array2string = this[key].join(',');
					headers+='<meta name="'+key+'" content="'+array2string.replace(quotes, "&quot;").replace(newlines, " ")+'">';
				} else if (typeof this[key] === 'boolean') {
					headers+='<meta name="'+key+'" content="'+this[key]+'">';
				} else {
					headers+='<meta name="'+key+'" content="'+this[key].replace(quotes, "&quot;").replace(newlines, " ")+'">';
				}
			}
		}
		return headers;
	}

	/**
	 * Returns a clone of this Metadata
	 * @returns {Spyral.Metadata}
	 */
	clone() {
		let config = {};
		Object.assign(config, this);
		return new Metadata(config);
	}


}

export default Metadata
