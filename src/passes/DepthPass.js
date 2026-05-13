import { Color, MeshDepthMaterial, NearestFilter, RGBADepthPacking, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution.js";
import { Pass } from "./Pass.js";
import { SceneRenderPass } from "./SceneRenderPass.js";

export class DepthPass extends Pass {

	constructor(scene, camera, {
		renderTarget,
		resolutionScale = 1.0,
		resolutionX = Resolution.AUTO_SIZE,
		resolutionY = Resolution.AUTO_SIZE
	} = {}) {

		super("DepthPass");
		this.needsSwap = false;

		this.renderPass = new SceneRenderPass(scene, camera, new MeshDepthMaterial({
			depthPacking: RGBADepthPacking
		}));
		this.renderPass.skipShadowMapUpdate = true;
		this.renderPass.ignoreBackground = true;

		this.renderTarget = renderTarget || new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter
		});
		this.renderTarget.texture.name = "DepthPass.Target";

		this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		this.resolution.addEventListener("change", () => {
			this.setSize(this.resolution.baseWidth, this.resolution.baseHeight);
		});
	}

	set mainScene(value) {
		this.renderPass.mainScene = value;
	}

	set mainCamera(value) {
		this.renderPass.mainCamera = value;
	}

	get texture() {
		return this.renderTarget.texture;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const target = this.renderToScreen ? null : this.renderTarget;
		this.renderPass.render(renderer, target);
	}

	setSize(width, height) {
		const r = this.resolution;
		r.setBaseSize(width, height);
		this.renderTarget.setSize(r.width, r.height);
	}

	initialize(renderer, alpha, frameBufferType) {
		const clearColor = renderer.capabilities.reversedDepthBuffer ? 0x000000 : 0xffffff;
		const clearPass = this.renderPass.clearPass;
		clearPass.overrideClearColor = new Color(clearColor);
		clearPass.overrideClearAlpha = 1;
	}

}
