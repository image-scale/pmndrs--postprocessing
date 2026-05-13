import { LinearSRGBColorSpace } from "three";
import { EffectAttribute } from "../enums/index.js";
import { EffectShaderSection as Section } from "../enums/index.js";

export class ShaderBuildData {

	constructor() {
		this.shaderParts = new Map([
			[Section.FRAGMENT_HEAD, null],
			[Section.FRAGMENT_MAIN_UV, null],
			[Section.FRAGMENT_MAIN_IMAGE, null],
			[Section.VERTEX_HEAD, null],
			[Section.VERTEX_MAIN_SUPPORT, null]
		]);

		this.defines = new Map();
		this.uniforms = new Map();
		this.blendModes = new Map();
		this.extensions = new Set();
		this.attributes = EffectAttribute.NONE;
		this.varyings = new Set();
		this.uvTransformation = false;
		this.readDepth = false;
		this.colorSpace = LinearSRGBColorSpace;
	}

}
