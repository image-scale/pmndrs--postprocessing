import { BasicDepthPacking, FloatType, NearestFilter, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution.js";
import { DepthDownsamplingMaterial } from "../materials/DepthDownsamplingMaterial.js";
import { Pass } from "./Pass.js";

export class DepthDownsamplingPass extends Pass {

	constructor({
		normalBuffer = null,
		resolutionScale = 0.5,
		resolutionX = Resolution.AUTO_SIZE,
		resolutionY = Resolution.AUTO_SIZE
	} = {}) {

		super("DepthDownsamplingPass");

		const material = new DepthDownsamplingMaterial();
		material.normalBuffer = normalBuffer;
		this.fullscreenMaterial = material;
		this.needsDepthTexture = true;
		this.needsSwap = false;

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false,
			type: FloatType
		});
		this.renderTarget.texture.name = "DepthDownsamplingPass.Target";
		this.renderTarget.texture.generateMipmaps = false;

		this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		this.resolution.addEventListener("change", () => {
			this.setSize(this.resolution.baseWidth, this.resolution.baseHeight);
		});
	}

	get texture() {
		return this.renderTarget.texture;
	}

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
		this.fullscreenMaterial.depthBuffer = depthTexture;
		this.fullscreenMaterial.depthPacking = depthPacking;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);
	}

	setSize(width, height) {
		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		this.renderTarget.setSize(resolution.width, resolution.height);
		this.fullscreenMaterial.setSize(width, height);
	}

	initialize(renderer, alpha, frameBufferType) {
		const gl = renderer.getContext();
		const renderable = gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float");
		if (!renderable) {
			throw new Error("Rendering to float texture is not supported.");
		}
	}

}
