import {
	WebGLRenderTarget,
	LinearFilter,
	UnsignedByteType,
	SRGBColorSpace
} from "three";

import { Pass } from "./Pass.js";
import { BrightnessMaterial } from "../materials/BrightnessMaterial.js";
import { Resolution } from "../core/Resolution.js";

export class BrightnessPass extends Pass {

	constructor({
		renderTarget,
		luminanceRange,
		colorOutput,
		resolutionScale = 1.0,
		resolutionX,
		resolutionY
	} = {}) {
		super("BrightnessPass");
		this.fullscreenMaterial = new BrightnessMaterial(colorOutput, luminanceRange);
		this.needsSwap = false;

		this.renderTarget = renderTarget || new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});
		this.renderTarget.texture.name = "BrightnessPass.Target";

		this.resolution = new Resolution(this,
			resolutionX || Resolution.AUTO_SIZE,
			resolutionY || Resolution.AUTO_SIZE,
			resolutionScale
		);
	}

	get texture() {
		return this.renderTarget.texture;
	}

	get luminanceMaterial() {
		return this.fullscreenMaterial;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		this.fullscreenMaterial.inputBuffer = inputBuffer.texture;
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);
	}

	setSize(width, height) {
		const r = this.resolution;
		r.setBaseSize(width, height);
		this.renderTarget.setSize(r.width, r.height);
	}

	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== undefined) {
			this.renderTarget.texture.type = frameBufferType;
			if (frameBufferType !== UnsignedByteType) {
				this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			}
			if (renderer && renderer.outputColorSpace === SRGBColorSpace) {
				this.renderTarget.texture.colorSpace = SRGBColorSpace;
			}
		}
	}

}
