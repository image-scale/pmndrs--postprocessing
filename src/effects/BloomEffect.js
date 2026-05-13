import { SRGBColorSpace, Uniform, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution.js";
import { BlendFunction } from "../enums/index.js";
import { KawaseBlurPass } from "../passes/KawaseBlurPass.js";
import { BrightnessPass } from "../passes/BrightnessPass.js";
import { MipmapBlurPass } from "../passes/MipmapBlurPass.js";
import { Effect } from "./Effect.js";

const bloomFragmentShader = `
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D map;
#else
uniform lowp sampler2D map;
#endif

uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = texture2D(map, uv) * intensity;
}`;

export class BloomEffect extends Effect {

	constructor({
		blendFunction = BlendFunction.SCREEN,
		luminanceThreshold = 1.0,
		luminanceSmoothing = 0.03,
		mipmapBlur = true,
		intensity = 1.0,
		radius = 0.85,
		levels = 8,
		kernelSize,
		resolutionScale = 0.5,
		resolutionX,
		resolutionY
	} = {}) {

		super("BloomEffect", bloomFragmentShader, {
			blendFunction,
			uniforms: new Map([
				["map", new Uniform(null)],
				["intensity", new Uniform(intensity)]
			])
		});

		this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget.texture.name = "Bloom.Target";

		this.blurPass = new KawaseBlurPass({
			kernelSize: kernelSize !== undefined ? kernelSize : 3,
			resolutionScale
		});

		this.luminancePass = new BrightnessPass({ colorOutput: true });
		const lumMat = this.luminancePass.luminanceMaterial;
		lumMat.threshold = luminanceThreshold;
		lumMat.smoothing = luminanceSmoothing;

		this.mipmapBlurPass = new MipmapBlurPass();
		this.mipmapBlurPass.enabled = mipmapBlur;
		this.mipmapBlurPass.radius = radius;
		this.mipmapBlurPass.levels = levels;

		if (mipmapBlur) {
			this.uniforms.get("map").value = this.mipmapBlurPass.texture;
		} else {
			this.uniforms.get("map").value = this.renderTarget.texture;
		}

		this.resolution = new Resolution(this,
			resolutionX || Resolution.AUTO_SIZE,
			resolutionY || Resolution.AUTO_SIZE,
			resolutionScale
		);
		this.resolution.addEventListener("change", () => {
			this.setSize(this.resolution.baseWidth, this.resolution.baseHeight);
		});
	}

	get texture() {
		return this.mipmapBlurPass.enabled
			? this.mipmapBlurPass.texture
			: this.renderTarget.texture;
	}

	get luminanceMaterial() {
		return this.luminancePass.fullscreenMaterial;
	}

	get intensity() {
		return this.uniforms.get("intensity").value;
	}

	set intensity(value) {
		this.uniforms.get("intensity").value = value;
	}

	update(renderer, inputBuffer, deltaTime) {
		const luminanceOn = this.luminancePass.enabled;
		const mipmapOn = this.mipmapBlurPass.enabled;

		if (luminanceOn && mipmapOn) {
			this.luminancePass.render(renderer, inputBuffer);
			this.mipmapBlurPass.render(renderer, this.luminancePass.renderTarget);
		} else if (luminanceOn) {
			this.luminancePass.render(renderer, inputBuffer);
			this.blurPass.render(renderer, this.luminancePass.renderTarget, this.renderTarget);
		} else if (mipmapOn) {
			this.mipmapBlurPass.render(renderer, inputBuffer);
		} else {
			this.blurPass.render(renderer, inputBuffer, this.renderTarget);
		}
	}

	setSize(width, height) {
		const r = this.resolution;
		r.setBaseSize(width, height);
		this.renderTarget.setSize(r.width, r.height);
		this.blurPass.resolution.setPreferredSize(r.width, r.height);
		this.luminancePass.setSize(width, height);
		this.mipmapBlurPass.setSize(width, height);
	}

	initialize(renderer, alpha, frameBufferType) {
		this.blurPass.initialize(renderer, alpha, frameBufferType);
		this.luminancePass.initialize(renderer, alpha, frameBufferType);
		this.mipmapBlurPass.initialize(renderer, alpha, frameBufferType);

		if (frameBufferType !== undefined) {
			this.renderTarget.texture.type = frameBufferType;
			if (renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {
				this.renderTarget.texture.colorSpace = SRGBColorSpace;
			}
		}
	}

}
