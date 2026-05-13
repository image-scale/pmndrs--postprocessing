import { Uniform, Vector2 } from "three";
import { BlendFunction } from "../enums/index.js";
import { Effect } from "./Effect.js";

const fragmentShader = `
uniform vec2 scale;
uniform float lineWidth;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	float grid = 0.5 - max(abs(mod(uv.x * scale.x, 1.0) - 0.5), abs(mod(uv.y * scale.y, 1.0) - 0.5));
	outputColor = vec4(vec3(smoothstep(0.0, lineWidth, grid)), inputColor.a);
}
`;

export class GridEffect extends Effect {

	constructor({ blendFunction = BlendFunction.OVERLAY, scale = 1.0, lineWidth = 0.0 } = {}) {
		super("GridEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["scale", new Uniform(new Vector2())],
				["lineWidth", new Uniform(0.0)]
			])
		});

		this._resolution = new Vector2();
		this._scale = Math.max(scale, 1e-6);
		this._lineWidth = lineWidth;
	}

	get scale() {
		return this._scale;
	}

	set scale(value) {
		this._scale = Math.max(value, 1e-6);
		this.setSize(this._resolution.x, this._resolution.y);
	}

	get lineWidth() {
		return this._lineWidth;
	}

	set lineWidth(value) {
		this._lineWidth = value;
		this.setSize(this._resolution.x, this._resolution.y);
	}

	setSize(width, height) {
		this._resolution.set(width, height);
		const aspect = width / height;
		const s = this._scale * (height * 0.125);
		this.uniforms.get("scale").value.set(aspect * s, s);
		this.uniforms.get("lineWidth").value = (s / height) + this._lineWidth;
	}

}
