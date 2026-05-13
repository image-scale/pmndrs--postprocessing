import { Color, MeshNormalMaterial, NearestFilter, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution.js";
import { Pass } from "./Pass.js";
import { SceneRenderPass } from "./SceneRenderPass.js";

export class NormalPass extends Pass {

	constructor(scene, camera, {
		renderTarget,
		resolutionScale = 1.0,
		resolutionX = Resolution.AUTO_SIZE,
		resolutionY = Resolution.AUTO_SIZE
	} = {}) {

		super("NormalPass");
		this.needsSwap = false;

		this.renderPass = new SceneRenderPass(scene, camera, new MeshNormalMaterial());
		this.renderPass.ignoreBackground = true;
		this.renderPass.skipShadowMapUpdate = true;
		this.renderPass.clearPass.overrideClearColor = new Color(0x7777ff);
		this.renderPass.clearPass.overrideClearAlpha = 1.0;

		this.renderTarget = renderTarget || new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter
		});
		this.renderTarget.texture.name = "NormalPass.Target";

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
		this.renderPass.render(renderer, target, target);
	}

	setSize(width, height) {
		const r = this.resolution;
		r.setBaseSize(width, height);
		this.renderTarget.setSize(r.width, r.height);
	}

}
