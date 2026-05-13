import { EventDispatcher, Vector2 } from "three";

export class Resolution extends EventDispatcher {

	static AUTO_SIZE = -1;

	constructor(resizable = null, width = Resolution.AUTO_SIZE, height = Resolution.AUTO_SIZE, scale = 1.0) {
		super();
		this._resizable = resizable;
		this._baseSize = new Vector2(1, 1);
		this._preferredSize = new Vector2(width, height);
		this._scale = scale;
		this._effectiveSize = new Vector2(1, 1);

		if (resizable !== null) {
			this.addEventListener("change", () => {
				this._updateEffectiveSize();
				resizable.setSize(this._effectiveSize.x, this._effectiveSize.y);
			});
		}
	}

	get width() {
		this._updateEffectiveSize();
		return this._effectiveSize.x;
	}

	set width(value) {
		this.preferredWidth = value;
	}

	get height() {
		this._updateEffectiveSize();
		return this._effectiveSize.y;
	}

	set height(value) {
		this.preferredHeight = value;
	}

	getWidth() { return this.width; }
	getHeight() { return this.height; }

	get scale() {
		return this._scale;
	}

	set scale(value) {
		if (this._scale !== value) {
			this._scale = value;
			this._preferredSize.set(Resolution.AUTO_SIZE, Resolution.AUTO_SIZE);
			this.dispatchEvent({ type: "change" });
		}
	}

	getScale() { return this._scale; }

	setScale(value) {
		this.scale = value;
	}

	get baseWidth() {
		return this._baseSize.x;
	}

	set baseWidth(value) {
		if (this._baseSize.x !== value) {
			this._baseSize.x = value;
			this.dispatchEvent({ type: "change" });
		}
	}

	get baseHeight() {
		return this._baseSize.y;
	}

	set baseHeight(value) {
		if (this._baseSize.y !== value) {
			this._baseSize.y = value;
			this.dispatchEvent({ type: "change" });
		}
	}

	getBaseWidth() { return this._baseSize.x; }
	getBaseHeight() { return this._baseSize.y; }

	setBaseSize(width, height) {
		if (this._baseSize.x !== width || this._baseSize.y !== height) {
			this._baseSize.set(width, height);
			this.dispatchEvent({ type: "change" });
		}
	}

	get preferredWidth() {
		return this._preferredSize.x;
	}

	set preferredWidth(value) {
		if (this._preferredSize.x !== value) {
			this._preferredSize.x = value;
			this.dispatchEvent({ type: "change" });
		}
	}

	get preferredHeight() {
		return this._preferredSize.y;
	}

	set preferredHeight(value) {
		if (this._preferredSize.y !== value) {
			this._preferredSize.y = value;
			this.dispatchEvent({ type: "change" });
		}
	}

	setPreferredWidth(value) { this.preferredWidth = value; }
	setPreferredHeight(value) { this.preferredHeight = value; }

	setPreferredSize(width, height) {
		if (this._preferredSize.x !== width || this._preferredSize.y !== height) {
			this._preferredSize.set(width, height);
			this.dispatchEvent({ type: "change" });
		}
	}

	_updateEffectiveSize() {
		const base = this._baseSize;
		const pref = this._preferredSize;
		const auto = Resolution.AUTO_SIZE;
		let w, h;

		if (pref.x !== auto && pref.y !== auto) {
			w = pref.x;
			h = pref.y;
		} else if (pref.x !== auto && pref.y === auto) {
			w = pref.x;
			h = Math.round(pref.x / (base.x / base.y));
		} else if (pref.x === auto && pref.y !== auto) {
			h = pref.y;
			w = Math.round(pref.y * (base.x / base.y));
		} else {
			w = Math.round(base.x * this._scale);
			h = Math.round(base.y * this._scale);
		}

		this._effectiveSize.set(Math.max(w, 1), Math.max(h, 1));
	}

	copy(resolution) {
		this._scale = resolution._scale;
		this._baseSize.copy(resolution._baseSize);
		this._preferredSize.copy(resolution._preferredSize);
		this.dispatchEvent({ type: "change" });
	}

}
