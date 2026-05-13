import {
	BasicDepthPacking,
	FloatType,
	NearestFilter,
	RGBADepthPacking,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { DepthCopyMaterial } from "../materials/DepthCopyMaterial.js";
import { Pass } from "./Pass.js";

export class DepthCopyPass extends Pass {

	constructor({ depthPacking = RGBADepthPacking } = {}) {
		super("DepthCopyPass");

		const material = new DepthCopyMaterial();
		material.outputDepthPacking = depthPacking;
		this.fullscreenMaterial = material;
		this.needsDepthTexture = true;
		this.needsSwap = false;

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			type: (depthPacking === RGBADepthPacking) ? UnsignedByteType : FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		});
		this.renderTarget.texture.name = "DepthCopyPass.Target";
	}

	get texture() {
		return this.renderTarget.texture;
	}

	get depthPacking() {
		return this.fullscreenMaterial.outputDepthPacking;
	}

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
		this.fullscreenMaterial.depthBuffer = depthTexture;
		this.fullscreenMaterial.inputDepthPacking = depthPacking;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);
	}

	setSize(width, height) {
		this.renderTarget.setSize(width, height);
	}

}
