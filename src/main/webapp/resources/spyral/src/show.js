/**
 * Show contents in the results area.
 * @memberof Spyral.Util
 * @method show
 * @static
 * @param {*} contents 
 * @param {*} len 
 * @param {*} mode 
 */
function show(contents, len, mode='info') {
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
		
		if (Array.isArray(contents)) {
			var allContents = "";
			contents.forEach(function(content) {
				allContents += content.getString ? content.getString() : content.toString();
			});
			contents = allContents;
		} else if (typeof this === 'string' || this instanceof String) {
			if (typeof contents === 'number' && isFinite(contents)) {
				len = contents;
			}
			contents = this;
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
			if (len && typeof len === 'number' && isFinite(len)) {
				contents = contents.substring(0,len);
			}
			contents="<div class='"+mode+"'>"+contents+"</div>";
			document.body.insertAdjacentHTML('beforeend', contents);
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