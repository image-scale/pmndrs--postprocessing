import { NoBlending, ShaderMaterial, Uniform } from "three";

const vertexShader = `
varying vec2 vUv;

void main() {
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);
}`;

const fragmentShader = `
#include <packing>

#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)

uniform lowp sampler2D luminanceBuffer0;
uniform lowp sampler2D luminanceBuffer1;

uniform float minLuminance;
uniform float deltaTime;
uniform float tau;

varying vec2 vUv;

void main() {
	float l0 = unpackRGBAToFloat(texture2D(luminanceBuffer0, vUv));

	#if __VERSION__ < 300
		float l1 = texture2DLodEXT(luminanceBuffer1, vUv, MIP_LEVEL_1X1).r;
	#else
		float l1 = textureLod(luminanceBuffer1, vUv, MIP_LEVEL_1X1).r;
	#endif

	l0 = max(minLuminance, l0);
	l1 = max(minLuminance, l1);

	float adaptedLum = l0 + (l1 - l0) * (1.0 - exp(-deltaTime * tau));
	gl_FragColor = (adaptedLum == 1.0) ? vec4(1.0) : packFloatToRGBA(adaptedLum);
}`;

export class AdaptiveLuminanceMaterial extends ShaderMaterial {

	constructor() {
		super({
			name: "AdaptiveLuminanceMaterial",
			defines: {
				MIP_LEVEL_1X1: "0.0"
			},
			uniforms: {
				luminanceBuffer0: new Uniform(null),
				luminanceBuffer1: new Uniform(null),
				minLuminance: new Uniform(0.01),
				deltaTime: new Uniform(0.0),
				tau: new Uniform(1.0)
			},
			extensions: {
				shaderTextureLOD: true
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});
	}

	set luminanceBuffer0(value) {
		this.uniforms.luminanceBuffer0.value = value;
	}

	set luminanceBuffer1(value) {
		this.uniforms.luminanceBuffer1.value = value;
	}

	set mipLevel1x1(value) {
		this.defines.MIP_LEVEL_1X1 = value.toFixed(1);
		this.needsUpdate = true;
	}

	set deltaTime(value) {
		this.uniforms.deltaTime.value = value;
	}

	get minLuminance() {
		return this.uniforms.minLuminance.value;
	}

	set minLuminance(value) {
		this.uniforms.minLuminance.value = value;
	}

	get adaptationRate() {
		return this.uniforms.tau.value;
	}

	set adaptationRate(value) {
		this.uniforms.tau.value = value;
	}

}
