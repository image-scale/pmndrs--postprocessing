import {
	WebGLRenderTarget,
	LinearFilter,
	UnsignedByteType,
	SRGBColorSpace
} from "three";

import { Pass } from "./Pass.js";
import { KawaseBlurMaterial } from "../materials/KawaseBlurMaterial.js";
import { FrameCopyMaterial } from "../materials/FrameCopyMaterial.js";
import { Resolution } from "../core/Resolution.js";
import { KernelSize } from "../enums/index.js";

export class KawaseBlurPass extends Pass {

	constructor({
		kernelSize = KernelSize.MEDIUM,
		resolutionScale = 0.5,
		resolutionX,
		resolutionY
	} = {}) {
		super("KawaseBlurPass");

		this.renderTargetA = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});
		this.renderTargetA.texture.name = "KawaseBlurPass.TargetA";

		this.renderTargetB = this.renderTargetA.clone();
		this.renderTargetB.texture.name = "KawaseBlurPass.TargetB";

		this._blurMaterial = new KawaseBlurMaterial(kernelSize);
		this.copyMaterial = new FrameCopyMaterial();
		this.needsSwap = false;

		this.resolution = new Resolution(this,
			resolutionX || Resolution.AUTO_SIZE,
			resolutionY || Resolution.AUTO_SIZE,
			resolutionScale
		);
	}

	get blurMaterial() {
		return this._blurMaterial;
	}

	set blurMaterial(value) {
		this._blurMaterial = value;
	}

	get texture() {
		return this.renderTargetB.texture;
	}

	get kernelSize() {
		return this._blurMaterial.kernelSize;
	}

	set kernelSize(value) {
		this._blurMaterial.kernelSize = value;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const blurMat = this._blurMaterial;
		const sequence = blurMat.kernelSequence;

		let previousBuffer = inputBuffer;

		this.fullscreenMaterial = blurMat;

		for (let i = 0; i < sequence.length; i++) {
			const buffer = (i % 2 === 0) ? this.renderTargetA : this.renderTargetB;
			blurMat.uniforms.kernel.value = sequence[i];
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
		this._blurMaterial.setSize(width, height);
	}

	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== undefined) {
			this.renderTargetA.texture.type = frameBufferType;
			this.renderTargetB.texture.type = frameBufferType;
			if (frameBufferType !== UnsignedByteType) {
				this._blurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
				this.copyMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			}
			if (renderer && renderer.outputColorSpace === SRGBColorSpace) {
				this.renderTargetA.texture.colorSpace = SRGBColorSpace;
				this.renderTargetB.texture.colorSpace = SRGBColorSpace;
			}
		}
	}

}
