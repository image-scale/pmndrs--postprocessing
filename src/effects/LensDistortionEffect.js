import { Uniform, Vector2 } from "three";
import { Effect } from "./Effect.js";

const lensDistortionFragment = `
uniform vec2 distortion;
uniform vec2 principalPoint;
uniform vec2 focalLength;
uniform float skew;

float mask(const in vec2 uv) {
	return float(uv.s >= 0.0 && uv.s <= 1.0 && uv.t >= 0.0 && uv.t <= 1.0);
}

void mainUv(inout vec2 uv) {
	vec2 xn = 2.0 * (uv.st - 0.5);
	vec3 xDistorted = vec3((1.0 + distortion * dot(xn, xn)) * xn, 1.0);

	mat3 kk = mat3(
		vec3(focalLength.x, 0.0, 0.0),
		vec3(skew * focalLength.x, focalLength.y, 0.0),
		vec3(principalPoint.x, principalPoint.y, 1.0)
	);

	uv = (kk * xDistorted).xy * 0.5 + 0.5;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = mask(uv) * inputColor;
}`;

export class LensDistortionEffect extends Effect {

	constructor({
		distortion = new Vector2(0, 0),
		principalPoint = new Vector2(0, 0),
		focalLength = new Vector2(1, 1),
		skew = 0
	} = {}) {
		super("LensDistortionEffect", lensDistortionFragment, {
			uniforms: new Map([
				["distortion", new Uniform(distortion)],
				["principalPoint", new Uniform(principalPoint)],
				["focalLength", new Uniform(focalLength)],
				["skew", new Uniform(skew)]
			])
		});
	}

	get distortion() {
		return this.uniforms.get("distortion").value;
	}

	set distortion(value) {
		this.uniforms.get("distortion").value = value;
	}

	get principalPoint() {
		return this.uniforms.get("principalPoint").value;
	}

	set principalPoint(value) {
		this.uniforms.get("principalPoint").value = value;
	}

	get focalLength() {
		return this.uniforms.get("focalLength").value;
	}

	set focalLength(value) {
		this.uniforms.get("focalLength").value = value;
	}

	get skew() {
		return this.uniforms.get("skew").value;
	}

	set skew(value) {
		this.uniforms.get("skew").value = value;
	}

}
