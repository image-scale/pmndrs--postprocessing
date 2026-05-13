import { jest } from "@jest/globals";
import { BloomEffect } from "../../src/effects/BloomEffect.js";
import { BlendFunction } from "../../src/enums/index.js";
import { MipmapBlurPass } from "../../src/passes/MipmapBlurPass.js";
import { BrightnessPass } from "../../src/passes/BrightnessPass.js";
import { KawaseBlurPass } from "../../src/passes/KawaseBlurPass.js";

describe("BloomEffect", () => {
	test("can be instantiated with defaults", () => {
		const effect = new BloomEffect();
		expect(effect.name).toBe("BloomEffect");
	});

	test("default blend function is SCREEN", () => {
		const effect = new BloomEffect();
		expect(effect.blendMode.blendFunction).toBe(BlendFunction.SCREEN);
	});

	test("default intensity is 1.0", () => {
		const effect = new BloomEffect();
		expect(effect.intensity).toBe(1.0);
	});

	test("intensity getter/setter works", () => {
		const effect = new BloomEffect({ intensity: 2.0 });
		expect(effect.intensity).toBe(2.0);
		effect.intensity = 0.5;
		expect(effect.intensity).toBe(0.5);
	});

	test("has luminancePass (BrightnessPass)", () => {
		const effect = new BloomEffect();
		expect(effect.luminancePass).toBeInstanceOf(BrightnessPass);
	});

	test("has mipmapBlurPass", () => {
		const effect = new BloomEffect();
		expect(effect.mipmapBlurPass).toBeInstanceOf(MipmapBlurPass);
	});

	test("has blurPass (KawaseBlurPass)", () => {
		const effect = new BloomEffect();
		expect(effect.blurPass).toBeInstanceOf(KawaseBlurPass);
	});

	test("mipmap blur is enabled by default", () => {
		const effect = new BloomEffect();
		expect(effect.mipmapBlurPass.enabled).toBe(true);
	});

	test("texture returns mipmapBlurPass texture when mipmap is enabled", () => {
		const effect = new BloomEffect({ mipmapBlur: true });
		expect(effect.texture).toBe(effect.mipmapBlurPass.texture);
	});

	test("texture returns renderTarget texture when mipmap is disabled", () => {
		const effect = new BloomEffect({ mipmapBlur: false });
		expect(effect.texture).toBe(effect.renderTarget.texture);
	});

	test("luminanceMaterial returns the brightness material", () => {
		const effect = new BloomEffect();
		expect(effect.luminanceMaterial).toBe(effect.luminancePass.fullscreenMaterial);
	});

	test("luminance threshold is configurable", () => {
		const effect = new BloomEffect({ luminanceThreshold: 0.5 });
		expect(effect.luminanceMaterial.threshold).toBe(0.5);
	});

	test("luminance smoothing is configurable", () => {
		const effect = new BloomEffect({ luminanceSmoothing: 0.1 });
		expect(effect.luminanceMaterial.smoothing).toBe(0.1);
	});

	test("mipmap radius is configurable", () => {
		const effect = new BloomEffect({ radius: 0.5 });
		expect(effect.mipmapBlurPass.radius).toBe(0.5);
	});

	test("mipmap levels is configurable", () => {
		const effect = new BloomEffect({ levels: 4 });
		expect(effect.mipmapBlurPass.levels).toBe(4);
	});

	test("has a resolution manager", () => {
		const effect = new BloomEffect();
		expect(effect.resolution).toBeDefined();
	});

	test("map uniform points to mipmap texture when enabled", () => {
		const effect = new BloomEffect({ mipmapBlur: true });
		expect(effect.uniforms.get("map").value).toBe(effect.mipmapBlurPass.texture);
	});

	test("map uniform points to renderTarget texture when mipmap disabled", () => {
		const effect = new BloomEffect({ mipmapBlur: false });
		expect(effect.uniforms.get("map").value).toBe(effect.renderTarget.texture);
	});

	test("fragment shader contains mainImage", () => {
		const effect = new BloomEffect();
		expect(effect.fragmentShader).toContain("mainImage");
		expect(effect.fragmentShader).toContain("intensity");
	});

	test("custom blend function", () => {
		const effect = new BloomEffect({ blendFunction: BlendFunction.ADD });
		expect(effect.blendMode.blendFunction).toBe(BlendFunction.ADD);
	});

	test("setSize propagates to sub-passes", () => {
		const effect = new BloomEffect();
		effect.setSize(1920, 1080);
		const lumTarget = effect.luminancePass.renderTarget;
		expect(lumTarget.width).toBeGreaterThan(0);
		expect(lumTarget.height).toBeGreaterThan(0);
	});

	test("renderTarget has no depth buffer", () => {
		const effect = new BloomEffect();
		expect(effect.renderTarget.depthBuffer).toBe(false);
	});
});
