let _nextLayer = 2;

export class Selection extends Set {

	constructor(iterable, layer) {
		super();
		this._layer = (layer !== undefined) ? layer : _nextLayer++;
		this.exclusive = false;

		if (iterable) {
			for (const obj of iterable) {
				this.add(obj);
			}
		}
	}

	get layer() {
		return this._layer;
	}

	set layer(value) {
		const oldLayer = this._layer;
		this._layer = value;
		for (const obj of this) {
			obj.layers.disable(oldLayer);
			if (this.exclusive) {
				obj.layers.set(value);
			} else {
				obj.layers.enable(value);
			}
		}
	}

	add(object) {
		if (this.exclusive) {
			object.layers.set(this._layer);
		} else {
			object.layers.enable(this._layer);
		}
		return super.add(object);
	}

	delete(object) {
		object.layers.disable(this._layer);
		return super.delete(object);
	}

	toggle(object) {
		if (this.has(object)) {
			this.delete(object);
			return false;
		} else {
			this.add(object);
			return true;
		}
	}

	clear() {
		for (const obj of this) {
			obj.layers.disable(this._layer);
		}
		super.clear();
	}

	set(objects) {
		this.clear();
		for (const obj of objects) {
			this.add(obj);
		}
	}

	setVisible(visible) {
		for (const obj of this) {
			if (visible) {
				obj.layers.enable(0);
			} else {
				obj.layers.disable(0);
			}
		}
	}

}
