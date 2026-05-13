import { BasicDepthPacking, Matrix4, NoBlending, PerspectiveCamera, ShaderMaterial, Uniform, Vector2 } from "three";

const vertexShader = `
uniform vec2 noiseScale;

varying vec2 vUv;
varying vec2 vUv2;

void main() {
	vUv = position.xy * 0.5 + 0.5;
	vUv2 = vUv * noiseScale;
	gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const fragmentShader = `
#include <common>
#include <packing>

uniform vec2 cameraNearFar;
#define cameraNear cameraNearFar.x
#define cameraFar cameraNearFar.y

#ifdef NORMAL_DEPTH
	#ifdef GL_FRAGMENT_PRECISION_HIGH
		uniform highp sampler2D normalDepthBuffer;
	#else
		uniform mediump sampler2D normalDepthBuffer;
	#endif

	float readDepth(const in vec2 uv) {
		return texture2D(normalDepthBuffer, uv).a;
	}
#else
	uniform lowp sampler2D normalBuffer;

	#if DEPTH_PACKING == 3201
		uniform lowp sampler2D depthBuffer;
	#elif defined(GL_FRAGMENT_PRECISION_HIGH)
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

uniform lowp sampler2D noiseTexture;
uniform mat4 inverseProjectionMatrix;
uniform mat4 projectionMatrix;
uniform vec2 texelSize;
uniform float intensity;
uniform float minRadiusScale;
uniform float fade;
uniform float bias;
uniform vec2 distanceCutoff;
uniform vec2 proximityCutoff;

varying vec2 vUv;
varying vec2 vUv2;

float getViewZ(const in float depth) {
	#ifdef PERSPECTIVE_CAMERA
		return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
	#else
		return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
	#endif
}

vec3 getViewPosition(const in vec2 screenPosition, const in float depth, const in float viewZ) {
	vec4 clipPosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
	float clipW = projectionMatrix[2][3] * viewZ + projectionMatrix[3][3];
	clipPosition *= clipW;
	return (inverseProjectionMatrix * clipPosition).xyz;
}

float getAmbientOcclusion(const in vec3 p, const in vec3 n, const in float depth, const in vec2 uv) {
	float radiusScale = 1.0 - smoothstep(0.0, distanceCutoff.y, depth);
	radiusScale = radiusScale * (1.0 - minRadiusScale) + minRadiusScale;
	float radius = RADIUS * radiusScale;

	float noise = texture2D(noiseTexture, vUv2).r;
	float baseAngle = noise * PI2;
	float rings = SPIRAL_TURNS * PI2;

	float occlusion = 0.0;
	int taps = 0;

	for (int i = 0; i < SAMPLES_INT; ++i) {
		float alpha = (float(i) + 0.5) * INV_SAMPLES_FLOAT;
		float angle = alpha * rings + baseAngle;
		vec2 rotation = vec2(cos(angle), sin(angle));
		vec2 coords = alpha * radius * rotation * texelSize + uv;

		if (coords.s < 0.0 || coords.s > 1.0 || coords.t < 0.0 || coords.t > 1.0) {
			continue;
		}

		float sampleDepth = readDepth(coords);
		float viewZ = getViewZ(sampleDepth);

		#ifdef PERSPECTIVE_CAMERA
			float linearSampleDepth = viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
		#else
			float linearSampleDepth = sampleDepth;
		#endif

		float proximity = abs(depth - linearSampleDepth);

		if (proximity < proximityCutoff.y) {
			float falloff = 1.0 - smoothstep(proximityCutoff.x, proximityCutoff.y, proximity);
			vec3 Q = getViewPosition(coords, sampleDepth, viewZ);
			vec3 v = Q - p;
			float vv = dot(v, v);
			float vn = dot(v, n) - bias;
			float f = max(RADIUS_SQ - vv, 0.0) / RADIUS_SQ;
			occlusion += (f * f * f * max(vn / (fade + vv), 0.0)) * falloff;
		}

		++taps;
	}

	return occlusion / (4.0 * max(float(taps), 1.0));
}

