import { Color } from "three";
import { Pass } from "./Pass.js";

const _savedColor = new Color();

export class BufferClearPass extends Pass {

	constructor(color = true, depth = true, stencil = false) {
		super("BufferClearPass", null, null);
		this.needsSwap = false;
		this.color = color;
		this.depth = depth;
		this.stencil = stencil;
		this.overrideClearColor = null;
		this.overrideClearAlpha = -1;
	}

	setClearFlags(color, depth, stencil) {
		this.color = color;
		this.depth = depth;
		this.stencil = stencil;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const clearAlpha = renderer.getClearAlpha();
		renderer.getClearColor(_savedColor);

		const hasColorOverride = this.overrideClearColor !== null;
		const hasAlphaOverride = this.overrideClearAlpha >= 0;

		if (hasColorOverride) {
			renderer.setClearColor(this.overrideClearColor, hasAlphaOverride ? this.overrideClearAlpha : clearAlpha);
		} else if (hasAlphaOverride) {
			renderer.setClearAlpha(this.overrideClearAlpha);
		}

		renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
		renderer.clear(this.color, this.depth, this.stencil);

		renderer.setClearColor(_savedColor, clearAlpha);
	}

}
