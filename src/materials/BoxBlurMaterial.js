import { ShaderMaterial, NoBlending, Uniform, Vector2 } from "three";

const vertexShader = `
uniform vec2 texelSize;
uniform float scale;

varying vec2 vUv;

void main() {
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

uniform vec2 texelSize;
uniform float scale;

varying vec2 vUv;

void main() {
	vec4 result = vec4(0.0);
	vec2 s = texelSize * scale;

	for(int x = -KERNEL_SIZE_HALF; x <= KERNEL_SIZE_HALF; ++x) {
		for(int y = -KERNEL_SIZE_HALF; y <= KERNEL_SIZE_HALF; ++y) {
			result += texture2D(inputBuffer, vUv + vec2(x, y) * s);
		}
	}

	gl_FragColor = result * INV_KERNEL_SIZE_SQ;
}
`;

export class BoxBlurMaterial extends ShaderMaterial {

	constructor(kernelSize = 5) {
		const k = (kernelSize % 2 === 0) ? kernelSize + 1 : kernelSize;
		const half = Math.floor(k / 2);

		super({
			name: "BoxBlurMaterial",
			defines: {
				KERNEL_SIZE: k.toFixed(0),
				KERNEL_SIZE_HALF: half.toFixed(0),
				KERNEL_SIZE_SQ: (k * k).toFixed(0),
				INV_KERNEL_SIZE_SQ: (1.0 / (k * k)).toFixed(6)
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				scale: new Uniform(1.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			vertexShader,
			fragmentShader
		});
	}

	get inputBuffer() {
		return this.uniforms.inputBuffer.value;
	}

	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}

	get scale() {
		return this.uniforms.scale.value;
	}

	set scale(value) {
		this.uniforms.scale.value = value;
	}

	setSize(width, height) {
		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
	}

}
