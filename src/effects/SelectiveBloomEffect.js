import {
	BasicDepthPacking,
	Color,
	NotEqualDepth,
	EqualDepth,
	RGBADepthPacking,
	SRGBColorSpace,
	WebGLRenderTarget
} from "three";

import { Selection } from "../core/Selection.js";
import { DepthTestStrategy, EffectAttribute } from "../enums/index.js";
import { DepthMaskMaterial } from "../materials/DepthMaskMaterial.js";
import { BufferClearPass } from "../passes/BufferClearPass.js";
import { DepthPass } from "../passes/DepthPass.js";
import { MaterialPass } from "../passes/MaterialPass.js";
import { BloomEffect } from "./BloomEffect.js";

export class SelectiveBloomEffect extends BloomEffect {

	constructor(scene, camera, options) {

		super(options);

		this.setAttributes(this.getAttributes() | EffectAttribute.DEPTH);

		this.camera = camera;

		this.depthPass = new DepthPass(scene, camera);

		this.clearPass = new BufferClearPass(true, false, false);
		this.clearPass.overrideClearColor = new Color(0x000000);

		this.depthMaskPass = new MaterialPass(new DepthMaskMaterial());

		const maskMat = this.depthMaskMaterial;
		maskMat.copyCameraSettings(camera);
		maskMat.depthBuffer1 = this.depthPass.texture;
		maskMat.depthPacking1 = RGBADepthPacking;
		maskMat.depthMode = EqualDepth;

		this.renderTargetMasked = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTargetMasked.texture.name = "Bloom.Masked";

		this.selection = new Selection();

		this._inverted = false;
		this._ignoreBackground = false;
	}

	set mainScene(value) {
		this.depthPass.mainScene = value;
	}

	set mainCamera(value) {
		this.camera = value;
		this.depthPass.mainCamera = value;
		this.depthMaskMaterial.copyCameraSettings(value);
	}

	get depthMaskMaterial() {
		return this.depthMaskPass.fullscreenMaterial;
	}

	get inverted() {
		return this._inverted;
	}

	set inverted(value) {
		this._inverted = value;
		this.depthMaskMaterial.depthMode = value ? NotEqualDepth : EqualDepth;
	}

	get ignoreBackground() {
		return this._ignoreBackground;
	}

	set ignoreBackground(value) {
		this._ignoreBackground = value;
		this.depthMaskMaterial.maxDepthStrategy = value
			? DepthTestStrategy.DISCARD_MAX_DEPTH
			: DepthTestStrategy.KEEP_MAX_DEPTH;
	}

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
		this.depthMaskMaterial.depthBuffer0 = depthTexture;
		this.depthMaskMaterial.depthPacking0 = depthPacking;
	}

	update(renderer, inputBuffer, deltaTime) {
		const camera = this.camera;
		const selection = this.selection;
		let renderTarget = inputBuffer;

		if (this.ignoreBackground || !this.inverted || selection.size > 0) {
			const mask = camera.layers.mask;
			camera.layers.set(selection.layer);
			this.depthPass.render(renderer);
			camera.layers.mask = mask;

			renderTarget = this.renderTargetMasked;
			this.clearPass.render(renderer, renderTarget);
			this.depthMaskPass.render(renderer, inputBuffer, renderTarget);
		}

		super.update(renderer, renderTarget, deltaTime);
	}

	setSize(width, height) {
		super.setSize(width, height);
		this.renderTargetMasked.setSize(width, height);
		this.depthPass.setSize(width, height);
	}

	initialize(renderer, alpha, frameBufferType) {
		super.initialize(renderer, alpha, frameBufferType);

		this.clearPass.initialize(renderer, alpha, frameBufferType);
		this.depthPass.initialize(renderer, alpha, frameBufferType);
		this.depthMaskPass.initialize(renderer, alpha, frameBufferType);

		if (renderer !== null && renderer.capabilities.logarithmicDepthBuffer) {
			this.depthMaskPass.fullscreenMaterial.defines.LOG_DEPTH = "1";
		}

		if (frameBufferType !== undefined) {
			this.renderTargetMasked.texture.type = frameBufferType;

			if (renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {
				this.renderTargetMasked.texture.colorSpace = SRGBColorSpace;
			}
		}
	}

}
