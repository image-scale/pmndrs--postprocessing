import { ShaderMaterial, NoBlending } from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const fragmentShader = `
#include <common>

#ifdef FRAMEBUFFER_PRECISION_HIGH
	uniform mediump sampler2D inputBuffer;
#else
	uniform lowp sampler2D inputBuffer;
#endif

#ifdef RANGE
	uniform vec2 range;
#endif

uniform float threshold;
uniform float smoothing;
varying vec2 vUv;

void main() {
	vec4 texel = texture2D(inputBuffer, vUv);
	float l = luminance(texel.rgb);

	#ifdef THRESHOLD
		l = smoothstep(threshold, threshold + smoothing, l);
	#endif

	#ifdef COLOR
		gl_FragColor = vec4(texel.rgb * l, l);
	#else
		gl_FragColor = vec4(l, l, l, 1.0);
	#endif

	#ifdef RANGE
		float low = step(range.x, l);
		float high = step(l, range.y);
		l *= low * high;
		gl_FragColor = vec4(l);
	#endif
}
`;

export class BrightnessMaterial extends ShaderMaterial {

	constructor(colorOutput = false, luminanceRange = null) {
		super({
			name: "BrightnessMaterial",
			uniforms: {
				inputBuffer: { value: null },
				threshold: { value: 0.0 },
				smoothing: { value: 1.0 },
				range: { value: null }
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			vertexShader,
			fragmentShader
		});

		this.colorOutput = colorOutput;
		this.luminanceRange = luminanceRange;
	}

	get inputBuffer() {
		return this.uniforms.inputBuffer.value;
	}

	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
	}

	get threshold() {
		return this.uniforms.threshold.value;
	}

	set threshold(value) {
		this.uniforms.threshold.value = value;
		if (value > 0 || this.uniforms.smoothing.value > 0) {
			this.defines.THRESHOLD = "1";
		} else {
			delete this.defines.THRESHOLD;
		}
		this.needsUpdate = true;
	}

	get smoothing() {
		return this.uniforms.smoothing.value;
	}

	set smoothing(value) {
		this.uniforms.smoothing.value = value;
		if (this.uniforms.threshold.value > 0 || value > 0) {
			this.defines.THRESHOLD = "1";
		} else {
			delete this.defines.THRESHOLD;
		}
		this.needsUpdate = true;
	}

	get colorOutput() {
		return this.defines.COLOR !== undefined;
	}

	set colorOutput(value) {
		if (value) {
			this.defines.COLOR = "1";
		} else {
			delete this.defines.COLOR;
		}
		this.needsUpdate = true;
	}

	get luminanceRange() {
		return this.uniforms.range.value;
	}

	set luminanceRange(value) {
		this.uniforms.range.value = value;
		if (value !== null) {
			this.defines.RANGE = "1";
		} else {
			delete this.defines.RANGE;
		}
		this.needsUpdate = true;
	}

}
