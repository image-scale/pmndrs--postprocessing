import { SRGBColorSpace, Uniform } from "three";
import { BlendFunction } from "../enums/index.js";
import { Effect } from "./Effect.js";

const fragmentShader = `
uniform float brightness;
uniform float contrast;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec3 color = inputColor.rgb + vec3(brightness - 0.5);

	if(contrast > 0.0) {
		color /= vec3(1.0 - contrast);
	} else {
		color *= vec3(1.0 + contrast);
	}

	outputColor = vec4(color + vec3(0.5), inputColor.a);
}
`;

export class BrightnessContrastEffect extends Effect {

	constructor({ blendFunction = BlendFunction.SRC, brightness = 0.0, contrast = 0.0 } = {}) {
		super("BrightnessContrastEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["brightness", new Uniform(brightness)],
				["contrast", new Uniform(contrast)]
			])
		});

		this.inputColorSpace = SRGBColorSpace;
	}

	get brightness() {
		return this.uniforms.get("brightness").value;
	}

	set brightness(value) {
		this.uniforms.get("brightness").value = value;
	}

	get contrast() {
		return this.uniforms.get("contrast").value;
	}

	set contrast(value) {
		this.uniforms.get("contrast").value = value;
	}

}
