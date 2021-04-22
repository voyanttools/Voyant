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
			// if (Voyant.notebook.util.Show.SINGLE_LINE_MODE==false) {
			contents="<div class='"+mode+"'>"+contents+"</div>";
			// }
			// Voyant.notebook.util.Show.TARGET.insertHtml('beforeEnd',contents);
			document.body.insertAdjacentHTML('beforeend', contents);
		}
	}
}

function showError(error, more) {
	// if (Voyant && Voyant.util && Voyant.util.ResponseError) {
	// 	if (this instanceof Voyant.util.ResponseError) {
	// 		error = this;
	// 	}
	// 	if (error instanceof Voyant.util.ResponseError) {
	// 		if (console) {
	// 			console.error(error.getResponse());
	// 		}
	// 		more = error.getResponse().responseText
	// 		error = error.getMsg();
	// 	}
	// }

	if (error !== undefined && error.stack && !more) {
		more = error.stack;
	}
	if (more && typeof more !== 'string' && more instanceof String === false) {
		more = more.toString();
	}

	if (console) {console.error(error)}
	if (more) {
		if (console) {
			console.error(more);
		}
		encodedMore = more.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&apos;')
		error="<h3>"+error.toString()+"</h3><pre>"+encodedMore+'</pre>';
	}
	show(error, undefined, 'error');
}

export {show, showError};