/**
 * Show contents in the results area.
 * @memberof Spyral.Util
 * @method show
 * @static
 * @param {*} contents The content to show. Tries to convert non-String and non-HTML variables.
 * @param {Object} config A config object containing attributes to add to the containing element.
 */
function show(contents, config = {}) {
	if (this && this.then) {
		var arg = contents;
		this.then(function(val) {
			show.call(val, val, arg);
		})
	} else {
		if (contents === undefined) {
			return;
		}

		if (document.querySelector('.spyral-dv-container') !== null) {
			document.querySelector('.spyral-dv-container').remove(); // get rid of dataviewer if it exists
		}
		
		if (contents.constructor === Object || Array.isArray(contents)) {
			return contents; // it's JSON so use the dataviewer
		}

		if (contents instanceof Node) {
			if (contents instanceof Element) {
				contents = contents.outerHTML;
			} else if ((contents instanceof Document || contents instanceof DocumentFragment) && contents.firstElementChild !== null) {
				if (contents.body) {
					contents = contents.body;
				}
				contents = contents.firstElementChild.outerHTML;
			}
		}
		if (contents.then) { // check if we currently have a promise
			return contents.then(function(text) {show(text, len)})
		}
		if (contents.toHtml) {contents=contents.toHtml()}
		else if (contents.getString) {contents=contents.getString()}
		else if (contents.toString) {contents=contents.toString()}

		if (contents.then) { // check again to see if we have a promise (like from toString())
			contents.then(function(text) {show(text, len)})
		} else {
			if (config['class'] === undefined) config['class'] = "info";
			var html = "<div";
			Object.keys(config).forEach(key => {
				var value = config[key];
				html += ` ${key}="${value}"`;
			})
			html += `>${contents}</div>`;
			document.body.insertAdjacentHTML('beforeend', html);
		}
	}
}

/**
 * Show an error in the results area.
 * @memberof Spyral.Util
 * @method showError
 * @static
 * @param {*} error 
 * @param {*} more 
 */
function showError(error, more) {
	if (error !== undefined && error instanceof Error) {
		if (error.stack && more === undefined) {
			more = error.stack;
		}
		// trim excess error stack (it's likely already in "more")
		error = error.toString().split(/(\r\n|\r|\n)/).shift();
	}

	if (more && typeof more !== 'string' && more instanceof String === false) {
		more = more.toString();
	}

	if (console) {console.error(error)}
	if (more) {
		var encodedMore = more.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&apos;')
		error='<strong>'+error.toString()+'</strong><pre><span style="cursor:pointer;text-decoration:underline;" onclick="this.nextElementSibling.style.display=\'block\';this.style.display=\'none\';">Details</span><span style="display:none;">'+encodedMore+'</span></pre>';
	}
	show(error, undefined, 'error');
}

export {show, showError};