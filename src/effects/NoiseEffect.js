import { Effect } from "./Effect.js";
import { BlendFunction } from "../enums/index.js";

const fragmentShader = `
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec3 noise = vec3(fract(sin(dot(uv + vec2(time), vec2(12.9898, 78.233))) * 43758.5453));

	#ifdef PREMULTIPLY
		outputColor = vec4(min(inputColor.rgb * noise, vec3(1.0)), inputColor.a);
	#else
		outputColor = vec4(noise, inputColor.a);
	#endif
}
`;

export class NoiseEffect extends Effect {

	constructor({ blendFunction = BlendFunction.SCREEN, premultiply = false } = {}) {
		super("NoiseEffect", fragmentShader, {
			blendFunction
		});

		this.premultiply = premultiply;
	}

	get premultiply() {
		return this.defines.has("PREMULTIPLY");
	}

	set premultiply(value) {
		if (value) {
			this.defines.set("PREMULTIPLY", "1");
		} else {
			this.defines.delete("PREMULTIPLY");
		}
		this.setChanged();
	}

}
