import { ShaderMaterial, NoBlending, Uniform, Vector2 } from "three";

const vertexShader = `
uniform vec2 texelSize;

varying vec2 vUv;
varying vec2 vUv0, vUv1, vUv2, vUv3;
varying vec2 vUv4, vUv5, vUv6, vUv7;

void main() {
	vUv = position.xy * 0.5 + 0.5;

	vUv0 = vUv + texelSize * vec2(-1.0, 1.0);
	vUv1 = vUv + texelSize * vec2(0.0, 1.0);
	vUv2 = vUv + texelSize * vec2(1.0, 1.0);
	vUv3 = vUv + texelSize * vec2(-1.0, 0.0);

	vUv4 = vUv + texelSize * vec2(1.0, 0.0);
	vUv5 = vUv + texelSize * vec2(-1.0, -1.0);
	vUv6 = vUv + texelSize * vec2(0.0, -1.0);
	vUv7 = vUv + texelSize * vec2(1.0, -1.0);

	gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const fragmentShader = `
#ifdef FRAMEBUFFER_PRECISION_HIGH
	uniform mediump sampler2D inputBuffer;
	uniform mediump sampler2D supportBuffer;
#else
	uniform lowp sampler2D inputBuffer;
	uniform lowp sampler2D supportBuffer;
#endif

uniform float radius;

varying vec2 vUv;
varying vec2 vUv0, vUv1, vUv2, vUv3;
varying vec2 vUv4, vUv5, vUv6, vUv7;

void main() {
	vec4 c = vec4(0.0);

	c += texture2D(inputBuffer, vUv0) * 0.0625;
	c += texture2D(inputBuffer, vUv1) * 0.125;
	c += texture2D(inputBuffer, vUv2) * 0.0625;
	c += texture2D(inputBuffer, vUv3) * 0.125;
	c += texture2D(inputBuffer, vUv)  * 0.25;
	c += texture2D(inputBuffer, vUv4) * 0.125;
	c += texture2D(inputBuffer, vUv5) * 0.0625;
	c += texture2D(inputBuffer, vUv6) * 0.125;
	c += texture2D(inputBuffer, vUv7) * 0.0625;

	vec4 baseColor = texture2D(supportBuffer, vUv);
	gl_FragColor = mix(baseColor, c, radius);
}
`;

export class UpsamplingMaterial extends ShaderMaterial {

	constructor() {
		super({
			name: "UpsamplingMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				supportBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				radius: new Uniform(0.85)
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

	get supportBuffer() {
		return this.uniforms.supportBuffer.value;
	}

	set supportBuffer(value) {
		this.uniforms.supportBuffer.value = value;
	}

	get radius() {
		return this.uniforms.radius.value;
	}

	set radius(value) {
		this.uniforms.radius.value = value;
	}

	setSize(width, height) {
		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
	}

}
