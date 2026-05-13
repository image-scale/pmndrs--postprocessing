import { BlendFunction, EffectAttribute } from "../enums/index.js";
import { Effect } from "./Effect.js";

const fragmentShader = `
void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
	#ifdef INVERTED
		vec3 color = vec3(1.0 - depth);
	#else
		vec3 color = vec3(depth);
	#endif
	outputColor = vec4(color, inputColor.a);
}`;

export class DepthEffect extends Effect {

	constructor({ blendFunction = BlendFunction.SRC, inverted = false } = {}) {
		super("DepthEffect", fragmentShader, {
			blendFunction,
			attributes: EffectAttribute.DEPTH
		});

		this.inverted = inverted;
	}

	get inverted() {
		return this.defines.has("INVERTED");
	}

	set inverted(value) {
		if (this.inverted !== value) {
			if (value) {
				this.defines.set("INVERTED", "1");
			} else {
				this.defines.delete("INVERTED");
			}
			this.setChanged();
		}
	}

}
