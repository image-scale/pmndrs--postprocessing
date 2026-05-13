import { Pass } from "./Pass.js";
import { BufferClearPass } from "./BufferClearPass.js";
import { OverrideMaterialManager } from "../core/OverrideMaterialManager.js";

export class SceneRenderPass extends Pass {

	constructor(scene, camera, overrideMaterial = null) {
		super("SceneRenderPass", scene, camera);
		this.needsSwap = false;
		this.needsDepthBlit = true;
		this.clearPass = new BufferClearPass();
		this._overrideManager = overrideMaterial !== null
			? new OverrideMaterialManager(overrideMaterial)
			: null;
		this.ignoreBackground = false;
		this.skipShadowMapUpdate = false;
		this.selection = null;
	}

	set mainScene(value) { this.scene = value; }
	set mainCamera(value) { this.camera = value; }

	get overrideMaterial() {
		return this._overrideManager !== null ? this._overrideManager.material : null;
	}

	set overrideMaterial(value) {
		if (value !== null) {
			if (this._overrideManager !== null) {
				this._overrideManager.setMaterial(value);
			} else {
				this._overrideManager = new OverrideMaterialManager(value);
			}
		} else if (this._overrideManager !== null) {
			this._overrideManager.dispose();
			this._overrideManager = null;
		}
	}

	get clear() {
		return this.clearPass.enabled;
	}

	set clear(value) {
		this.clearPass.enabled = value;
	}

	set renderToScreen(value) {
		super.renderToScreen = value;
		this.clearPass.renderToScreen = value;
	}

	get renderToScreen() {
		return super.renderToScreen;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const scene = this.scene;
		const camera = this.camera;

		const savedLayersMask = camera.layers.mask;
		const savedBackground = scene.background;
		const savedAutoUpdate = renderer.shadowMap.autoUpdate;

		if (this.selection !== null) {
			camera.layers.mask = this.selection.layer;
		}

		if (this.skipShadowMapUpdate) {
			renderer.shadowMap.autoUpdate = false;
		}

		if (this.ignoreBackground || (this.clearPass.overrideClearColor !== null)) {
			scene.background = null;
		}

		if (this.clearPass.enabled) {
			this.clearPass.render(renderer, inputBuffer);
		}

		renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);

		if (this._overrideManager !== null) {
			this._overrideManager.render(renderer, scene, camera);
		} else {
			renderer.render(scene, camera);
		}

		camera.layers.mask = savedLayersMask;
		scene.background = savedBackground;
		renderer.shadowMap.autoUpdate = savedAutoUpdate;
	}

}
