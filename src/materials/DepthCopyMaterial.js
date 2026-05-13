import { BasicDepthPacking, NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";
import { DepthCopyMode } from "../enums/index.js";

const vertexShader = `
varying vec2 vUv;

#if DEPTH_COPY_MODE == 1
uniform vec2 texelPosition;
#endif

void main() {
	#if DEPTH_COPY_MODE == 1
		vUv = texelPosition;
	#else
		vUv = position.xy * 0.5 + 0.5;
	#endif
	gl_Position = vec4(position.xy, 1.0, 1.0);
}`;

const fragmentShader = `
#include <packing>

varying vec2 vUv;

#if INPUT_DEPTH_PACKING == 3201
uniform lowp sampler2D depthBuffer;
#elif defined(GL_FRAGMENT_PRECISION_HIGH)
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif

float readDepth(const in vec2 uv) {
	#if INPUT_DEPTH_PACKING == 3201
		return unpackRGBAToDepth(texture2D(depthBuffer, uv));
	#else
		return texture2D(depthBuffer, uv).r;
	#endif
}

void main() {
	#if INPUT_DEPTH_PACKING == OUTPUT_DEPTH_PACKING
		gl_FragColor = texture2D(depthBuffer, vUv);
	#else
		float depth = readDepth(vUv);
		#if OUTPUT_DEPTH_PACKING == 3201
			gl_FragColor = (depth == 1.0) ? vec4(1.0) : packDepthToRGBA(depth);
		#else
			gl_FragColor = vec4(vec3(depth), 1.0);
		#endif
	#endif
}`;

export class DepthCopyMaterial extends ShaderMaterial {

	constructor() {
		super({
			name: "DepthCopyMaterial",
			defines: {
				INPUT_DEPTH_PACKING: "0",
				OUTPUT_DEPTH_PACKING: "0",
				DEPTH_COPY_MODE: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				texelPosition: new Uniform(new Vector2())
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this._mode = DepthCopyMode.FULL;
	}

	get depthBuffer() {
		return this.uniforms.depthBuffer.value;
	}

	set depthBuffer(value) {
		this.uniforms.depthBuffer.value = value;
	}

	set inputDepthPacking(value) {
		this.defines.INPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;
	}

	get outputDepthPacking() {
		return Number(this.defines.OUTPUT_DEPTH_PACKING);
	}

	set outputDepthPacking(value) {
		this.defines.OUTPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;
	}

	get texelPosition() {
		return this.uniforms.texelPosition.value;
	}

	get mode() {
		return this._mode;
	}

	set mode(value) {
		this._mode = value;
		this.defines.DEPTH_COPY_MODE = value.toFixed(0);
		this.needsUpdate = true;
	}

}
