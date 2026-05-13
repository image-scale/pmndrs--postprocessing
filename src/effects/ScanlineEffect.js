import { Uniform, Vector2 } from "three";
import { BlendFunction } from "../enums/index.js";
import { Effect } from "./Effect.js";

const fragmentShader = `
uniform float count;

#ifdef SCROLL
	uniform float scrollSpeed;
#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	float y = uv.y;

	#ifdef SCROLL
		y += time * scrollSpeed;
	#endif

	vec2 sl = vec2(sin(y * count), cos(y * count));
	outputColor = vec4(sl.xyx, inputColor.a);
}
`;

export class ScanlineEffect extends Effect {

	constructor({ blendFunction = BlendFunction.OVERLAY, density = 1.25, scrollSpeed = 0.0 } = {}) {
		super("ScanlineEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["count", new Uniform(0.0)],
				["scrollSpeed", new Uniform(scrollSpeed)]
			])
		});

		this._resolution = new Vector2();
		this._density = density;

		if (scrollSpeed !== 0) {
			this.defines.set("SCROLL", "1");
		}
	}

	get density() {
		return this._density;
	}

	set density(value) {
		this._density = value;
		this.setSize(this._resolution.x, this._resolution.y);
	}

	get scrollSpeed() {
		return this.uniforms.get("scrollSpeed").value;
	}

	set scrollSpeed(value) {
		this.uniforms.get("scrollSpeed").value = value;

		if (value !== 0) {
			this.defines.set("SCROLL", "1");
		} else {
			this.defines.delete("SCROLL");
		}
		this.setChanged();
	}

	setSize(width, height) {
		this._resolution.set(width, height);
		this.uniforms.get("count").value = Math.round(height * this._density);
	}

}
