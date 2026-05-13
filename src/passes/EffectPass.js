import { BasicDepthPacking, NoColorSpace, SRGBColorSpace, UnsignedByteType } from "three";
import { ShaderBuildData } from "../core/ShaderBuildData.js";
import { BlendFunction, EffectAttribute, EffectShaderSection as Section } from "../enums/index.js";
import { CompoundMaterial } from "../materials/CompoundMaterial.js";
import { Pass } from "./Pass.js";

function prefixSubstrings(prefix, substrings, strings) {
	for (const substring of substrings) {
		const prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
		const regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");

		for (const entry of strings.entries()) {
			if (entry[1] !== null) {
				strings.set(entry[0], entry[1].replace(regExp, prefixed));
			}
		}
	}
}

function integrateEffect(prefix, effect, data) {
	let fragmentShader = effect.getFragmentShader();
	let vertexShader = effect.getVertexShader();

	const mainImageExists = (fragmentShader !== undefined && /mainImage/.test(fragmentShader));
	const mainUvExists = (fragmentShader !== undefined && /mainUv/.test(fragmentShader));

	data.attributes |= effect.getAttributes();

	if (fragmentShader === undefined) {
		throw new Error(`Missing fragment shader (${effect.name})`);
	} else if (mainUvExists && (data.attributes & EffectAttribute.CONVOLUTION) !== 0) {
		throw new Error(`Effects that transform UVs are incompatible with convolution effects (${effect.name})`);
	} else if (!mainImageExists && !mainUvExists) {
		throw new Error(`Could not find mainImage or mainUv function (${effect.name})`);
	}

	const functionRegExp = /\w+\s+(\w+)\([\w\s,]*\)\s*{/g;

	const shaderParts = data.shaderParts;
	let fragmentHead = shaderParts.get(Section.FRAGMENT_HEAD) || "";
	let fragmentMainUv = shaderParts.get(Section.FRAGMENT_MAIN_UV) || "";
	let fragmentMainImage = shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) || "";
	let vertexHead = shaderParts.get(Section.VERTEX_HEAD) || "";
	let vertexMainSupport = shaderParts.get(Section.VERTEX_MAIN_SUPPORT) || "";

	const varyings = new Set();
	const names = new Set();

	if (mainUvExists) {
		fragmentMainUv += `\t${prefix}MainUv(UV);\n`;
		data.uvTransformation = true;
	}

	if (vertexShader !== null && /mainSupport/.test(vertexShader)) {
		const needsUv = /mainSupport *\([\w\s]*?uv\s*?\)/.test(vertexShader);
		vertexMainSupport += `\t${prefix}MainSupport(`;
		vertexMainSupport += needsUv ? "vUv);\n" : ");\n";

		for (const m of vertexShader.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g)) {
			for (const n of m[1].split(/\s*,\s*/)) {
				data.varyings.add(n);
				varyings.add(n);
				names.add(n);
			}
		}

		for (const m of vertexShader.matchAll(functionRegExp)) {
			names.add(m[1]);
		}
	}

	for (const m of fragmentShader.matchAll(functionRegExp)) {
		names.add(m[1]);
	}

	for (const d of effect.defines.keys()) {
		names.add(d.replace(/\([\w\s,]*\)/g, ""));
	}

	for (const u of effect.uniforms.keys()) {
		names.add(u);
	}

	names.delete("while");
	names.delete("for");
	names.delete("if");

	effect.uniforms.forEach((val, key) => data.uniforms.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));
	effect.defines.forEach((val, key) => data.defines.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));

	const shaders = new Map([["fragment", fragmentShader], ["vertex", vertexShader]]);
	prefixSubstrings(prefix, names, data.defines);
	prefixSubstrings(prefix, names, shaders);
	fragmentShader = shaders.get("fragment");
	vertexShader = shaders.get("vertex");

	const blendMode = effect.blendMode;
	data.blendModes.set(blendMode.blendFunction, blendMode);

	if (mainImageExists) {
		if (effect.inputColorSpace !== null && effect.inputColorSpace !== data.colorSpace) {
			fragmentMainImage += (effect.inputColorSpace === SRGBColorSpace) ?
				"color0 = sRGBTransferOETF(color0);\n\t" :
				"color0 = sRGBToLinear(color0);\n\t";
		}

		if (effect.outputColorSpace !== NoColorSpace) {
			data.colorSpace = effect.outputColorSpace;
		} else if (effect.inputColorSpace !== null) {
			data.colorSpace = effect.inputColorSpace;
		}

		const depthParamRegExp = /MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;
		fragmentMainImage += `${prefix}MainImage(color0, UV, `;

		if ((data.attributes & EffectAttribute.DEPTH) !== 0 && depthParamRegExp.test(fragmentShader)) {
			fragmentMainImage += "depth, ";
			data.readDepth = true;
		}

		fragmentMainImage += "color1);\n\t";

		const blendOpacity = prefix + "BlendOpacity";
		data.uniforms.set(blendOpacity, blendMode.opacity);

		fragmentMainImage += `color0 = blend${blendMode.blendFunction}(color0, color1, ${blendOpacity});\n\n\t`;
		fragmentHead += `uniform float ${blendOpacity};\n\n`;
	}

	fragmentHead += fragmentShader + "\n";

	if (vertexShader !== null) {
		vertexHead += vertexShader + "\n";
	}

	shaderParts.set(Section.FRAGMENT_HEAD, fragmentHead);
	shaderParts.set(Section.FRAGMENT_MAIN_UV, fragmentMainUv);
	shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
	shaderParts.set(Section.VERTEX_HEAD, vertexHead);
	shaderParts.set(Section.VERTEX_MAIN_SUPPORT, vertexMainSupport);

	if (effect.extensions !== null) {
		for (const extension of effect.extensions) {
			data.extensions.add(extension);
		}
	}
}

