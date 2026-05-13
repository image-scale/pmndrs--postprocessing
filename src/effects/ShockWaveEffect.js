import { Uniform, Vector2, Vector3 } from "three";
import { Effect } from "./Effect.js";

const HALF_PI = Math.PI * 0.5;

const shockWaveVertex = `
uniform float size;
uniform float cameraDistance;

varying float vSize;

void mainSupport() {
	vSize = (0.1 * cameraDistance) / size;
}`;

const shockWaveFragment = `
uniform bool active;
uniform vec2 center;
uniform float waveSize;
uniform float radius;
uniform float maxRadius;
uniform float amplitude;

varying float vSize;

void mainUv(inout vec2 uv) {
	if(active) {
		vec2 aspectCorrection = vec2(aspect, 1.0);
		vec2 difference = uv * aspectCorrection - center * aspectCorrection;
		float distance = sqrt(dot(difference, difference)) * vSize;

		if(distance > radius) {
			if(distance < radius + waveSize) {
				float angle = (distance - radius) * PI2 / waveSize;
				float cosSin = (1.0 - cos(angle)) * 0.5;

				float extent = maxRadius + waveSize;
				float decay = max(extent - distance * distance, 0.0) / extent;

				uv -= ((cosSin * amplitude * difference) / distance) * decay;
			}
		}
	}
}`;

export class ShockWaveEffect extends Effect {

	constructor(camera, position = new Vector3(), {
		speed = 2.0,
		maxRadius = 1.0,
		waveSize = 0.2,
		amplitude = 0.05
	} = {}) {
		super("ShockWaveEffect", shockWaveFragment, {
			vertexShader: shockWaveVertex,
			uniforms: new Map([
				["active", new Uniform(false)],
				["center", new Uniform(new Vector2(0.5, 0.5))],
				["cameraDistance", new Uniform(1.0)],
				["size", new Uniform(1.0)],
				["radius", new Uniform(-waveSize)],
				["maxRadius", new Uniform(maxRadius)],
				["waveSize", new Uniform(waveSize)],
				["amplitude", new Uniform(amplitude)]
			])
		});

		this.position = position;
		this.speed = speed;
		this._camera = camera;
		this.screenPosition = this.uniforms.get("center").value;
		this.time = 0.0;
		this._active = false;
	}

	set mainCamera(value) {
		this._camera = value;
	}

	get amplitude() {
		return this.uniforms.get("amplitude").value;
	}

	set amplitude(value) {
		this.uniforms.get("amplitude").value = value;
	}

	get waveSize() {
		return this.uniforms.get("waveSize").value;
	}

	set waveSize(value) {
		this.uniforms.get("waveSize").value = value;
	}

	get maxRadius() {
		return this.uniforms.get("maxRadius").value;
	}

	set maxRadius(value) {
		this.uniforms.get("maxRadius").value = value;
	}

	explode() {
		this.time = 0.0;
		this._active = true;
		this.uniforms.get("active").value = true;
	}

	update(renderer, inputBuffer, deltaTime) {
		if (!this._active) return;

		const camera = this._camera;
		const pos = this.position;
		const uniforms = this.uniforms;

		const v = new Vector3();
		camera.getWorldDirection(v);

		const ab = new Vector3().subVectors(pos, camera.position);

		if (v.angleTo(ab) > HALF_PI) {
			uniforms.get("active").value = false;
			return;
		}

		uniforms.get("cameraDistance").value = camera.position.distanceTo(pos);

		const projected = pos.clone().project(camera);
		this.screenPosition.set(
			(projected.x * 0.5) + 0.5,
			(projected.y * 0.5) + 0.5
		);

		this.time += deltaTime * this.speed;
		const waveSize = this.waveSize;
		const radius = this.time - waveSize;
		uniforms.get("radius").value = radius;

		if (radius >= (this.maxRadius + waveSize) * 2.0) {
			this._active = false;
			uniforms.get("active").value = false;
		}
	}

}
