import { LinearMipmapLinearFilter, REVISION, Uniform, WebGLRenderTarget } from "three";
import { AdaptiveLuminancePass } from "../passes/AdaptiveLuminancePass.js";
import { BrightnessPass } from "../passes/BrightnessPass.js";
import { BlendFunction, ToneMappingMode } from "../enums/index.js";
import { Effect } from "./Effect.js";

const toneMappingFragmentShader = `
#include <tonemapping_pars_fragment>

uniform float whitePoint;

#if TONE_MAPPING_MODE == 2 || TONE_MAPPING_MODE == 3

uniform float middleGrey;

#if TONE_MAPPING_MODE == 3
uniform lowp sampler2D luminanceBuffer;
#else
uniform float averageLuminance;
#endif

vec3 Reinhard2ToneMapping(vec3 color) {
	color *= toneMappingExposure;
	float l = luminance(color);

	#if TONE_MAPPING_MODE == 3
		float lumAvg = unpackRGBAToFloat(texture2D(luminanceBuffer, vec2(0.5)));
	#else
		float lumAvg = averageLuminance;
	#endif

	float lumScaled = (l * middleGrey) / max(lumAvg, 1e-6);
	float lumCompressed = lumScaled * (1.0 + lumScaled / (whitePoint * whitePoint));
	lumCompressed /= (1.0 + lumScaled);
	return clamp(lumCompressed * color, 0.0, 1.0);
}

#elif TONE_MAPPING_MODE == 4

#define A 0.15
#define B 0.50
#define C 0.10
#define D 0.20
#define E 0.02
#define F 0.30

vec3 Uncharted2Helper(const in vec3 x) {
	return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
}

vec3 Uncharted2ToneMapping(vec3 color) {
	color *= toneMappingExposure;
	return clamp(Uncharted2Helper(color) / Uncharted2Helper(vec3(whitePoint)), 0.0, 1.0);
}

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	#if TONE_MAPPING_MODE == 2 || TONE_MAPPING_MODE == 3
		outputColor = vec4(Reinhard2ToneMapping(inputColor.rgb), inputColor.a);
	#elif TONE_MAPPING_MODE == 4
		outputColor = vec4(Uncharted2ToneMapping(inputColor.rgb), inputColor.a);
	#else
		outputColor = vec4(toneMapping(inputColor.rgb), inputColor.a);
	#endif
}`;

export class ToneMappingEffect extends Effect {

	constructor({
		blendFunction = BlendFunction.SRC,
		adaptive = false,
		mode = adaptive ? ToneMappingMode.REINHARD2_ADAPTIVE : ToneMappingMode.AGX,
		resolution = 256,
		maxLuminance = 4.0,
		whitePoint = maxLuminance,
		middleGrey = 0.6,
		minLuminance = 0.01,
		averageLuminance = 1.0,
		adaptationRate = 1.0
	} = {}) {

		super("ToneMappingEffect", toneMappingFragmentShader, {
			blendFunction,
			uniforms: new Map([
				["luminanceBuffer", new Uniform(null)],
				["whitePoint", new Uniform(whitePoint)],
				["middleGrey", new Uniform(middleGrey)],
				["averageLuminance", new Uniform(averageLuminance)]
			])
		});

		this.renderTargetLuminance = new WebGLRenderTarget(1, 1, {
			minFilter: LinearMipmapLinearFilter,
			depthBuffer: false
		});
		this.renderTargetLuminance.texture.generateMipmaps = true;
		this.renderTargetLuminance.texture.name = "Luminance";

		this.luminancePass = new BrightnessPass({
			renderTarget: this.renderTargetLuminance
		});

		this.adaptiveLuminancePass = new AdaptiveLuminancePass(this.luminancePass.texture, {
			minLuminance,
			adaptationRate
		});

		this.uniforms.get("luminanceBuffer").value = this.adaptiveLuminancePass.texture;

		this.resolution = resolution;
		this.mode = mode;
	}

	get mode() {
		return Number(this.defines.get("TONE_MAPPING_MODE"));
	}

	set mode(value) {
		if (this.mode === value) {
			return;
		}

		const revision = REVISION.replace(/\D+/g, "");
		const cineonMapping = (revision >= 168)
			? "CineonToneMapping(texel)"
			: "OptimizedCineonToneMapping(texel)";

		this.defines.clear();
		this.defines.set("TONE_MAPPING_MODE", value.toFixed(0));

		switch (value) {
			case ToneMappingMode.LINEAR:
				this.defines.set("toneMapping(texel)", "LinearToneMapping(texel)");
				break;
			case ToneMappingMode.REINHARD:
				this.defines.set("toneMapping(texel)", "ReinhardToneMapping(texel)");
				break;
			case ToneMappingMode.CINEON:
			case ToneMappingMode.OPTIMIZED_CINEON:
				this.defines.set("toneMapping(texel)", cineonMapping);
				break;
			case ToneMappingMode.ACES_FILMIC:
				this.defines.set("toneMapping(texel)", "ACESFilmicToneMapping(texel)");
				break;
			case ToneMappingMode.AGX:
				this.defines.set("toneMapping(texel)", "AgXToneMapping(texel)");
				break;
			case ToneMappingMode.NEUTRAL:
				this.defines.set("toneMapping(texel)", "NeutralToneMapping(texel)");
				break;
			default:
				this.defines.set("toneMapping(texel)", "texel");
				break;
		}

		this.adaptiveLuminancePass.enabled = (value === ToneMappingMode.REINHARD2_ADAPTIVE);
		this.setChanged();
	}

	get whitePoint() {
		return this.uniforms.get("whitePoint").value;
	}

	set whitePoint(value) {
		this.uniforms.get("whitePoint").value = value;
	}

	get middleGrey() {
		return this.uniforms.get("middleGrey").value;
	}

	set middleGrey(value) {
		this.uniforms.get("middleGrey").value = value;
	}

	get averageLuminance() {
		return this.uniforms.get("averageLuminance").value;
	}

	set averageLuminance(value) {
		this.uniforms.get("averageLuminance").value = value;
	}

	get adaptiveLuminanceMaterial() {
		return this.adaptiveLuminancePass.fullscreenMaterial;
	}

	get resolution() {
		return this.luminancePass.resolution.width;
	}

	set resolution(value) {
		const exponent = Math.max(0, Math.ceil(Math.log2(value)));
		const size = Math.pow(2, exponent);
		this.luminancePass.resolution.setPreferredSize(size, size);
		this.adaptiveLuminanceMaterial.mipLevel1x1 = exponent;
	}

	update(renderer, inputBuffer, deltaTime) {
		if (this.adaptiveLuminancePass.enabled) {
			this.luminancePass.render(renderer, inputBuffer);
			this.adaptiveLuminancePass.render(renderer, null, null, deltaTime);
		}
	}

	initialize(renderer, alpha, frameBufferType) {
		this.adaptiveLuminancePass.initialize(renderer, alpha, frameBufferType);
	}

}
