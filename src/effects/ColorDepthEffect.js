import { Uniform } from "three";
import { Effect } from "./Effect.js";

const fragmentShader = `
uniform float factor;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = vec4(floor(inputColor.rgb * factor + 0.5) / factor, inputColor.a);
}
`;

export class ColorDepthEffect extends Effect {

	constructor({ blendFunction, bits = 16 } = {}) {
		super("ColorDepthEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["factor", new Uniform(1.0)]
			])
		});

		this._bits = 0;
		this.bitDepth = bits;
	}

	get bitDepth() {
		return this._bits;
	}

	set bitDepth(value) {
		this._bits = value;
		this.uniforms.get("factor").value = Math.pow(2.0, value / 3.0);
	}

}
