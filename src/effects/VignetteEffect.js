import { Uniform } from "three";
import { Effect } from "./Effect.js";
import { VignetteTechnique } from "../enums/index.js";

const fragmentShader = `
uniform float offset;
uniform float darkness;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	const vec2 center = vec2(0.5);
	vec3 color = inputColor.rgb;

	#if VIGNETTE_TECHNIQUE == 0
		float d = distance(uv, center);
		color *= smoothstep(0.8, offset * 0.799, d * (darkness + offset));
	#else
		vec2 coord = (uv - center) * vec2(offset);
		color = mix(color, vec3(1.0 - darkness), dot(coord, coord));
	#endif

	outputColor = vec4(color, inputColor.a);
}
`;

export class VignetteEffect extends Effect {

	constructor({
		blendFunction,
		technique = VignetteTechnique.DEFAULT,
		offset = 0.5,
		darkness = 0.5
	} = {}) {
		super("VignetteEffect", fragmentShader, {
			blendFunction,
			defines: new Map([
				["VIGNETTE_TECHNIQUE", technique.toFixed(0)]
			]),
			uniforms: new Map([
				["offset", new Uniform(offset)],
				["darkness", new Uniform(darkness)]
			])
		});
	}

	get technique() {
		return Number(this.defines.get("VIGNETTE_TECHNIQUE"));
	}

	set technique(value) {
		this.defines.set("VIGNETTE_TECHNIQUE", value.toFixed(0));
		this.setChanged();
	}

	get offset() {
		return this.uniforms.get("offset").value;
	}

	set offset(value) {
		this.uniforms.get("offset").value = value;
	}

	get darkness() {
		return this.uniforms.get("darkness").value;
	}

	set darkness(value) {
		this.uniforms.get("darkness").value = value;
	}

}
