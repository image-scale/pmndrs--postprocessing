import {
	WebGLRenderTarget,
	LinearFilter,
	Vector2,
	UnsignedByteType,
	SRGBColorSpace
} from "three";

import { Pass } from "./Pass.js";
import { GaussianBlurMaterial } from "../materials/GaussianBlurMaterial.js";
import { FrameCopyMaterial } from "../materials/FrameCopyMaterial.js";
import { Resolution } from "../core/Resolution.js";

export class GaussianBlurPass extends Pass {

	constructor({
		kernelSize = 35,
		iterations = 1,
		resolutionScale = 1.0,
		resolutionX,
		resolutionY
	} = {}) {
		super("GaussianBlurPass");

		this.renderTargetA = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});
		this.renderTargetA.texture.name = "GaussianBlurPass.TargetA";

		this.renderTargetB = this.renderTargetA.clone();
		this.renderTargetB.texture.name = "GaussianBlurPass.TargetB";

		this.blurMaterial = new GaussianBlurMaterial(kernelSize);
		this.copyMaterial = new FrameCopyMaterial();
		this.copyMaterial.inputBuffer = this.renderTargetB.texture;
		this.needsSwap = false;
		this._iterations = iterations;

		this.resolution = new Resolution(this,
			resolutionX || Resolution.AUTO_SIZE,
			resolutionY || Resolution.AUTO_SIZE,
			resolutionScale
		);
	}

	get texture() {
		return this.renderTargetB.texture;
	}

	get iterations() {
		return this._iterations;
	}

	set iterations(value) {
		this._iterations = value;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const blurMat = this.blurMaterial;
		const iterations = Math.max(this._iterations, 1);

		let previousBuffer = inputBuffer;

		for (let i = 0; i < iterations; i++) {
			this.fullscreenMaterial = blurMat;

			blurMat.direction.set(1, 0);
			blurMat.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(this.renderTargetA);
			renderer.render(this.scene, this.camera);

			blurMat.direction.set(0, 1);
			blurMat.inputBuffer = this.renderTargetA.texture;
			renderer.setRenderTarget(this.renderTargetB);
			renderer.render(this.scene, this.camera);

			if (i === 0 && iterations > 1) {
				previousBuffer = this.renderTargetB;
			}
		}

		this.fullscreenMaterial = this.copyMaterial;
		renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
		renderer.render(this.scene, this.camera);
	}

	setSize(width, height) {
		const r = this.resolution;
		r.setBaseSize(width, height);
		this.renderTargetA.setSize(r.width, r.height);
		this.renderTargetB.setSize(r.width, r.height);
		this.blurMaterial.setSize(width, height);
	}

	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== undefined) {
			this.renderTargetA.texture.type = frameBufferType;
			this.renderTargetB.texture.type = frameBufferType;
			if (frameBufferType !== UnsignedByteType) {
				this.blurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
				this.copyMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			}
			if (renderer && renderer.outputColorSpace === SRGBColorSpace) {
				this.renderTargetA.texture.colorSpace = SRGBColorSpace;
				this.renderTargetB.texture.colorSpace = SRGBColorSpace;
			}
		}
	}

}
