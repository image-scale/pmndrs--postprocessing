import { BasicDepthPacking, NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

const vertexShader = `
uniform vec2 texelSize;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {
	vec2 uv = position.xy * 0.5 + 0.5;
	vUv0 = uv;
	vUv1 = vec2(uv.x, uv.y + texelSize.y);
	vUv2 = vec2(uv.x + texelSize.x, uv.y);
	vUv3 = uv + texelSize;
	gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

const fragmentShader = `
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH
	uniform highp sampler2D depthBuffer;
#else
	uniform mediump sampler2D depthBuffer;
#endif

#ifdef DOWNSAMPLE_NORMALS
	uniform lowp sampler2D normalBuffer;
#endif

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

float readDepth(const in vec2 uv) {
	#if DEPTH_PACKING == 3201
		return unpackRGBAToDepth(texture2D(depthBuffer, uv));
	#else
		return texture2D(depthBuffer, uv).r;
	#endif
}

int findBestDepth(const in float samples[4]) {
	float c = (samples[0] + samples[1] + samples[2] + samples[3]) * 0.25;

	float distances[4];
	distances[0] = abs(c - samples[0]);
	distances[1] = abs(c - samples[1]);
	distances[2] = abs(c - samples[2]);
	distances[3] = abs(c - samples[3]);

	float maxDistance = max(
		max(distances[0], distances[1]),
		max(distances[2], distances[3])
	);

	int remaining[3];
	int rejected[3];
	int i, j, k;

	for (i = 0, j = 0, k = 0; i < 4; ++i) {
		if (distances[i] < maxDistance) {
			remaining[j++] = i;
		} else {
			rejected[k++] = i;
		}
	}

	for (; j < 3; ++j) {
		remaining[j] = rejected[--k];
	}

	vec3 s = vec3(
		samples[remaining[0]],
		samples[remaining[1]],
		samples[remaining[2]]
	);

	c = (s.x + s.y + s.z) / 3.0;
	distances[0] = abs(c - s.x);
	distances[1] = abs(c - s.y);
	distances[2] = abs(c - s.z);

	float minDistance = min(distances[0], min(distances[1], distances[2]));

	for (i = 0; i < 3; ++i) {
		if (distances[i] == minDistance) {
			break;
		}
	}

	return remaining[i];
}

void main() {
	float d[4];
	d[0] = readDepth(vUv0);
	d[1] = readDepth(vUv1);
	d[2] = readDepth(vUv2);
	d[3] = readDepth(vUv3);

	int index = findBestDepth(d);

	#ifdef DOWNSAMPLE_NORMALS
		vec3 n[4];
		n[0] = texture2D(normalBuffer, vUv0).rgb;
		n[1] = texture2D(normalBuffer, vUv1).rgb;
		n[2] = texture2D(normalBuffer, vUv2).rgb;
		n[3] = texture2D(normalBuffer, vUv3).rgb;
	#else
		vec3 n[4];
		n[0] = vec3(0.0);
		n[1] = vec3(0.0);
		n[2] = vec3(0.0);
		n[3] = vec3(0.0);
	#endif

	gl_FragColor = vec4(n[index], d[index]);
}
`;

export class DepthDownsamplingMaterial extends ShaderMaterial {

	constructor() {
		super({
			name: "DepthDownsamplingMaterial",
			defines: {
				DEPTH_PACKING: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				normalBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2())
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});
	}

	set depthBuffer(value) {
		this.uniforms.depthBuffer.value = value;
	}

	set depthPacking(value) {
		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;
	}

	set normalBuffer(value) {
		this.uniforms.normalBuffer.value = value;
		if (value !== null) {
			this.defines.DOWNSAMPLE_NORMALS = "1";
		} else {
			delete this.defines.DOWNSAMPLE_NORMALS;
		}
		this.needsUpdate = true;
	}

	setSize(width, height) {
		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
	}

}
