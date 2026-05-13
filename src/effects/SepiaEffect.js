import { Uniform, Vector3 } from "three";
import { Effect } from "./Effect.js";

const fragmentShader = `
uniform vec3 weightsR;
uniform vec3 weightsG;
uniform vec3 weightsB;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec3 color = vec3(
		dot(inputColor.rgb, weightsR),
		dot(inputColor.rgb, weightsG),
		dot(inputColor.rgb, weightsB)
	);

	outputColor = vec4(color, inputColor.a);
}
`;

export class SepiaEffect extends Effect {

	constructor({ blendFunction, intensity = 1.0 } = {}) {
		super("SepiaEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["weightsR", new Uniform(new Vector3(0.393, 0.769, 0.189))],
				["weightsG", new Uniform(new Vector3(0.349, 0.686, 0.168))],
				["weightsB", new Uniform(new Vector3(0.272, 0.534, 0.131))]
			])
		});

		this.intensity = intensity;
	}

	get intensity() {
		return this.blendMode.opacity.value;
	}

	set intensity(value) {
		this.blendMode.opacity.value = value;
	}

}
