import { Pass } from "./Pass.js";

export class StencilClearPass extends Pass {

	constructor() {
		super("StencilClearPass", null, null);
		this.needsSwap = false;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const stencil = renderer.state.buffers.stencil;
		stencil.setLocked(false);
		stencil.setTest(false);
	}

}
