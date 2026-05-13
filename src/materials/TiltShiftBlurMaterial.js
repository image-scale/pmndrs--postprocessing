import { KawaseBlurMaterial } from "./KawaseBlurMaterial.js";
import { Uniform, Vector2, Vector4 } from "three";

const tiltVertexShader = `
uniform vec4 texelSize;
uniform float kernel;
uniform float scale;
uniform float aspect;
uniform vec2 rotation;

varying vec2 vUv;
varying vec2 vUv2;
varying vec2 vOffset;

void main() {
	vec2 uv = position.xy * 0.5 + 0.5;

	vUv = uv;

	vUv2 = (uv - 0.5) * 2.0 * vec2(aspect, 1.0);
	vUv2 = vec2(dot(rotation, vUv2), dot(rotation, vec2(vUv2.y, -vUv2.x)));

	vOffset = (texelSize.xy * vec2(kernel) + texelSize.zw) * scale;

	gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const tiltFragmentShader = `
#ifdef FRAMEBUFFER_PRECISION_HIGH
	uniform mediump sampler2D inputBuffer;
#else
	uniform lowp sampler2D inputBuffer;
#endif

uniform vec4 maskParams;

varying vec2 vUv;
varying vec2 vUv2;
varying vec2 vOffset;

float linearGradientMask(const in float x) {
	return smoothstep(maskParams.x, maskParams.y, x) -
		smoothstep(maskParams.w, maskParams.z, x);
}

void main() {
	vec2 dUv = vOffset * (1.0 - linearGradientMask(vUv2.y));

	vec4 sum = texture2D(inputBuffer, vec2(vUv.x - dUv.x, vUv.y + dUv.y));
	sum += texture2D(inputBuffer, vec2(vUv.x + dUv.x, vUv.y + dUv.y));
	sum += texture2D(inputBuffer, vec2(vUv.x + dUv.x, vUv.y - dUv.y));
	sum += texture2D(inputBuffer, vec2(vUv.x - dUv.x, vUv.y - dUv.y));
	gl_FragColor = sum * 0.25;
}
`;

export class TiltShiftBlurMaterial extends KawaseBlurMaterial {

	constructor({
		kernelSize,
		offset = 0.0,
		rotation = 0.0,
		focusArea = 0.4,
		feather = 0.3
	} = {}) {
		super(kernelSize);

		this.name = "TiltShiftBlurMaterial";
		this.vertexShader = tiltVertexShader;
		this.fragmentShader = tiltFragmentShader;

		this.uniforms.aspect = new Uniform(1.0);
		this.uniforms.rotation = new Uniform(new Vector2());
		this.uniforms.maskParams = new Uniform(new Vector4());

		this._offset = offset;
		this._focusArea = focusArea;
		this._feather = feather;
		this.rotation = rotation;
		this._updateMaskParams();
	}

	get offset() {
		return this._offset;
	}

	set offset(value) {
		this._offset = value;
		this._updateMaskParams();
	}

	get rotation() {
		return Math.acos(this.uniforms.rotation.value.x);
	}

	set rotation(value) {
		this.uniforms.rotation.value.set(Math.cos(value), Math.sin(value));
	}

	get focusArea() {
		return this._focusArea;
	}

	set focusArea(value) {
		this._focusArea = value;
		this._updateMaskParams();
	}

	get feather() {
		return this._feather;
	}

	set feather(value) {
		this._feather = value;
		this._updateMaskParams();
	}

	_updateMaskParams() {
		const a = Math.max(this._focusArea, 0.0);
		const b = Math.max(a - this._feather, 0.0);
		this.uniforms.maskParams.value.set(
			this._offset - a,
			this._offset - b,
			this._offset + a,
			this._offset + b
		);
	}

	setSize(width, height) {
		super.setSize(width, height);
		this.uniforms.aspect.value = width / height;
	}

}