void main() {
	#ifdef NORMAL_DEPTH
		vec4 normalDepth = texture2D(normalDepthBuffer, vUv);
	#else
		vec4 normalDepth = vec4(texture2D(normalBuffer, vUv).xyz, readDepth(vUv));
	#endif

	float ao = 0.0;
	float depth = normalDepth.a;
	float viewZ = getViewZ(depth);

	#ifdef PERSPECTIVE_CAMERA
		float linearDepth = viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
	#else
		float linearDepth = depth;
	#endif

	if (linearDepth < distanceCutoff.y) {
		vec3 viewPosition = getViewPosition(vUv, depth, viewZ);
		vec3 viewNormal = unpackRGBToNormal(normalDepth.rgb);
		ao += getAmbientOcclusion(viewPosition, viewNormal, linearDepth, vUv);

		float d = smoothstep(distanceCutoff.x, distanceCutoff.y, linearDepth);
		ao = mix(ao, 0.0, d);
	}

	gl_FragColor.r = ao;
}
`;

export class SSAOMaterial extends ShaderMaterial {

	constructor(camera) {
		super({
			name: "SSAOMaterial",
			defines: {
				SAMPLES_INT: "0",
				INV_SAMPLES_FLOAT: "0.0",
				SPIRAL_TURNS: "0.0",
				RADIUS: "1.0",
				RADIUS_SQ: "1.0",
				DEPTH_PACKING: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				normalBuffer: new Uniform(null),
				normalDepthBuffer: new Uniform(null),
				noiseTexture: new Uniform(null),
				inverseProjectionMatrix: new Uniform(new Matrix4()),
				projectionMatrix: new Uniform(new Matrix4()),
				texelSize: new Uniform(new Vector2()),
				cameraNearFar: new Uniform(new Vector2()),
				distanceCutoff: new Uniform(new Vector2()),
				proximityCutoff: new Uniform(new Vector2()),
				noiseScale: new Uniform(new Vector2()),
				minRadiusScale: new Uniform(0.33),
				intensity: new Uniform(1.0),
				fade: new Uniform(0.01),
				bias: new Uniform(0.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.copyCameraSettings(camera);
		this.resolution = new Vector2();
		this.r = 1.0;
	}

	set normalDepthBuffer(value) {
		this.uniforms.normalDepthBuffer.value = value;
		if (value !== null) {
			this.defines.NORMAL_DEPTH = "1";
		} else {
			delete this.defines.NORMAL_DEPTH;
		}
		this.needsUpdate = true;
	}

	set normalBuffer(value) {
		this.uniforms.normalBuffer.value = value;
	}

	get normalBuffer() {
		return this.uniforms.normalBuffer.value;
	}

	set depthBuffer(value) {
		this.uniforms.depthBuffer.value = value;
	}

	set depthPacking(value) {
		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;
	}

	set noiseTexture(value) {
		this.uniforms.noiseTexture.value = value;
	}

	get samples() {
		return Number(this.defines.SAMPLES_INT);
	}

	set samples(value) {
		this.defines.SAMPLES_INT = value.toFixed(0);
		this.defines.INV_SAMPLES_FLOAT = (1.0 / value).toFixed(9);
		this.needsUpdate = true;
	}

	get rings() {
		return Number(this.defines.SPIRAL_TURNS);
	}

	set rings(value) {
		this.defines.SPIRAL_TURNS = value.toFixed(1);
		this.needsUpdate = true;
	}

	get intensity() {
		return this.uniforms.intensity.value;
	}

	set intensity(value) {
		this.uniforms.intensity.value = value;
	}

	get fade() {
		return this.uniforms.fade.value;
	}

	set fade(value) {
		this.uniforms.fade.value = value;
	}

	get bias() {
		return this.uniforms.bias.value;
	}

	set bias(value) {
		this.uniforms.bias.value = value;
	}

	get minRadiusScale() {
		return this.uniforms.minRadiusScale.value;
	}

	set minRadiusScale(value) {
		this.uniforms.minRadiusScale.value = value;
	}

	updateRadius() {
		const radius = this.r * this.resolution.height;
		this.defines.RADIUS = radius.toFixed(11);
		this.defines.RADIUS_SQ = (radius * radius).toFixed(11);
		this.needsUpdate = true;
	}

	get radius() {
		return this.r;
	}

	set radius(value) {
		this.r = Math.min(Math.max(value, 1e-6), 1.0);
		this.updateRadius();
	}

	get distanceThreshold() {
		return this.uniforms.distanceCutoff.value.x;
	}

	set distanceThreshold(value) {
		this.uniforms.distanceCutoff.value.set(
			Math.min(Math.max(value, 0.0), 1.0),
			Math.min(Math.max(value + this.distanceFalloff, 0.0), 1.0)
		);
	}

	get distanceFalloff() {
		return this.uniforms.distanceCutoff.value.y - this.distanceThreshold;
	}

	set distanceFalloff(value) {
		this.uniforms.distanceCutoff.value.y = Math.min(Math.max(this.distanceThreshold + value, 0.0), 1.0);
	}

	get proximityThreshold() {
		return this.uniforms.proximityCutoff.value.x;
	}

	set proximityThreshold(value) {
		this.uniforms.proximityCutoff.value.set(
			Math.min(Math.max(value, 0.0), 1.0),
			Math.min(Math.max(value + this.proximityFalloff, 0.0), 1.0)
		);
	}

	get proximityFalloff() {
		return this.uniforms.proximityCutoff.value.y - this.proximityThreshold;
	}

	set proximityFalloff(value) {
		this.uniforms.proximityCutoff.value.y = Math.min(Math.max(this.proximityThreshold + value, 0.0), 1.0);
	}

	copyCameraSettings(camera) {
		if (camera) {
			this.uniforms.cameraNearFar.value.set(camera.near, camera.far);
			this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);
			this.uniforms.inverseProjectionMatrix.value.copy(camera.projectionMatrix).invert();
			if (camera instanceof PerspectiveCamera) {
				this.defines.PERSPECTIVE_CAMERA = "1";
			} else {
				delete this.defines.PERSPECTIVE_CAMERA;
			}
			this.needsUpdate = true;
		}
	}

	setSize(width, height) {
		const uniforms = this.uniforms;
		const noiseTexture = uniforms.noiseTexture.value;
		if (noiseTexture !== null) {
			uniforms.noiseScale.value.set(
				width / noiseTexture.image.width,
				height / noiseTexture.image.height
			);
		}
		uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
		this.resolution.set(width, height);
		this.updateRadius();
	}

}
