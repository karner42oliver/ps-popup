(function() {
	'use strict';

	function Sortable(el, options) {
		this.el = el;
		this.options = options || {};
		this.dragging = null;
		this.placeholder = null;
		this.startIndex = -1;
		this._bind();
	}

	Sortable.create = function(el, options) {
		return new Sortable(el, options);
	};

	Sortable.prototype._bind = function() {
		var self = this;
		var items = this.el.children;
		var i;

		for ( i = 0; i < items.length; i += 1 ) {
			items[i].setAttribute('draggable', 'true');
		}

		this.el.addEventListener('dragstart', function(event) {
			self._onDragStart(event);
		});
		this.el.addEventListener('dragover', function(event) {
			self._onDragOver(event);
		});
		this.el.addEventListener('drop', function(event) {
			self._onDrop(event);
		});
		this.el.addEventListener('dragend', function(event) {
			self._onDragEnd(event);
		});
	};

	Sortable.prototype._onDragStart = function(event) {
		var handle = this.options.handle;
		var item = this._closestItem(event.target);
		var dragClass = this.options.dragClass || 'is-dragging';

		if ( ! item ) { return; }
		if ( handle && ! event.target.closest(handle) ) {
			event.preventDefault();
			return;
		}

		this.dragging = item;
		this.startIndex = this._indexOf(item);
		this.placeholder = this._createPlaceholder(item);
		this.dragging.classList.add(dragClass);

		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', '');

		window.requestAnimationFrame(function() {
			item.style.display = 'none';
		});
	};

	Sortable.prototype._onDragOver = function(event) {
		if ( ! this.dragging ) { return; }

		var target = this._closestItem(event.target);
		if ( ! target || target === this.placeholder || target === this.dragging ) {
			event.preventDefault();
			return;
		}

		var rect = target.getBoundingClientRect();
		var before = event.clientY < rect.top + rect.height / 2;

		if ( before ) {
			this.el.insertBefore(this.placeholder, target);
		} else {
			this.el.insertBefore(this.placeholder, target.nextSibling);
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	};

	Sortable.prototype._onDrop = function(event) {
		if ( ! this.dragging || ! this.placeholder ) { return; }

		event.preventDefault();
		this.el.insertBefore(this.dragging, this.placeholder);
	};

	Sortable.prototype._onDragEnd = function() {
		if ( ! this.dragging ) { return; }

		var dragClass = this.options.dragClass || 'is-dragging';
		var oldIndex = this.startIndex;
		var newIndex = this._indexOf(this.dragging);

		this.dragging.classList.remove(dragClass);
		this.dragging.style.display = '';

		if ( this.placeholder && this.placeholder.parentNode ) {
			this.placeholder.parentNode.removeChild(this.placeholder);
		}

		this.dragging = null;
		this.placeholder = null;
		this.startIndex = -1;

		if ( this.options.onEnd && oldIndex !== newIndex ) {
			this.options.onEnd({ oldIndex: oldIndex, newIndex: newIndex });
		}
	};

	Sortable.prototype._closestItem = function(node) {
		if ( ! node ) { return null; }
		if ( node === this.el ) { return null; }
		var selector = this.options.draggable || (this.el.tagName === 'TBODY' ? 'tr' : '*');
		var item = node.closest(selector);

		if ( ! item || item.parentNode !== this.el ) { return null; }
		return item;
	};

	Sortable.prototype._indexOf = function(item) {
		var i;
		var children = this.el.children;
		for ( i = 0; i < children.length; i += 1 ) {
			if ( children[i] === item ) { return i; }
		}
		return -1;
	};

	Sortable.prototype._createPlaceholder = function(item) {
		var placeholder = document.createElement(item.tagName);
		var placeholderClass = this.options.placeholderClass || 'sortable-placeholder';
		var height = item.offsetHeight;

		placeholder.className = placeholderClass;
		placeholder.style.height = height + 'px';

		if ( item.tagName === 'TR' ) {
			var cells = item.querySelectorAll('td,th');
			var cell = document.createElement('td');
			cell.colSpan = cells.length || 1;
			cell.innerHTML = '&nbsp;';
			placeholder.appendChild(cell);
		}

		return placeholder;
	};

	window.Sortable = Sortable;
})();
