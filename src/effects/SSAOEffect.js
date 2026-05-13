import { BasicDepthPacking, Color, RepeatWrapping, RGBAFormat, Uniform, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution.js";
import { BlendFunction, EffectAttribute } from "../enums/index.js";
import { NoiseTexture } from "../textures/NoiseTexture.js";
import { SSAOMaterial } from "../materials/SSAOMaterial.js";
import { DepthDownsamplingPass } from "../passes/DepthDownsamplingPass.js";
import { MaterialPass } from "../passes/MaterialPass.js";
import { Effect } from "./Effect.js";

const NOISE_TEXTURE_SIZE = 64;

const fragmentShader = `
uniform lowp sampler2D aoBuffer;
uniform float luminanceInfluence;
uniform float intensity;

#if defined(DEPTH_AWARE_UPSAMPLING) && defined(NORMAL_DEPTH)
	#ifdef GL_FRAGMENT_PRECISION_HIGH
		uniform highp sampler2D normalDepthBuffer;
	#else
		uniform mediump sampler2D normalDepthBuffer;
	#endif
#endif

#ifdef COLORIZE
	uniform vec3 color;
#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
	float aoLinear = texture2D(aoBuffer, uv).r;

	#if defined(DEPTH_AWARE_UPSAMPLING) && defined(NORMAL_DEPTH) && __VERSION__ == 300
		vec4 normalDepth[4];
		normalDepth[0] = textureOffset(normalDepthBuffer, uv, ivec2(0, 0));
		normalDepth[1] = textureOffset(normalDepthBuffer, uv, ivec2(0, 1));
		normalDepth[2] = textureOffset(normalDepthBuffer, uv, ivec2(1, 0));
		normalDepth[3] = textureOffset(normalDepthBuffer, uv, ivec2(1, 1));

		float dot01 = dot(normalDepth[0].rgb, normalDepth[1].rgb);
		float dot02 = dot(normalDepth[0].rgb, normalDepth[2].rgb);
		float dot03 = dot(normalDepth[0].rgb, normalDepth[3].rgb);

		float minDot = min(dot01, min(dot02, dot03));
		float s = step(THRESHOLD, minDot);

		float smallestDistance = 1.0;
		int index;

		for (int i = 0; i < 4; ++i) {
			float distance = abs(depth - normalDepth[i].a);
			if (distance < smallestDistance) {
				smallestDistance = distance;
				index = i;
			}
		}

		ivec2 offsets[4];
		offsets[0] = ivec2(0, 0);
		offsets[1] = ivec2(0, 1);
		offsets[2] = ivec2(1, 0);
		offsets[3] = ivec2(1, 1);

		ivec2 coord = ivec2(uv * vec2(textureSize(aoBuffer, 0))) + offsets[index];
		float aoNearest = texelFetch(aoBuffer, coord, 0).r;

		float ao = mix(aoNearest, aoLinear, s);
	#else
		float ao = aoLinear;
	#endif

	float l = luminance(inputColor.rgb);
	ao = mix(ao, 0.0, l * luminanceInfluence);
	ao = clamp(ao * intensity, 0.0, 1.0);

	#ifdef COLORIZE
		outputColor = vec4(1.0 - ao * (1.0 - color), inputColor.a);
	#else
		outputColor = vec4(vec3(1.0 - ao), inputColor.a);
	#endif
}
`;

export class SSAOEffect extends Effect {

	constructor(camera, normalBuffer, {
		blendFunction = BlendFunction.MULTIPLY,
		samples = 9,
		rings = 7,
		normalDepthBuffer = null,
		depthAwareUpsampling = true,
		distanceThreshold = 0.97,
		distanceFalloff = 0.03,
		rangeThreshold = 0.0005,
		rangeFalloff = 0.001,
		minRadiusScale = 0.1,
		luminanceInfluence = 0.7,
		radius = 0.1825,
		intensity = 1.0,
		bias = 0.025,
		fade = 0.01,
		color = null,
		resolutionScale = 1.0,
		resolutionX = Resolution.AUTO_SIZE,
		resolutionY = Resolution.AUTO_SIZE
	} = {}) {

		super("SSAOEffect", fragmentShader, {
			blendFunction,
			attributes: EffectAttribute.DEPTH,
			defines: new Map([
				["THRESHOLD", "0.997"]
			]),
			uniforms: new Map([
				["aoBuffer", new Uniform(null)],
				["normalDepthBuffer", new Uniform(normalDepthBuffer)],
				["luminanceInfluence", new Uniform(luminanceInfluence)],
				["color", new Uniform(null)],
				["intensity", new Uniform(intensity)]
			])
		});

		this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget.texture.name = "AO.Target";
		this.uniforms.get("aoBuffer").value = this.renderTarget.texture;

		this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		this.resolution.addEventListener("change", () => {
			this.setSize(this.resolution.baseWidth, this.resolution.baseHeight);
		});

		this.camera = camera;

		this.depthDownsamplingPass = new DepthDownsamplingPass({ normalBuffer, resolutionScale });
		this.depthDownsamplingPass.enabled = (normalDepthBuffer === null);

		this.ssaoPass = new MaterialPass(new SSAOMaterial(camera));

		const noiseTexture = new NoiseTexture(NOISE_TEXTURE_SIZE, NOISE_TEXTURE_SIZE, RGBAFormat);
		noiseTexture.wrapS = noiseTexture.wrapT = RepeatWrapping;

		const ssaoMaterial = this.ssaoMaterial;
		ssaoMaterial.normalBuffer = normalBuffer;
		ssaoMaterial.noiseTexture = noiseTexture;
		ssaoMaterial.minRadiusScale = minRadiusScale;
		ssaoMaterial.samples = samples;
		ssaoMaterial.radius = radius;
		ssaoMaterial.rings = rings;
		ssaoMaterial.fade = fade;
		ssaoMaterial.bias = bias;
		ssaoMaterial.distanceThreshold = distanceThreshold;
		ssaoMaterial.distanceFalloff = distanceFalloff;
		ssaoMaterial.proximityThreshold = rangeThreshold;
		ssaoMaterial.proximityFalloff = rangeFalloff;

		if (normalDepthBuffer !== null) {
			this.ssaoMaterial.normalDepthBuffer = normalDepthBuffer;
			this.defines.set("NORMAL_DEPTH", "1");
		}

		this.depthAwareUpsampling = depthAwareUpsampling;
		this.color = color;
	}

	set mainCamera(value) {
		this.camera = value;
		this.ssaoMaterial.copyCameraSettings(value);
	}

	get normalBuffer() {
		return this.ssaoMaterial.normalBuffer;
	}

	set normalBuffer(value) {
		this.ssaoMaterial.normalBuffer = value;
		this.depthDownsamplingPass.fullscreenMaterial.normalBuffer = value;
	}

	get ssaoMaterial() {
		return this.ssaoPass.fullscreenMaterial;
	}

	get samples() {
		return this.ssaoMaterial.samples;
	}

	set samples(value) {
		this.ssaoMaterial.samples = value;
	}

	get rings() {
		return this.ssaoMaterial.rings;
	}

	set rings(value) {
		this.ssaoMaterial.rings = value;
	}

	get radius() {
		return this.ssaoMaterial.radius;
	}

	set radius(value) {
		this.ssaoMaterial.radius = value;
	}

	get depthAwareUpsampling() {
		return this.defines.has("DEPTH_AWARE_UPSAMPLING");
	}

	set depthAwareUpsampling(value) {
		if (this.depthAwareUpsampling !== value) {
			if (value) {
				this.defines.set("DEPTH_AWARE_UPSAMPLING", "1");
			} else {
				this.defines.delete("DEPTH_AWARE_UPSAMPLING");
			}
			this.setChanged();
		}
	}

	get color() {
		return this.uniforms.get("color").value;
	}

	set color(value) {
		const uniforms = this.uniforms;
		const defines = this.defines;

		if (value !== null) {
			if (defines.has("COLORIZE")) {
				uniforms.get("color").value.set(value);
			} else {
				defines.set("COLORIZE", "1");
				uniforms.get("color").value = new Color(value);
				this.setChanged();
			}
		} else if (defines.has("COLORIZE")) {
			defines.delete("COLORIZE");
			uniforms.get("color").value = null;
			this.setChanged();
		}
	}

	get luminanceInfluence() {
		return this.uniforms.get("luminanceInfluence").value;
	}

	set luminanceInfluence(value) {
		this.uniforms.get("luminanceInfluence").value = value;
	}

	get intensity() {
		return this.uniforms.get("intensity").value;
	}

	set intensity(value) {
		this.uniforms.get("intensity").value = value;
	}

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
		this.depthDownsamplingPass.setDepthTexture(depthTexture, depthPacking);
		this.ssaoMaterial.depthBuffer = depthTexture;
		this.ssaoMaterial.depthPacking = depthPacking;
	}

	update(renderer, inputBuffer, deltaTime) {
		if (this.depthDownsamplingPass.enabled) {
			this.depthDownsamplingPass.render(renderer);
		}
		this.ssaoPass.render(renderer, null, this.renderTarget);
	}

	setSize(width, height) {
		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		const w = resolution.width;
		const h = resolution.height;

		this.ssaoMaterial.copyCameraSettings(this.camera);
		this.ssaoMaterial.setSize(w, h);
		this.renderTarget.setSize(w, h);

		this.depthDownsamplingPass.resolution.scale = resolution.scale;
		this.depthDownsamplingPass.setSize(width, height);
	}

	initialize(renderer, alpha, frameBufferType) {
		try {
			let normalDepthBuffer = this.uniforms.get("normalDepthBuffer").value;
			if (normalDepthBuffer === null) {
				this.depthDownsamplingPass.initialize(renderer, alpha, frameBufferType);
				normalDepthBuffer = this.depthDownsamplingPass.texture;
				this.uniforms.get("normalDepthBuffer").value = normalDepthBuffer;
				this.ssaoMaterial.normalDepthBuffer = normalDepthBuffer;
				this.defines.set("NORMAL_DEPTH", "1");
			}
		} catch (e) {
			this.depthDownsamplingPass.enabled = false;
		}
	}

}
