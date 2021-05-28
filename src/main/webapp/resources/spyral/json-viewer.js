/**
 * Based on code from https://github.com/renhongl/json-viewer-js
 * 
 * TODO add function support
 */
 
function JsonViewer(options) {
	var defaults = {
		container: document.body,
		data: '{}',
		name: 'result',
		expand: false
	};
	this.options = Object.assign(defaults, options);
	this.render();
}

JsonViewer.prototype.render = function() {
	var data = this.options.data;
	var indent = 0;
	var parent = this.options.container;
	var key = this.options.name;
	var dataObj;
		
	parent.setAttribute('class', 'jv-container');
	if (typeof data === 'string') {
		try {
			dataObj = JSON.parse(data);
		} catch (error) {
			throw new Error('It is not a json format');
		}
	} else {
		dataObj = data;
	}
	var createdItem = this.createItem(indent, parent, key);
	this.renderChildren(key, dataObj, createdItem.right, indent, createdItem.left);
}
 
JsonViewer.prototype.createItem = function(indent, parent, key, basicType) {
	var self = this;
	var current = document.createElement('span');
	var left = document.createElement('span');
	var right = document.createElement('span');
 
	current.style.marginLeft = indent * 2 + 'px';
	left.innerHTML = key+':&nbsp;';
	current.appendChild(left);
	current.appendChild(right);
	parent.appendChild(current);
	current.setAttribute('class', 'jv-content');
	
	if (basicType) {
		left.setAttribute('class', 'jv-left');
	} else {
		left.setAttribute('class', 'jv-left jv-folder');
		left.onclick = function(e) {
			var target = e.currentTarget;
			var collapsedParent = e.currentTarget.closest('.jv-collapsed');
			if (collapsedParent !== null) {
				target = collapsedParent.previousElementSibling;
			}
			self.toggleItem(target);
			self.options.container.dispatchEvent(new Event('jv-toggle'));
		}
	}
		
	return {
		left: left,
		right: right,
		current: current,
	};
}

JsonViewer.prototype.renderChildren = function(key, val, right, indent, left) {
	var self = this;
	
	var folder = this.getFolderIcon(this.options.expand);

	var isObj = this.isObject(val);
	if (isObj) {
		left.innerHTML = key + ': <span class="jv-type">Object</span><span class="jv-length">{' + Object.keys(val).length + '}</span> '
	} else {
		left.innerHTML = key + ': <span class="jv-type">Array</span><span class="jv-length">[' + val.length + ']</span> ';
	}

	left.append(folder);
	var state = this.options.expand ? 'jv-expanded' : 'jv-collapsed';
	right.setAttribute('class', 'jv-'+(isObj ? 'Object' : 'Array')+' jv-right ' + state);

	this.forEach(val, function(childVal, key) {
		var createdItem = self.createItem(indent+0, right, key, typeof childVal !== 'object');
		if (typeof childVal !== 'object') {
			self.renderRight(createdItem.right, childVal);
		} else {
			self.renderChildren(key, childVal, createdItem.right, indent+0, createdItem.left);
		}
	});
}

JsonViewer.prototype.renderRight = function(right, val) {
	if (this.isNumber(val)) {
		right.setAttribute('class', 'jv-Number jv-right');
	} else if (this.isBoolean(val)) {
		right.setAttribute('class', 'jv-Boolean jv-right');
	} else if (val === 'null') {
		right.setAttribute('class', 'jv-Null jv-right');
	} else {
		right.setAttribute('class', 'jv-String jv-right');
	}
	right.innerText = val;
}

JsonViewer.prototype.getFolderIcon = function(isExpanded) {
	var span = document.createElement('span');
	span.setAttribute('class', 'jv-folder-icon '+(isExpanded ? 'jv-expanded' : 'jv-collapsed'));
	span.innerHTML = '<svg width="8" height="8" class="open"><path d="M4 7L0 1h8z" fill="#000"></path></svg>'+'<svg width="8" height="8" class="closed"><path d="M7 4L1 8V0z" fill="#000"></path></svg>';
	return span;
}
 
JsonViewer.prototype.toggleItem = function(folderEl) {
	var iconEl = folderEl.querySelector('.jv-folder-icon');
	var contentsEl = folderEl.nextElementSibling;
	
	var doExpand = iconEl.classList.contains('jv-expanded') === false;

	if (doExpand) {
		iconEl.classList.remove('jv-collapsed');
		iconEl.classList.add('jv-expanded');
		contentsEl.classList.remove('jv-collapsed');
		contentsEl.classList.add('jv-expanded');
	} else {
		iconEl.classList.remove('jv-expanded');
		iconEl.classList.add('jv-collapsed');
		contentsEl.classList.remove('jv-expanded');
		contentsEl.classList.add('jv-collapsed');
		contentsEl.querySelectorAll('.jv-expanded').forEach(function(expandedChild) {
			expandedChild.classList.remove('jv-expanded');
			expandedChild.classList.add('jv-collapsed');
		})
	}
}
 
JsonViewer.prototype.forEach = function(obj, fn) {
	if (this.isUndefined(obj) || this.isNull(obj)) {
		return;
	}
	if (typeof obj === 'object' && this.isArray(obj)) {
		for (var i = 0, l = obj.length; i < l; i++) {
			fn.call(null, obj[i], i, obj);
		}
	} else {
		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				fn.call(null, obj[key] || 'null', key, obj);
			}
		}
	}
}

JsonViewer.prototype.isString = function(val) {
    return typeof val === 'string';
}

JsonViewer.prototype.isNumber = function(val) {
    return typeof val === 'number';
}

JsonViewer.prototype.isBoolean = function(val) {
    return typeof val === 'boolean';
}

JsonViewer.prototype.isUndefined = function(val) {
    return typeof val === 'undefined';
}

JsonViewer.prototype.isArray = function(val) {
    return Object.prototype.toString.call(val) === '[object Array]';
}

JsonViewer.prototype.isObject = function(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
}

JsonViewer.prototype.isNull = function(val) {
    return Object.prototype.toString.call(val) === '[object Null]';
}