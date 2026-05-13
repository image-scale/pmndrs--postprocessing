import { Uniform, Vector3 } from "three";
import { BlendFunction } from "../enums/index.js";
import { Effect } from "./Effect.js";

const fragmentShader = `
uniform vec3 hue;
uniform float saturation;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec3 color = vec3(
		dot(inputColor.rgb, hue.xyz),
		dot(inputColor.rgb, hue.zxy),
		dot(inputColor.rgb, hue.yzx)
	);

	float average = (color.r + color.g + color.b) / 3.0;
	vec3 diff = average - color;

	if(saturation > 0.0) {
		color += diff * (1.0 - 1.0 / (1.001 - saturation));
	} else {
		color += diff * -saturation;
	}

	outputColor = vec4(min(color, 1.0), inputColor.a);
}
`;

export class HueSaturationEffect extends Effect {

	constructor({ blendFunction = BlendFunction.SRC, hue = 0.0, saturation = 0.0 } = {}) {
		super("HueSaturationEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["hue", new Uniform(new Vector3())],
				["saturation", new Uniform(saturation)]
			])
		});

		this.hue = hue;
	}

	get hue() {
		const h = this.uniforms.get("hue").value;
		return Math.acos((h.x * 3.0 - 1.0) / 2.0);
	}

	set hue(value) {
		const s = Math.sin(value);
		const c = Math.cos(value);
		this.uniforms.get("hue").value.set(
			(2.0 * c + 1.0) / 3.0,
			(-Math.sqrt(3.0) * s - c + 1.0) / 3.0,
			(Math.sqrt(3.0) * s - c + 1.0) / 3.0
		);
	}

	get saturation() {
		return this.uniforms.get("saturation").value;
	}

	set saturation(value) {
		this.uniforms.get("saturation").value = value;
	}

}
