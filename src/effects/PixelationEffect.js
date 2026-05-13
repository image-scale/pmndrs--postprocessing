import { Uniform, Vector2, Vector4 } from "three";
import { Effect } from "./Effect.js";

const fragmentShader = `
uniform bool active;
uniform vec4 d;

void mainUv(inout vec2 uv) {
	if(active) {
		uv = d.xy * (floor(uv * d.zw) + 0.5);
	}
}
`;

export class PixelationEffect extends Effect {

	constructor(granularity = 30.0) {
		super("PixelationEffect", fragmentShader);

		this.uniforms = new Map([
			["active", new Uniform(false)],
			["d", new Uniform(new Vector4())]
		]);

		this._resolution = new Vector2();
		this._granularity = 0;
		this.granularity = granularity;
	}

	get granularity() {
		return this._granularity;
	}

	set granularity(value) {
		let d = Math.floor(value);
		if (d % 2 > 0) {
			d += 1;
		}
		this._granularity = d;
		this.uniforms.get("active").value = (d > 0);
		this.setSize(this._resolution.x, this._resolution.y);
	}

	setSize(width, height) {
		this._resolution.set(width, height);
		const g = this._granularity;

		if (g > 0 && width > 0 && height > 0) {
			const x = g / width;
			const y = g / height;
			this.uniforms.get("d").value.set(x, y, 1.0 / x, 1.0 / y);
		}
	}

}
