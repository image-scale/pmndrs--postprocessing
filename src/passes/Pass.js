import {
	Scene,
	OrthographicCamera,
	Mesh,
	BufferGeometry,
	BufferAttribute,
	WebGLRenderTarget
} from "three";

const _fullscreenGeo = new BufferGeometry();
const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
_fullscreenGeo.setAttribute("position", new BufferAttribute(vertices, 3));
_fullscreenGeo.setAttribute("uv", new BufferAttribute(uvs, 2));

export class Pass {

	static get fullscreenGeometry() {
		return _fullscreenGeo;
	}

	constructor(name = "Pass", scene, camera) {
		this.name = name;
		this.scene = scene || new Scene();
		this.camera = camera || new OrthographicCamera(-1, 1, 1, -1, 0, 1);
		this._screen = null;
		this.rtt = true;
		this.needsSwap = true;
		this.needsDepthBlit = false;
		this.needsDepthTexture = false;
		this.enabled = true;
	}

	get renderToScreen() {
		return !this.rtt;
	}

	set renderToScreen(value) {
		if (this.rtt === value) {
			this.rtt = !value;
			if (this._screen !== null && this._screen.material !== null) {
				this._screen.material.needsUpdate = true;
			}
		}
	}

	get fullscreenMaterial() {
		return this._screen !== null ? this._screen.material : null;
	}

	set fullscreenMaterial(material) {
		if (this._screen === null) {
			this._screen = new Mesh(_fullscreenGeo, material);
			this._screen.frustumCulled = false;
			if (this.scene) {
				this.scene = new Scene();
				this.scene.add(this._screen);
			}
		} else {
			this._screen.material = material;
		}
	}

	set mainScene(value) {}
	set mainCamera(value) {}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		throw new Error("Pass#render must be overridden");
	}

	setSize(width, height) {}

	initialize(renderer, alpha, frameBufferType) {}

	setDepthTexture(depthTexture, depthPacking) {}

	getDepthTexture() {
		return null;
	}

	dispose() {
		for (const key of Object.keys(this)) {
			const prop = this[key];
			if (prop !== null && prop !== undefined) {
				if (typeof prop.dispose === "function" && prop !== this) {
					if (prop instanceof WebGLRenderTarget ||
						(prop.isMaterial) ||
						(prop.isTexture) ||
						(prop instanceof Pass)) {
						prop.dispose();
					}
				}
			}
		}

		if (this._screen !== null && this._screen.material !== null) {
			this._screen.material.dispose();
		}
	}

}
