import { NearestFilter, WebGLRenderTarget } from "three";
import { AdaptiveLuminanceMaterial } from "../materials/AdaptiveLuminanceMaterial.js";
import { FrameCopyPass } from "./FrameCopyPass.js";
import { Pass } from "./Pass.js";

export class AdaptiveLuminancePass extends Pass {

	constructor(luminanceBuffer, { minLuminance = 0.01, adaptationRate = 1.0 } = {}) {
		super("AdaptiveLuminancePass");

		this.fullscreenMaterial = new AdaptiveLuminanceMaterial();
		this.needsSwap = false;

		this.renderTargetPrevious = new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		});
		this.renderTargetPrevious.texture.name = "Luminance.Previous";

		const material = this.fullscreenMaterial;
		material.luminanceBuffer0 = this.renderTargetPrevious.texture;
		material.luminanceBuffer1 = luminanceBuffer;
		material.minLuminance = minLuminance;
		material.adaptationRate = adaptationRate;

		this.renderTargetAdapted = this.renderTargetPrevious.clone();
		this.renderTargetAdapted.texture.name = "Luminance.Adapted";

		this.copyPass = new FrameCopyPass(this.renderTargetPrevious, false);
	}

	get texture() {
		return this.renderTargetAdapted.texture;
	}

	get adaptationRate() {
		return this.fullscreenMaterial.adaptationRate;
	}

	set adaptationRate(value) {
		this.fullscreenMaterial.adaptationRate = value;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		this.fullscreenMaterial.deltaTime = deltaTime;
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTargetAdapted);
		renderer.render(this.scene, this.camera);
		this.copyPass.render(renderer, this.renderTargetAdapted);
	}

}
