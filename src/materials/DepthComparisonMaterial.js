import { NoBlending, PerspectiveCamera, RGBADepthPacking, ShaderMaterial, Uniform } from "three";

const vertexShader = `
#include <common>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>

varying float vViewZ;
varying vec4 vProjTexCoord;

void main() {
	#include <skinbase_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>

	vViewZ = mvPosition.z;
	vProjTexCoord = gl_Position;

	#include <clipping_planes_vertex>
}
`;

const fragmentShader = `
#include <packing>
#include <clipping_planes_pars_fragment>

#ifdef GL_FRAGMENT_PRECISION_HIGH
	uniform highp sampler2D depthBuffer;
#else
	uniform mediump sampler2D depthBuffer;
#endif

uniform float cameraNear;
uniform float cameraFar;

centroid varying float vViewZ;
centroid varying vec4 vProjTexCoord;

void main() {
	#include <clipping_planes_fragment>

	vec2 projTexCoord = (vProjTexCoord.xy / vProjTexCoord.w) * 0.5 + 0.5;

	#if DEPTH_PACKING == 3201
		float depth = unpackRGBAToDepth(texture2D(depthBuffer, projTexCoord));
	#else
		float depth = texture2D(depthBuffer, projTexCoord).r;
	#endif

	#ifdef PERSPECTIVE_CAMERA
		float viewZ = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
	#else
		float viewZ = orthographicDepthToViewZ(depth, cameraNear, cameraFar);
	#endif

	float depthTest = (-vViewZ > -viewZ) ? 1.0 : 0.0;
	gl_FragColor.rg = vec2(0.0, depthTest);
}
`;

export class DepthComparisonMaterial extends ShaderMaterial {

	constructor(depthTexture = null, camera) {
		super({
			name: "DepthComparisonMaterial",
			defines: {
				DEPTH_PACKING: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				cameraNear: new Uniform(0.3),
				cameraFar: new Uniform(1000)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.depthBuffer = depthTexture;
		this.depthPacking = RGBADepthPacking;
		this.copyCameraSettings(camera);
	}

	set depthBuffer(value) {
		this.uniforms.depthBuffer.value = value;
	}

	set depthPacking(value) {
		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;
	}

	copyCameraSettings(camera) {
		if (camera) {
			this.uniforms.cameraNear.value = camera.near;
			this.uniforms.cameraFar.value = camera.far;
			if (camera instanceof PerspectiveCamera) {
				this.defines.PERSPECTIVE_CAMERA = "1";
			} else {
				delete this.defines.PERSPECTIVE_CAMERA;
			}
			this.needsUpdate = true;
		}
	}

}
