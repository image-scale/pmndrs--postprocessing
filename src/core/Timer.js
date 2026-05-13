export class Timer {

	constructor() {
		this.startTime = performance.now();
		this.previousTime = 0;
		this.currentTime = 0;
		this._delta = 0;
		this._elapsed = 0;
		this._fixedDelta = 1000 / 60;
		this.timescale = 1.0;
		this.useFixedDelta = false;
		this._autoReset = false;
		this._handleVisibility = (e) => this.handleEvent(e);
	}

	get delta() {
		return this._delta / 1000;
	}

	get elapsed() {
		return this._elapsed / 1000;
	}

	get fixedDelta() {
		return this._fixedDelta / 1000;
	}

	set fixedDelta(value) {
		this._fixedDelta = value * 1000;
	}

	get autoReset() {
		return this._autoReset;
	}

	set autoReset(value) {
		if (this._autoReset !== value) {
			this._autoReset = value;
			if (typeof document !== "undefined") {
				if (value) {
					document.addEventListener("visibilitychange", this._handleVisibility);
				} else {
					document.removeEventListener("visibilitychange", this._handleVisibility);
				}
			}
		}
	}

	getDelta() {
		return this.delta;
	}

	getElapsed() {
		return this.elapsed;
	}

	update(timestamp) {
		if (this.useFixedDelta) {
			this._delta = this._fixedDelta * this.timescale;
		} else {
			const time = (timestamp !== undefined) ? timestamp : performance.now();
			this._delta = (time - (this.currentTime || time)) * this.timescale;
			this.currentTime = time;
		}

		this._elapsed += this._delta;
	}

	reset() {
		this._delta = 0;
		this._elapsed = 0;
		this.currentTime = performance.now();
	}

	handleEvent(e) {
		if (typeof document !== "undefined" && !document.hidden) {
			this.currentTime = performance.now();
		}
	}

	dispose() {
		this.autoReset = false;
	}

}
