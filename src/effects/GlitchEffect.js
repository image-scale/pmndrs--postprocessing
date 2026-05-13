import { NearestFilter, RGBAFormat, RepeatWrapping, Uniform, Vector2 } from "three";
import { GlitchMode } from "../enums/index.js";
import { NoiseTexture } from "../textures/NoiseTexture.js";
import { Effect } from "./Effect.js";

const glitchFragment = `
uniform lowp sampler2D perturbationMap;

uniform bool active;
uniform float columns;
uniform float random;
uniform vec2 seeds;
uniform vec2 distortion;

void mainUv(inout vec2 uv) {
	if(active) {
		if(uv.y < distortion.x + columns && uv.y > distortion.x - columns * random) {
			float sx = clamp(ceil(seeds.x), 0.0, 1.0);
			uv.y = sx * (1.0 - (uv.y + distortion.y)) + (1.0 - sx) * distortion.y;
		}

		if(uv.x < distortion.y + columns && uv.x > distortion.y - columns * random) {
			float sy = clamp(ceil(seeds.y), 0.0, 1.0);
			uv.x = sy * distortion.x + (1.0 - sy) * (1.0 - (uv.x + distortion.x));
		}

		vec2 normal = texture2D(perturbationMap, uv * random * random).rg;
		uv += normal * seeds * (random * 0.2);
	}
}`;

export class GlitchEffect extends Effect {

	constructor({
		chromaticAberrationOffset = null,
		delay = new Vector2(1.5, 3.5),
		duration = new Vector2(0.6, 1.0),
		strength = new Vector2(0.3, 1.0),
		columns = 0.05,
		ratio = 0.85,
		perturbationMap = null,
		dtSize = 64
	} = {}) {
		super("GlitchEffect", glitchFragment, {
			uniforms: new Map([
				["perturbationMap", new Uniform(null)],
				["columns", new Uniform(columns)],
				["active", new Uniform(false)],
				["random", new Uniform(1.0)],
				["seeds", new Uniform(new Vector2())],
				["distortion", new Uniform(new Vector2())]
			])
		});

		if (perturbationMap === null) {
			const generated = new NoiseTexture(dtSize, dtSize, RGBAFormat);
			generated.name = "Glitch.Generated";
			this.perturbationMap = generated;
		} else {
			this.perturbationMap = perturbationMap;
		}

		this.time = 0;
		this.distortion = this.uniforms.get("distortion").value;
		this.delay = delay;
		this.duration = duration;
		this.breakPoint = new Vector2(
			delay.x + Math.random() * (delay.y - delay.x),
			duration.x + Math.random() * (duration.y - duration.x)
		);
		this.strength = strength;
		this.mode = GlitchMode.SPORADIC;
		this.ratio = ratio;
		this.chromaticAberrationOffset = chromaticAberrationOffset;
	}

	get active() {
		return this.uniforms.get("active").value;
	}

	get columns() {
		return this.uniforms.get("columns").value;
	}

	set columns(value) {
		this.uniforms.get("columns").value = value;
	}

	get perturbationMap() {
		return this.uniforms.get("perturbationMap").value;
	}

	set perturbationMap(value) {
		const old = this.perturbationMap;
		if (old !== null && old !== value && old.name === "Glitch.Generated") {
			old.dispose();
		}

		if (value !== null) {
			value.minFilter = NearestFilter;
			value.magFilter = NearestFilter;
			value.wrapS = RepeatWrapping;
			value.wrapT = RepeatWrapping;
			value.generateMipmaps = false;
		}

		this.uniforms.get("perturbationMap").value = value;
	}

	update(renderer, inputBuffer, deltaTime) {
		const mode = this.mode;
		const breakPoint = this.breakPoint;
		const uniforms = this.uniforms;
		const seeds = uniforms.get("seeds").value;

		if (mode === GlitchMode.DISABLED) {
			return;
		}

		this.time += deltaTime;
		let triggered = false;

		if (mode === GlitchMode.SPORADIC) {
			if (this.time >= breakPoint.x) {
				triggered = true;

				if (this.time >= breakPoint.x + breakPoint.y) {
					this.time = 0;
					breakPoint.set(
						this.delay.x + Math.random() * (this.delay.y - this.delay.x),
						this.duration.x + Math.random() * (this.duration.y - this.duration.x)
					);
				}
			}
		} else {
			triggered = true;
		}

		if (triggered) {
			const r = Math.random();
			seeds.set(r, Math.random());
			uniforms.get("random").value = r;

			if (r > this.ratio || mode === GlitchMode.CONSTANT_WILD) {
				this.distortion.set(
					(Math.random() - 0.5) * this.strength.y,
					(Math.random() - 0.5) * this.strength.y
				);
			} else if (triggered || mode === GlitchMode.CONSTANT_MILD) {
				this.distortion.set(
					(Math.random() - 0.5) * this.strength.x,
					(Math.random() - 0.5) * this.strength.x
				);
			}

			uniforms.get("active").value = true;

			if (this.chromaticAberrationOffset !== null) {
				const angle = Math.random() * Math.PI * 2;
				this.chromaticAberrationOffset.set(
					Math.cos(angle) * r * 0.001,
					Math.sin(angle) * r * 0.001
				);
			}
		} else {
			uniforms.get("active").value = false;

			if (this.chromaticAberrationOffset !== null) {
				this.chromaticAberrationOffset.set(0, 0);
			}
		}
	}

	dispose() {
		const map = this.perturbationMap;
		if (map !== null && map.name === "Glitch.Generated") {
			map.dispose();
		}
		super.dispose();
	}

}
