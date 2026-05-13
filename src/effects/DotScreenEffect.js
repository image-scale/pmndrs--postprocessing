import { Uniform, Vector2 } from "three";
import { Effect } from "./Effect.js";

const fragmentShader = `
uniform vec2 angle;
uniform float scale;

float pattern(const in vec2 uv) {
	vec2 point = scale * vec2(
		dot(angle.yx, vec2(uv.x, -uv.y)),
		dot(angle, uv)
	);
	return (sin(point.x) * sin(point.y)) * 4.0;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec3 color = vec3(inputColor.rgb * 10.0 - 5.0 + pattern(uv * resolution));
	outputColor = vec4(color, inputColor.a);
}
`;

export class DotScreenEffect extends Effect {

	constructor({ blendFunction, angle = Math.PI * 0.5, scale = 1.0 } = {}) {
		super("DotScreenEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["angle", new Uniform(new Vector2())],
				["scale", new Uniform(scale)]
			])
		});

		this.angle = angle;
	}

	get angle() {
		return Math.acos(this.uniforms.get("angle").value.y);
	}

	set angle(value) {
		this.uniforms.get("angle").value.set(Math.sin(value), Math.cos(value));
	}

	get scale() {
		return this.uniforms.get("scale").value;
	}

	set scale(value) {
		this.uniforms.get("scale").value = value;
	}

}
