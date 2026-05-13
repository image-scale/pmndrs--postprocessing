import {
	WebGLRenderTarget,
	LinearFilter,
	UnsignedByteType,
	SRGBColorSpace
} from "three";

import { Pass } from "./Pass.js";
import { BoxBlurMaterial } from "../materials/BoxBlurMaterial.js";
import { FrameCopyMaterial } from "../materials/FrameCopyMaterial.js";
import { Resolution } from "../core/Resolution.js";

export class BoxBlurPass extends Pass {

	constructor({
		kernelSize = 5,
		iterations = 1,
		resolutionScale = 1.0,
		resolutionX,
		resolutionY
	} = {}) {
		super("BoxBlurPass");

		this.renderTargetA = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});
		this.renderTargetA.texture.name = "BoxBlurPass.TargetA";

		this.renderTargetB = this.renderTargetA.clone();
		this.renderTargetB.texture.name = "BoxBlurPass.TargetB";

		this.blurMaterial = new BoxBlurMaterial(kernelSize);
		this.copyMaterial = new FrameCopyMaterial();
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
			const buffer = (i % 2 === 0) ? this.renderTargetA : this.renderTargetB;
			this.fullscreenMaterial = blurMat;
			blurMat.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(buffer);
			renderer.render(this.scene, this.camera);
			previousBuffer = buffer;
		}

		this.fullscreenMaterial = this.copyMaterial;
		this.copyMaterial.inputBuffer = previousBuffer.texture;
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
