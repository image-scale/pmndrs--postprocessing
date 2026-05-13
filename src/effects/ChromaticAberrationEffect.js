import { Uniform, Vector2 } from "three";
import { EffectAttribute } from "../enums/index.js";
import { Effect } from "./Effect.js";

const chromaticAberrationVertex = `
uniform vec2 offset;

varying float vActive;
varying vec2 vUvR;
varying vec2 vUvB;

void mainSupport(const in vec2 uv) {
	vec2 shift = offset * vec2(1.0, aspect);
	vActive = (shift.x != 0.0 || shift.y != 0.0) ? 1.0 : 0.0;
	vUvR = uv + shift;
	vUvB = uv - shift;
}`;

const chromaticAberrationFragment = `
#ifdef RADIAL_MODULATION
uniform float modulationOffset;
#endif

varying float vActive;
varying vec2 vUvR;
varying vec2 vUvB;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec2 ra = inputColor.ra;
	vec2 ba = inputColor.ba;

	#ifdef RADIAL_MODULATION
		const vec2 center = vec2(0.5);
		float d = distance(uv, center) * 2.0;
		d = max(d - modulationOffset, 0.0);

		if(vActive > 0.0 && d > 0.0) {
			ra = texture2D(inputBuffer, mix(uv, vUvR, d)).ra;
			ba = texture2D(inputBuffer, mix(uv, vUvB, d)).ba;
		}
	#else
		if(vActive > 0.0) {
			ra = texture2D(inputBuffer, vUvR).ra;
			ba = texture2D(inputBuffer, vUvB).ra;
		}
	#endif

	outputColor = vec4(ra.x, inputColor.g, ba.x, max(max(ra.y, ba.y), inputColor.a));
}`;

export class ChromaticAberrationEffect extends Effect {

	constructor({
		offset = new Vector2(1e-3, 5e-4),
		radialModulation = false,
		modulationOffset = 0.15
	} = {}) {
		super("ChromaticAberrationEffect", chromaticAberrationFragment, {
			vertexShader: chromaticAberrationVertex,
			attributes: EffectAttribute.CONVOLUTION,
			uniforms: new Map([
				["offset", new Uniform(offset)],
				["modulationOffset", new Uniform(modulationOffset)]
			])
		});

		this.radialModulation = radialModulation;
	}

	get offset() {
		return this.uniforms.get("offset").value;
	}

	set offset(value) {
		this.uniforms.get("offset").value = value;
	}

	get radialModulation() {
		return this.defines.has("RADIAL_MODULATION");
	}

	set radialModulation(value) {
		if (this.radialModulation !== value) {
			if (value) {
				this.defines.set("RADIAL_MODULATION", "1");
			} else {
				this.defines.delete("RADIAL_MODULATION");
			}
			this.setChanged();
		}
	}

	get modulationOffset() {
		return this.uniforms.get("modulationOffset").value;
	}

	set modulationOffset(value) {
		this.uniforms.get("modulationOffset").value = value;
	}

}
