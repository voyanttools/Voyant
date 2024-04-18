/**
 * A utility for storing palettes and associations between terms and colors.
 */
Ext.define('Voyant.util.Colors', {

	config: {
		/**
		 * Palettes for use with terms and documents.
		 * @private
		 */
		palettes: undefined,
		/**
		 * For tracking associations between a term and a color (in rgb format), to ensure consistent coloring across tools.
		 * @private
		 */
		colorTermAssociations: {},
		/**
		 * For tracking the text color to use with the corresponding background color.
		 * @private
		 */
		textColorsForBackgroundColors: {}
	},

	d3Palettes: {
		categorical: ["Category10","Tableau10","Observable10","Set1","Set2","Set3","Accent","Dark2","Pastel1","Pastel2","Paired"],
		cyclical: ["Rainbow","Sinebow"],
		sequentialDiverging: ["BrBG","PRGn","PiYG","PuOr","RdBu","RdGy","RdYlBu","RdYlGn","Spectral"],
		sequentialMulti: ["BuGn","BuPu","GnBu","OrRd","PuBuGn","PuBu","PuRd","RdPu","YlGnBu","YlGn","YlOrBr","YlOrRd","Cividis","Viridis","Inferno","Magma","Plasma","Warm","Cool","CubehelixDefault","Turbo"],
		sequentialSingle: ["Blues","Greens","Greys","Oranges","Purples","Reds"]
	},

	lastUsedPaletteIndex: -1, // for tracking the last palette index that was used when getting a new color for a term

	constructor: function(config) {
		this.setPalettes({
			'default': [[0, 0, 255], [51, 197, 51], [255, 0, 255], [121, 51, 255], [28, 255, 255], [255, 174, 0], [30, 177, 255], [182, 242, 58], [255, 0, 164], [51, 102, 153], [34, 111, 52], [155, 20, 104], [109, 43, 157], [128, 130, 33], [111, 76, 10], [119, 115, 165], [61, 177, 169], [202, 135, 115], [194, 169, 204], [181, 212, 228], [182, 197, 174], [255, 197, 197], [228, 200, 124], [197, 179, 159]]
		});
		this.resetColorTermAssociations();

		// palettes
		if (d3 !== undefined) {
			this.d3Palettes.categorical.forEach(function(palName) {
				var rgbs = d3.scaleOrdinal(d3['scheme'+palName]).range().map(function(val) { return this.hexToRgb(val); }, this);
				this.addColorPalette(palName, rgbs);
			}, this);
		}
		
		var extjs = Ext.create('Ext.chart.theme.Base').getColors().map(function(val) { return this.hexToRgb(val); }, this);
		this.addColorPalette('extjs', extjs);
	},

	resetColorTermAssociations: function() {
		this.lastUsedPaletteIndex = -1;
		this.setColorTermAssociations({});
		this.setTextColorsForBackgroundColors({});
	},

	rgbToHex: function(a) {
		return "#" + ((1 << 24) + (a[0] << 16) + (a[1] << 8) + a[2]).toString(16).slice(1);
	},
	
	hexToRgb: function(hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		] : null;
	},

	/**
	 * Adds a new palette to the list.
	 * @param key {String} The palette name.
	 * @param values {Array} The array of colors. Format: [[r,g,b],[r,g,b],....]
	 */
	addColorPalette: function(key, values) {
		this.getPalettes()[key] = values;
	},

	/**
	 * Gets the whole color palette.
	 * @param {String} [key] The key of the palette to return.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of each color (optional, defaults to rgb values).
	 * @return {Array} The color palette.
	 * @private
	 */
	getColorPalette: function(key, returnHex) {
		var paletteKey = key || 'default';
		var palette = this.getPalettes()[paletteKey];
		if (palette === undefined) {
			palette = [];
		}
		if (returnHex) {
			var colors = [];
			for (var i = 0; i < palette.length; i++) {
				colors.push(this.rgbToHex(palette[i]));
			}
			return colors;
		} else {
			return palette;
		}
	},

	saveCustomColorPalette: function(paletteArray) {
		var dfd = new Ext.Deferred();

		Ext.Ajax.request({
			url: this.getTromboneUrl(),
			params: {
				tool: 'resource.StoredResource',
				storeResource: Ext.encode(paletteArray)
			},
			success: function(response, req) {
				var json = Ext.util.JSON.decode(response.responseText);
				var id = json.storedResource.id;
				this.addColorPalette(id, paletteArray);
				
				dfd.resolve(id, paletteArray);
			},
			failure: function(response) {
				dfd.reject();
			},
			scope: this
		});

		return dfd.promise;
	},
	
	loadCustomColorPalette: function(paletteId) {
		var dfd = new Ext.Deferred();

		Ext.Ajax.request({
			url: this.getTromboneUrl(),
			params: {
				tool: 'resource.StoredResource',
				retrieveResourceId: paletteId
			},
			success: function(response, req) {
				var json = Ext.util.JSON.decode(response.responseText);
				var value = json.storedResource.resource;
				var palette = Ext.decode(value);
				// TODO should palette api param be set here?
				this.addColorPalette(paletteId, palette);

				dfd.resolve(paletteId, palette);
			},
			failure: function(response) {
				this.setApiParam('palette', undefined);

				dfd.reject();
			},
			scope: this
		});

		return dfd.promise;
	},


	/**
	 * Gets a particular color from the palette.
	 * @param {String} key The palette key.
	 * @param {Integer} index The index of the color to get.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 * @private
	 */
	getColor: function(key, index, returnHex) {
		var paletteKey = key || 'default';
		var palette = this.getPalettes()[paletteKey];
		if (index >= palette.length) {
			index = index % palette.length;
		}
		if (returnHex) {
			return this.rgbToHex(palette[index]);
		} else {
			return palette[index];
		}
	},

	/**
	 * Gets the color associated with the term.  Creates a new association if none exists.
	 * @param {String} key The palette key.
	 * @param {String} term The term to get the color for.
	 * @param {Boolean} [returnHex] True to return a hexadecimal representation of the color (optional, defaults to rgb values).
	 * @return {Mixed} The requested color, either a hex string or array of rgb values.
	 * @private
	 */
	getColorForTerm: function(key, term, returnHex) {
		var paletteKey = key || 'default';
		var palette = this.getPalettes()[paletteKey];

		if (palette === undefined) {
			console.warn('no palette found for',key);
			palette = this.getPalettes()['default'];
		}

		if (term.indexOf(':') != -1) {
			term = term.split(':')[1];
		}
		term = term.toLowerCase();

		var color = this.getColorTermAssociations()[term];
		if (color === undefined) {
			var index = this.lastUsedPaletteIndex+1;
			index %= palette.length;
			color = palette[index];
			this.getColorTermAssociations()[term] = color;
			this.lastUsedPaletteIndex = index;
		}
		if (returnHex) {
			color = this.rgbToHex(color);
		}
		return color;
	},

	/**
	 * Set the color assocation for a term.
	 * @param {String} term The term
	 * @param {Array} color An array of RGB values
	 */
	setColorForTerm: function(term, color) {
		if (Array.isArray(color) === false) {
			color = this.hexToRgb(color);
		}
		term = term.toLowerCase();
		this.getColorTermAssociations()[term] = color;
	},

	getColorForEntityType: function(type, returnHex) {
		var index;
		switch(type) {
			case 'person':
				index = 5;
				break;
			case 'location':
				index = 6;
				break;
			case 'organization':
				index = 2;
				break;
			case 'misc':
				index = 0;
				break;
			case 'time':
			case 'date':
			case 'duration':
				index = 4;
				break;
			case 'money':
				index = 1;
				break;
			default:
				index = 8;
		}

		var color = this.getPalettes()['d3_set3'][index];
		if (returnHex) {
			color = this.rgbToHex(color);
		}
		return color;
	},

	/**
	 * Accessible Perceptual Contrast Algorithm adapted from https://github.com/Myndex/apca-w3
	 * @param {Array} background An array of RGB values
	 * @param {Array} foreground An array of RGB values
	 * @return {Number}
	 */
	getColorContrast: function(background, foreground) {

		// exponents
		const normBG = 0.56;
		const normTXT = 0.57;
		const revTXT = 0.62;
		const revBG = 0.65;

		// clamps
		const blkThrs = 0.022;
		const blkClmp = 1.414;
		const loClip = 0.1;
		const deltaYmin = 0.0005;

		// scalers
		// see https://github.com/w3c/silver/issues/645
		const scaleBoW = 1.14;
		const loBoWoffset = 0.027;
		const scaleWoB= 1.14;
		const loWoBoffset = 0.027;

		function fclamp (Y) {
			if (Y >= blkThrs) {
				return Y;
			}
			return Y + (blkThrs - Y) ** blkClmp;
		}

		function linearize (val) {
			let sign = val < 0? -1 : 1;
			let abs = Math.abs(val);
			return sign * Math.pow(abs, 2.4);
		}

		let S;
		let C;
		let Sapc;

		// Myndex as-published, assumes sRGB inputs
		let R, G, B;

		// Calculates "screen luminance" with non-standard simple gamma EOTF
		// weights should be from CSS Color 4, not the ones here which are via Myndex and copied from Lindbloom
		[R, G, B] = foreground;
		let lumTxt = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.0721750;

		[R, G, B] = background;
		let lumBg = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.0721750;

		// toe clamping of very dark values to account for flare
		let Ytxt = fclamp(lumTxt);
		let Ybg = fclamp(lumBg);

		// are we "Black on White" (dark on light), or light on dark?
		let BoW = Ybg > Ytxt;

		// why is this a delta, when Y is not perceptually uniform?
		// Answer: it is a noise gate, see
		// https://github.com/LeaVerou/color.js/issues/208
		if (Math.abs(Ybg - Ytxt) < deltaYmin) {
			C = 0;
		}
		else {
			if (BoW) {
				// dark text on light background
				S = Ybg ** normBG - Ytxt ** normTXT;
				C = S * scaleBoW;
			}
			else {
				// light text on dark background
				S = Ybg ** revBG - Ytxt ** revTXT;
				C = S * scaleWoB;
			}
		}
		if (Math.abs(C) < loClip) {
			Sapc = 0;
		}
		else if (C > 0) {
			// not clear whether Woffset is loBoWoffset or loWoBoffset
			// but they have the same value
			Sapc = C - loBoWoffset;
		}
		else {
			Sapc = C + loBoWoffset;
		}

		return Sapc * 100;
	},

	/**
	 * Returns either black or white color, depending on the supplied background color.
	 * @param {Array} backgroundColor An array of RGB values
	 * @returns {Array}
	 */
	getTextColorForBackground: function(backgroundColor) {
		var textColor = this.getTextColorsForBackgroundColors()[backgroundColor.join('')];
		if (textColor === undefined) {
			var darkText = [0,0,0];
			var lightText = [255,255,255];
			var darkContrast = Math.abs(this.getColorContrast(backgroundColor, darkText));
			var lightContrast = Math.abs(this.getColorContrast(backgroundColor, lightText));
			textColor = lightContrast > darkContrast ? lightText : darkText;
			this.getTextColorsForBackgroundColors()[backgroundColor.join('')] = textColor;
		}
		return textColor;
	}
})
