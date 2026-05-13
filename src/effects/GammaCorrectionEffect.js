import { Uniform } from "three";
import { BlendFunction } from "../enums/index.js";
import { Effect } from "./Effect.js";

const fragmentShader = `
uniform float gamma;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec4 color = max(inputColor, 0.0);
	outputColor = vec4(pow(color.rgb, vec3(1.0 / gamma)), color.a);
}
`;

export class GammaCorrectionEffect extends Effect {

	constructor({ blendFunction = BlendFunction.SRC, gamma = 2.0 } = {}) {
		super("GammaCorrectionEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["gamma", new Uniform(gamma)]
			])
		});
	}

	get gamma() {
		return this.uniforms.get("gamma").value;
	}

	set gamma(value) {
		this.uniforms.get("gamma").value = value;
	}

}
