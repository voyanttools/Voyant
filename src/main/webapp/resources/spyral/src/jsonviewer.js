/* global Spyral */ 

import Util from 'voyant/src/util';

/**
 * Based on code from https://github.com/renhongl/json-viewer-js
 * 
 * TODO add function support
 */

class JsonViewer {

	constructor(options) {
		let defaults = {
			container: document.body,
			data: '{}',
			name: 'result',
			expand: false
		};
		this.options = Object.assign(defaults, options);
		
		this.render();
	}

	render() {
		let data = this.options.data;
		let indent = 0;
		let parent = this.options.container;
		let key = this.options.name;
		let dataObj;
			
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
		let createdItem = this.createItem(indent, parent, key);
		this.renderChildren(key, dataObj, createdItem.right, indent, createdItem.left);
	}
	 
	createItem(indent, parent, key, basicType) {
		let self = this;
		let current = document.createElement('span');
		let left = document.createElement('span');
		let right = document.createElement('span');
	 
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
				let target = e.currentTarget;
				let collapsedParent = e.currentTarget.closest('.jv-collapsed');
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
	
	renderChildren(key, val, right, indent, left) {
		let self = this;
		
		let folder = this.getFolderIcon(this.options.expand);
	
		let isObj = Spyral.Util.isObject(val);
		if (isObj) {
			left.innerHTML = key + ': <span class="jv-type">Object</span><span class="jv-length">{' + Object.keys(val).length + '}</span> '
		} else {
			left.innerHTML = key + ': <span class="jv-type">Array</span><span class="jv-length">[' + val.length + ']</span> ';
		}
	
		left.append(folder);
		let state = this.options.expand ? 'jv-expanded' : 'jv-collapsed';
		right.setAttribute('class', 'jv-'+(isObj ? 'Object' : 'Array')+' jv-right ' + state);
	
		forEach(val, function(childVal, key) {
			let createdItem = self.createItem(indent+0, right, key, typeof childVal !== 'object');
			if (typeof childVal !== 'object') {
				self.renderRight(createdItem.right, childVal);
			} else {
				self.renderChildren(key, childVal, createdItem.right, indent+0, createdItem.left);
			}
		});
	}
	
	renderRight(right, val) {
		if (Spyral.Util.isNumber(val)) {
			right.setAttribute('class', 'jv-Number jv-right');
		} else if (Spyral.Util.isBoolean(val)) {
			right.setAttribute('class', 'jv-Boolean jv-right');
		} else if (val === 'null') {
			right.setAttribute('class', 'jv-Null jv-right');
		} else {
			right.setAttribute('class', 'jv-String jv-right');
		}
		right.innerText = val;
	}
	
	getFolderIcon(isExpanded) {
		let span = document.createElement('span');
		span.setAttribute('class', 'jv-folder-icon '+(isExpanded ? 'jv-expanded' : 'jv-collapsed'));
		span.innerHTML = '<svg width="8" height="8" class="open"><path d="M4 7L0 1h8z" fill="#000"></path></svg>'+'<svg width="8" height="8" class="closed"><path d="M7 4L1 8V0z" fill="#000"></path></svg>';
		return span;
	}
	 
	toggleItem(folderEl) {
		let iconEl = folderEl.querySelector('.jv-folder-icon');
		let contentsEl = folderEl.nextElementSibling;
		
		let doExpand = iconEl.classList.contains('jv-expanded') === false;
	
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
}

// Helper functions

function forEach(obj, fn) {
	if (Spyral.Util.isUndefined(obj) || Spyral.Util.isNull(obj)) {
		return;
	}
	if (typeof obj === 'object' && Spyral.Util.isArray(obj)) {
		for (let i = 0, l = obj.length; i < l; i++) {
			fn.call(null, obj[i], i, obj);
		}
	} else {
		for (let key in obj) {
			if (obj.hasOwnProperty(key)) {
				fn.call(null, obj[key] || 'null', key, obj);
			}
		}
	}
}

export default JsonViewer;