import { EventDispatcher, LinearSRGBColorSpace, NoColorSpace, WebGLRenderTarget } from "three";
import { BlendFunction, EffectAttribute } from "../enums/index.js";
import { BlendMode } from "./blending/BlendMode.js";

export class Effect extends EventDispatcher {

	constructor(name, fragmentShader, {
		attributes = EffectAttribute.NONE,
		blendFunction = BlendFunction.NORMAL,
		defines = new Map(),
		uniforms = new Map(),
		extensions = null,
		vertexShader = null
	} = {}) {
		super();
		this.name = name;
		this.attributes = attributes;
		this.fragmentShader = fragmentShader;
		this.vertexShader = vertexShader;
		this.defines = defines;
		this.uniforms = uniforms;
		this.extensions = extensions;
		this.blendMode = new BlendMode(blendFunction);
		this.blendMode.addEventListener("change", () => this.setChanged());
		this._inputColorSpace = LinearSRGBColorSpace;
		this._outputColorSpace = NoColorSpace;
	}

	get inputColorSpace() {
		return this._inputColorSpace;
	}

	set inputColorSpace(value) {
		this._inputColorSpace = value;
		this.setChanged();
	}

	get outputColorSpace() {
		return this._outputColorSpace;
	}

	set outputColorSpace(value) {
		this._outputColorSpace = value;
		this.setChanged();
	}

	set mainScene(value) {}
	set mainCamera(value) {}

	setChanged() {
		this.dispatchEvent({ type: "change" });
	}

	getAttributes() {
		return this.attributes;
	}

	setAttributes(attributes) {
		this.attributes = attributes;
		this.setChanged();
	}

	getFragmentShader() {
		return this.fragmentShader;
	}

	setFragmentShader(fragmentShader) {
		this.fragmentShader = fragmentShader;
		this.setChanged();
	}

	getVertexShader() {
		return this.vertexShader;
	}

	setVertexShader(vertexShader) {
		this.vertexShader = vertexShader;
		this.setChanged();
	}

	setDepthTexture(depthTexture, depthPacking) {}

	update(renderer, inputBuffer, deltaTime) {}

	setSize(width, height) {}

	initialize(renderer, alpha, frameBufferType) {}

	dispose() {
		for (const key of Object.keys(this)) {
			const prop = this[key];
			if (prop !== null && prop !== undefined && typeof prop.dispose === "function") {
				if (prop instanceof WebGLRenderTarget || prop.isMaterial || prop.isTexture) {
					prop.dispose();
				}
			}
		}
	}

}
