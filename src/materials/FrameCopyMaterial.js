import {
	ShaderMaterial,
	NoBlending,
	AlwaysDepth,
	Vector4
} from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const fragmentShader = `
#ifdef COLOR_WRITE
	#include <common>
	#include <dithering_pars_fragment>
	#ifdef FRAMEBUFFER_PRECISION_HIGH
		uniform mediump sampler2D inputBuffer;
	#else
		uniform lowp sampler2D inputBuffer;
	#endif
#endif

#ifdef DEPTH_WRITE
	#include <packing>
	#ifdef GL_FRAGMENT_PRECISION_HIGH
		uniform highp sampler2D depthBuffer;
	#else
		uniform mediump sampler2D depthBuffer;
	#endif
	float readDepth(const in vec2 uv) {
		#if DEPTH_PACKING == 3201
			return unpackRGBAToDepth(texture2D(depthBuffer, uv));
		#else
			return texture2D(depthBuffer, uv).r;
		#endif
	}
#endif

#ifdef USE_WEIGHTS
	uniform vec4 channelWeights;
#endif

varying vec2 vUv;

void main() {
	#ifdef COLOR_WRITE
		vec4 texel = texture2D(inputBuffer, vUv);
		#ifdef USE_WEIGHTS
			gl_FragColor = vec4(dot(texel, channelWeights));
		#else
			gl_FragColor = texel;
		#endif
		#include <dithering_fragment>
		#ifdef COLOR_SPACE_CONVERSION
			#include <colorspace_fragment>
		#endif
	#endif
	#ifdef DEPTH_WRITE
		gl_FragDepth = readDepth(vUv);
	#endif
}
`;

export class FrameCopyMaterial extends ShaderMaterial {

	constructor() {
		super({
			name: "FrameCopyMaterial",
			uniforms: {
				inputBuffer: { value: null },
				depthBuffer: { value: null },
				channelWeights: { value: null },
				opacity: { value: 1.0 }
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			vertexShader,
			fragmentShader
		});

		this.depthFunc = AlwaysDepth;
		this.defines.COLOR_SPACE_CONVERSION = "1";
		this.defines.DEPTH_PACKING = "0";
		this.defines.COLOR_WRITE = "1";
	}

	get inputBuffer() {
		return this.uniforms.inputBuffer.value;
	}

	set inputBuffer(value) {
		this.uniforms.inputBuffer.value = value;
		if (value !== null) {
			if (!this.defines.COLOR_WRITE) {
				this.defines.COLOR_WRITE = "1";
				this.colorWrite = true;
				this.needsUpdate = true;
			}
		} else {
			if (this.defines.COLOR_WRITE) {
				delete this.defines.COLOR_WRITE;
				this.colorWrite = false;
				this.needsUpdate = true;
			}
		}
	}

	get depthBuffer() {
		return this.uniforms.depthBuffer.value;
	}

	set depthBuffer(value) {
		this.uniforms.depthBuffer.value = value;
		if (value !== null) {
			if (!this.defines.DEPTH_WRITE) {
				this.defines.DEPTH_WRITE = "1";
				this.depthTest = true;
				this.depthWrite = true;
				this.needsUpdate = true;
			}
		} else {
			if (this.defines.DEPTH_WRITE) {
				delete this.defines.DEPTH_WRITE;
				this.depthTest = false;
				this.depthWrite = false;
				this.needsUpdate = true;
			}
		}
	}

	set depthPacking(value) {
		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;
	}

	get colorSpaceConversion() {
		return this.defines.COLOR_SPACE_CONVERSION !== undefined;
	}

	set colorSpaceConversion(value) {
		if (value) {
			this.defines.COLOR_SPACE_CONVERSION = "1";
		} else {
			delete this.defines.COLOR_SPACE_CONVERSION;
		}
		this.needsUpdate = true;
	}

	get channelWeights() {
		return this.uniforms.channelWeights.value;
	}

	set channelWeights(value) {
		this.uniforms.channelWeights.value = value;
		if (value !== null) {
			this.defines.USE_WEIGHTS = "1";
		} else {
			delete this.defines.USE_WEIGHTS;
		}
		this.needsUpdate = true;
	}

}
