import { Pass } from "./Pass.js";

export class CallbackPass extends Pass {

	constructor(callback) {
		super("CallbackPass", null, null);
		this.needsSwap = false;
		this._callback = callback;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		if (this._callback) {
			this._callback();
		}
	}

}
