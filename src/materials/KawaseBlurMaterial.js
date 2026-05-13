import { ShaderMaterial, NoBlending, Uniform, Vector4 } from "three";
import { KernelSize } from "../enums/index.js";

const vertexShader = `
uniform vec4 texelSize;
uniform float kernel;
uniform float scale;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {
	vec2 uv = position.xy * 0.5 + 0.5;
	vec2 dUv = (texelSize.xy * vec2(kernel) + texelSize.zw) * scale;

	vUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);
	vUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);
	vUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);
	vUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);

	gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const fragmentShader = `
#ifdef FRAMEBUFFER_PRECISION_HIGH
	uniform mediump sampler2D inputBuffer;
#else
	uniform lowp sampler2D inputBuffer;
#endif

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {
	vec4 sum = texture2D(inputBuffer, vUv0);
	sum += texture2D(inputBuffer, vUv1);
	sum += texture2D(inputBuffer, vUv2);
	sum += texture2D(inputBuffer, vUv3);
	gl_FragColor = sum * 0.25;
}
`;

const kernelPresets = [
	new Float32Array([0.0, 0.0]),
	new Float32Array([0.0, 1.0, 1.0]),
	new Float32Array([0.0, 1.0, 1.0, 2.0]),
	new Float32Array([0.0, 1.0, 2.0, 2.0, 3.0]),
	new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 4.0, 5.0]),
	new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 8.0, 9.0, 10.0])
];

export class KawaseBlurMaterial extends ShaderMaterial {

	constructor(kernelSize = KernelSize.MEDIUM) {
		super({
			name: "KawaseBlurMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector4()),
				scale: new Uniform(1.0),
				kernel: new Uniform(0.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			vertexShader,
			fragmentShader
		});

		this._kernelSize = kernelSize;
	}

	get inputBuffer() {
		return this.uniforms.inputBuffer.value;
	}

	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}

	get kernelSequence() {
		return kernelPresets[this._kernelSize] || kernelPresets[KernelSize.MEDIUM];
	}

	get kernelSize() {
		return this._kernelSize;
	}

	set kernelSize(value) {
		this._kernelSize = value;
	}

	get scale() {
		return this.uniforms.scale.value;
	}

	set scale(value) {
		this.uniforms.scale.value = value;
	}

	setSize(width, height) {
		const x = 1.0 / width;
		const y = 1.0 / height;
		this.uniforms.texelSize.value.set(x, y, x * 0.5, y * 0.5);
	}

}
