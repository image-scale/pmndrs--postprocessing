import { Effect } from "./Effect.js";

const fragmentShader = `
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = vec4(vec3((inputColor.r + inputColor.g + inputColor.b) / 3.0), inputColor.a);
}
`;

export class ColorAverageEffect extends Effect {

	constructor(blendFunction) {
		super("ColorAverageEffect", fragmentShader, {
			blendFunction
		});
	}

}
