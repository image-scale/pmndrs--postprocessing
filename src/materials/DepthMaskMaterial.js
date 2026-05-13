import {
	AlwaysDepth,
	BasicDepthPacking,
	EqualDepth,
	GreaterDepth,
	GreaterEqualDepth,
	LessDepth,
	LessEqualDepth,
	NeverDepth,
	NoBlending,
	NotEqualDepth,
	PerspectiveCamera,
	ShaderMaterial,
	Uniform,
	Vector2
} from "three";

import { DepthTestStrategy } from "../enums/index.js";

const vertexShader = `
varying vec2 vUv;

void main() {
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);
}`;

const fragmentShader = `
#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer0;
uniform highp sampler2D depthBuffer1;
#else
uniform mediump sampler2D depthBuffer0;
uniform mediump sampler2D depthBuffer1;
#endif

uniform sampler2D inputBuffer;
uniform vec2 cameraNearFar;

float getViewZ(const in float depth) {
	#ifdef PERSPECTIVE_CAMERA
		return perspectiveDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);
	#else
		return orthographicDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);
	#endif
}

varying vec2 vUv;

void main() {
	vec2 depth;

	#if DEPTH_PACKING_0 == 3201
		depth.x = unpackRGBAToDepth(texture2D(depthBuffer0, vUv));
	#else
		depth.x = texture2D(depthBuffer0, vUv).r;
	#endif

	#if DEPTH_PACKING_1 == 3201
		depth.y = unpackRGBAToDepth(texture2D(depthBuffer1, vUv));
	#else
		depth.y = texture2D(depthBuffer1, vUv).r;
	#endif

	#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)
		float a = cameraNearFar.y / (cameraNearFar.y - cameraNearFar.x);
		float b = cameraNearFar.y * cameraNearFar.x / (cameraNearFar.x - cameraNearFar.y);
		float c = log2(cameraNearFar.y + 1.0);
		float d0 = pow(2.0, depth.x * c) - 1.0;
		depth.x = a + b / d0;
		float d1 = pow(2.0, depth.y * c) - 1.0;
		depth.y = a + b / d1;
	#elif defined(USE_REVERSED_DEPTH_BUFFER)
		depth.x = 1.0 - depth.x;
		depth.y = 1.0 - depth.y;
	#endif

	bool isMaxDepth = (depth.x == 1.0);

	#ifdef PERSPECTIVE_CAMERA
		depth.x = viewZToOrthographicDepth(getViewZ(depth.x), cameraNearFar.x, cameraNearFar.y);
		depth.y = viewZToOrthographicDepth(getViewZ(depth.y), cameraNearFar.x, cameraNearFar.y);
	#endif

	#if DEPTH_TEST_STRATEGY == 0
		bool keep = depthTest(depth.x, depth.y);
	#elif DEPTH_TEST_STRATEGY == 1
		bool keep = isMaxDepth || depthTest(depth.x, depth.y);
	#else
		bool keep = !isMaxDepth && depthTest(depth.x, depth.y);
	#endif

	if(keep) {
		gl_FragColor = texture2D(inputBuffer, vUv);
	} else {
		discard;
	}
}`;

export class DepthMaskMaterial extends ShaderMaterial {

	constructor() {
		super({
			name: "DepthMaskMaterial",
			defines: {
				DEPTH_EPSILON: "0.0001",
				DEPTH_PACKING_0: "0",
				DEPTH_PACKING_1: "0",
				DEPTH_TEST_STRATEGY: String(DepthTestStrategy.KEEP_MAX_DEPTH)
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer0: new Uniform(null),
				depthBuffer1: new Uniform(null),
				cameraNearFar: new Uniform(new Vector2(1, 1))
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.depthMode = LessDepth;
	}

	set depthBuffer0(value) {
		this.uniforms.depthBuffer0.value = value;
	}

	set depthPacking0(value) {
		this.defines.DEPTH_PACKING_0 = value.toFixed(0);
		this.needsUpdate = true;
	}

	set depthBuffer1(value) {
		this.uniforms.depthBuffer1.value = value;
	}

	set depthPacking1(value) {
		this.defines.DEPTH_PACKING_1 = value.toFixed(0);
		this.needsUpdate = true;
	}

	get maxDepthStrategy() {
		return Number(this.defines.DEPTH_TEST_STRATEGY);
	}

	set maxDepthStrategy(value) {
		this.defines.DEPTH_TEST_STRATEGY = value.toFixed(0);
		this.needsUpdate = true;
	}

	get epsilon() {
		return Number(this.defines.DEPTH_EPSILON);
	}

	set epsilon(value) {
		this.defines.DEPTH_EPSILON = value.toFixed(16);
		this.needsUpdate = true;
	}

	get depthMode() {
		return Number(this.defines.DEPTH_MODE);
	}

	set depthMode(value) {
		let test;

		switch (value) {
			case NeverDepth:
				test = "false";
				break;
			case AlwaysDepth:
				test = "true";
				break;
			case EqualDepth:
				test = "abs(d1 - d0) <= DEPTH_EPSILON";
				break;
			case NotEqualDepth:
				test = "abs(d1 - d0) > DEPTH_EPSILON";
				break;
			case LessDepth:
				test = "d0 > d1";
				break;
			case LessEqualDepth:
				test = "d0 >= d1";
				break;
			case GreaterEqualDepth:
				test = "d0 <= d1";
				break;
			case GreaterDepth:
			default:
				test = "d0 < d1";
				break;
		}

		this.defines.DEPTH_MODE = value.toFixed(0);
		this.defines["depthTest(d0, d1)"] = test;
		this.needsUpdate = true;
	}

	copyCameraSettings(camera) {
		if (camera) {
			this.uniforms.cameraNearFar.value.set(camera.near, camera.far);

			if (camera instanceof PerspectiveCamera) {
				this.defines.PERSPECTIVE_CAMERA = "1";
			} else {
				delete this.defines.PERSPECTIVE_CAMERA;
			}

			this.needsUpdate = true;
		}
	}

}