export class EffectPass extends Pass {

	constructor(camera, ...effects) {
		super("EffectPass");

		this.fullscreenMaterial = new CompoundMaterial(null, null, null, camera);
		this.listener = (event) => this.handleEvent(event);
		this.effects = [];
		this.setEffects(effects);
		this.skipRendering = false;
		this.timeScale = 1.0;
	}

	set mainScene(value) {
		for (const effect of this.effects) {
			effect.mainScene = value;
		}
	}

	set mainCamera(value) {
		this.fullscreenMaterial.copyCameraSettings(value);
		for (const effect of this.effects) {
			effect.mainCamera = value;
		}
	}

	get encodeOutput() {
		return this.fullscreenMaterial.encodeOutput;
	}

	set encodeOutput(value) {
		this.fullscreenMaterial.encodeOutput = value;
	}

	get dithering() {
		return this.fullscreenMaterial.dithering;
	}

	set dithering(value) {
		const material = this.fullscreenMaterial;
		material.dithering = value;
		material.needsUpdate = true;
	}

	setEffects(effects) {
		for (const effect of this.effects) {
			effect.removeEventListener("change", this.listener);
		}

		this.effects = effects.sort((a, b) => (b.attributes - a.attributes));

		for (const effect of this.effects) {
			effect.addEventListener("change", this.listener);
		}
	}

	updateMaterial() {
		const data = new ShaderBuildData();
		let id = 0;

		for (const effect of this.effects) {
			if (effect.blendMode.blendFunction === BlendFunction.DST) {
				data.attributes |= (effect.getAttributes() & EffectAttribute.DEPTH);
			} else if ((data.attributes & effect.getAttributes() & EffectAttribute.CONVOLUTION) !== 0) {
				throw new Error(`Convolution effects cannot be merged (${effect.name})`);
			} else {
				integrateEffect("e" + id++, effect, data);
			}
		}

		let fragmentHead = data.shaderParts.get(Section.FRAGMENT_HEAD);
		let fragmentMainImage = data.shaderParts.get(Section.FRAGMENT_MAIN_IMAGE);
		let fragmentMainUv = data.shaderParts.get(Section.FRAGMENT_MAIN_UV);

		const blendRegExp = /\bblend\b/g;

		for (const blendMode of data.blendModes.values()) {
			fragmentHead += blendMode.getShaderCode().replace(blendRegExp, `blend${blendMode.blendFunction}`) + "\n";
		}

		if ((data.attributes & EffectAttribute.DEPTH) !== 0) {
			if (data.readDepth) {
				fragmentMainImage = "float depth = readDepth(UV);\n\n\t" + fragmentMainImage;
			}
			this.needsDepthTexture = (this.getDepthTexture() === null);
		} else {
			this.needsDepthTexture = false;
		}

		if (data.colorSpace === SRGBColorSpace) {
			fragmentMainImage += "color0 = sRGBToLinear(color0);\n\t";
		}

		if (data.uvTransformation) {
			fragmentMainUv = "vec2 transformedUv = vUv;\n" + fragmentMainUv;
			data.defines.set("UV", "transformedUv");
		} else {
			data.defines.set("UV", "vUv");
		}

		data.shaderParts.set(Section.FRAGMENT_HEAD, fragmentHead);
		data.shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
		data.shaderParts.set(Section.FRAGMENT_MAIN_UV, fragmentMainUv);

		for (const [key, value] of data.shaderParts) {
			if (value !== null) {
				data.shaderParts.set(key, value.trim().replace(/^#/, "\n#"));
			}
		}

		this.skipRendering = (id === 0);
		this.needsSwap = !this.skipRendering;
		this.fullscreenMaterial.setShaderData(data);
	}

	recompile() {
		this.updateMaterial();
	}

	getDepthTexture() {
		return this.fullscreenMaterial.depthBuffer;
	}

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
		this.fullscreenMaterial.depthBuffer = depthTexture;
		this.fullscreenMaterial.depthPacking = depthPacking;

		for (const effect of this.effects) {
			effect.setDepthTexture(depthTexture, depthPacking);
		}
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		for (const effect of this.effects) {
			effect.update(renderer, inputBuffer, deltaTime);
		}

		if (!this.skipRendering || this.renderToScreen) {
			const material = this.fullscreenMaterial;
			material.inputBuffer = inputBuffer.texture;
			material.time += deltaTime * this.timeScale;

			renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
			renderer.render(this.scene, this.camera);
		}
	}

	setSize(width, height) {
		this.fullscreenMaterial.setSize(width, height);

		for (const effect of this.effects) {
			effect.setSize(width, height);
		}
	}

	initialize(renderer, alpha, frameBufferType) {
		for (const effect of this.effects) {
			effect.initialize(renderer, alpha, frameBufferType);
		}

		this.updateMaterial();

		if (frameBufferType !== undefined && frameBufferType !== UnsignedByteType) {
			this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
		}
	}

	dispose() {
		super.dispose();

		for (const effect of this.effects) {
			effect.removeEventListener("change", this.listener);
			effect.dispose();
		}
	}

	handleEvent(event) {
		switch (event.type) {
			case "change":
				this.recompile();
				break;
		}
	}

}
