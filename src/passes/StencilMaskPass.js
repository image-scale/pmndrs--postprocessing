import {
	EqualStencilFunc,
	KeepStencilOp,
	ReplaceStencilOp,
	AlwaysStencilFunc
} from "three";
import { Pass } from "./Pass.js";
import { BufferClearPass } from "./BufferClearPass.js";

export class StencilMaskPass extends Pass {

	constructor(scene, camera) {
		super("StencilMaskPass", scene, camera);
		this.needsSwap = false;
		this.clearPass = new BufferClearPass(false, false, true);
		this.inverted = false;
	}

	set mainScene(value) { this.scene = value; }
	set mainCamera(value) { this.camera = value; }

	get clear() {
		return this.clearPass.enabled;
	}

	set clear(value) {
		this.clearPass.enabled = value;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const gl = renderer.getContext();
		const stencil = renderer.state.buffers.stencil;
		const colorWrite = renderer.state.buffers.color;
		const depthBuf = renderer.state.buffers.depth;

		const writeValue = this.inverted ? 0 : 1;
		const clearValue = this.inverted ? 1 : 0;

		colorWrite.setLocked(true);
		depthBuf.setLocked(true);

		stencil.setTest(true);
		stencil.setOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
		stencil.setFunc(gl.ALWAYS, writeValue, 0xffffffff);
		stencil.setClear(clearValue);

		if (this.clearPass.enabled) {
			renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
			renderer.clear(false, false, true);

			if (outputBuffer !== inputBuffer) {
				renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
				renderer.clear(false, false, true);
			}
		}

		renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
		renderer.render(this.scene, this.camera);

		if (outputBuffer !== inputBuffer) {
			renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
			renderer.render(this.scene, this.camera);
		}

		colorWrite.setLocked(false);
		depthBuf.setLocked(false);

		stencil.setFunc(gl.EQUAL, 1, 0xffffffff);
		stencil.setOp(gl.KEEP, gl.KEEP, gl.KEEP);
		stencil.setLocked(true);
	}

}
