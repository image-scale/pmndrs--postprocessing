import { ShaderMaterial, NoBlending, Uniform, Vector2 } from "three";
import { GaussKernel } from "../core/GaussKernel.js";

const vertexShader = `
uniform vec2 texelSize;
uniform vec2 direction;
uniform float scale;

varying vec2 vOffset;
varying vec2 vUv;

void main() {
	vOffset = direction * texelSize * scale;
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const fragmentShader = `
#ifdef FRAMEBUFFER_PRECISION_HIGH
	uniform mediump sampler2D inputBuffer;
#else
	uniform lowp sampler2D inputBuffer;
#endif

uniform vec2 kernel[STEPS];

varying vec2 vOffset;
varying vec2 vUv;

void main() {
	vec4 result = texture2D(inputBuffer, vUv) * kernel[0].y;

	for(int i = 1; i < STEPS; ++i) {
		vec2 offset = kernel[i].x * vOffset;
		vec4 c0 = texture2D(inputBuffer, vUv + offset);
		vec4 c1 = texture2D(inputBuffer, vUv - offset);
		result += (c0 + c1) * kernel[i].y;
	}

	gl_FragColor = result;
}
`;

export class GaussianBlurMaterial extends ShaderMaterial {

	constructor(kernelSize = 35) {
		super({
			name: "GaussianBlurMaterial",
			defines: {
				STEPS: "0"
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				direction: new Uniform(new Vector2()),
				scale: new Uniform(1.0),
				kernel: new Uniform([])
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			vertexShader,
			fragmentShader
		});

		this.generateKernel(kernelSize);
	}

	get inputBuffer() {
		return this.uniforms.inputBuffer.value;
	}

	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}

	get direction() {
		return this.uniforms.direction.value;
	}

	set direction(value) {
		this.uniforms.direction.value.copy(value);
	}

	get scale() {
		return this.uniforms.scale.value;
	}

	set scale(value) {
		this.uniforms.scale.value = value;
	}

	generateKernel(kernelSize) {
		const kernel = new GaussKernel(kernelSize);
		const offsets = kernel.linearOffsets;
		const weights = kernel.linearWeights;
		const steps = offsets.length;

		const packed = [];
		for (let i = 0; i < steps; i++) {
			packed.push(new Vector2(offsets[i], weights[i]));
		}

		this.uniforms.kernel.value = packed;
		this.defines.STEPS = steps.toFixed(0);
		this.needsUpdate = true;
	}

	setSize(width, height) {
		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
	}

}
