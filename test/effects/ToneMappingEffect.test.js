import { jest } from "@jest/globals";
import { ToneMappingEffect } from "../../src/effects/ToneMappingEffect.js";
import { BlendFunction, ToneMappingMode } from "../../src/enums/index.js";
import { AdaptiveLuminancePass } from "../../src/passes/AdaptiveLuminancePass.js";
import { BrightnessPass } from "../../src/passes/BrightnessPass.js";

describe("ToneMappingEffect", () => {
	test("can be instantiated with defaults", () => {
		const effect = new ToneMappingEffect();
		expect(effect.name).toBe("ToneMappingEffect");
	});

	test("default blend function is SRC", () => {
		const effect = new ToneMappingEffect();
		expect(effect.blendMode.blendFunction).toBe(BlendFunction.SRC);
	});

	test("default mode is AGX", () => {
		const effect = new ToneMappingEffect();
		expect(effect.mode).toBe(ToneMappingMode.AGX);
	});

	test("mode can be set to REINHARD", () => {
		const effect = new ToneMappingEffect({ mode: ToneMappingMode.REINHARD });
		expect(effect.mode).toBe(ToneMappingMode.REINHARD);
	});

	test("mode can be set to LINEAR", () => {
		const effect = new ToneMappingEffect({ mode: ToneMappingMode.LINEAR });
		expect(effect.mode).toBe(ToneMappingMode.LINEAR);
	});

	test("mode can be set to ACES_FILMIC", () => {
		const effect = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
		expect(effect.mode).toBe(ToneMappingMode.ACES_FILMIC);
	});

	test("mode can be set to REINHARD2_ADAPTIVE", () => {
		const effect = new ToneMappingEffect({ mode: ToneMappingMode.REINHARD2_ADAPTIVE });
		expect(effect.mode).toBe(ToneMappingMode.REINHARD2_ADAPTIVE);
		expect(effect.adaptiveLuminancePass.enabled).toBe(true);
	});

	test("non-adaptive modes disable adaptive pass", () => {
		const effect = new ToneMappingEffect({ mode: ToneMappingMode.AGX });
		expect(effect.adaptiveLuminancePass.enabled).toBe(false);
	});

	test("whitePoint getter/setter works", () => {
		const effect = new ToneMappingEffect({ whitePoint: 5.0 });
		expect(effect.whitePoint).toBe(5.0);
		effect.whitePoint = 2.0;
		expect(effect.whitePoint).toBe(2.0);
	});

	test("middleGrey getter/setter works", () => {
		const effect = new ToneMappingEffect({ middleGrey: 0.8 });
		expect(effect.middleGrey).toBe(0.8);
		effect.middleGrey = 0.3;
		expect(effect.middleGrey).toBe(0.3);
	});

	test("averageLuminance getter/setter works", () => {
		const effect = new ToneMappingEffect({ averageLuminance: 2.0 });
		expect(effect.averageLuminance).toBe(2.0);
		effect.averageLuminance = 0.5;
		expect(effect.averageLuminance).toBe(0.5);
	});

	test("has luminancePass (BrightnessPass)", () => {
		const effect = new ToneMappingEffect();
		expect(effect.luminancePass).toBeInstanceOf(BrightnessPass);
	});

	test("has adaptiveLuminancePass", () => {
		const effect = new ToneMappingEffect();
		expect(effect.adaptiveLuminancePass).toBeInstanceOf(AdaptiveLuminancePass);
	});

	test("adaptiveLuminanceMaterial getter works", () => {
		const effect = new ToneMappingEffect();
		expect(effect.adaptiveLuminanceMaterial).toBe(effect.adaptiveLuminancePass.fullscreenMaterial);
	});

	test("resolution getter/setter rounds to power of two", () => {
		const effect = new ToneMappingEffect({ resolution: 256 });
		expect(effect.resolution).toBe(256);
	});

	test("resolution rounds up non-power-of-two", () => {
		const effect = new ToneMappingEffect({ resolution: 200 });
		expect(effect.resolution).toBe(256);
	});

	test("fragment shader contains tone mapping logic", () => {
		const effect = new ToneMappingEffect();
		expect(effect.fragmentShader).toContain("mainImage");
		expect(effect.fragmentShader).toContain("TONE_MAPPING_MODE");
	});

	test("setting same mode does not trigger change", () => {
		const effect = new ToneMappingEffect({ mode: ToneMappingMode.AGX });
		let changed = false;
		effect.addEventListener("change", () => { changed = true; });
		effect.mode = ToneMappingMode.AGX;
		expect(changed).toBe(false);
	});

	test("setting different mode triggers change", () => {
		const effect = new ToneMappingEffect({ mode: ToneMappingMode.AGX });
		let changed = false;
		effect.addEventListener("change", () => { changed = true; });
		effect.mode = ToneMappingMode.LINEAR;
		expect(changed).toBe(true);
	});

	test("mode defines include toneMapping macro", () => {
		const effect = new ToneMappingEffect({ mode: ToneMappingMode.LINEAR });
		expect(effect.defines.has("toneMapping(texel)")).toBe(true);
	});

	test("REINHARD2 mode has Reinhard2ToneMapping in shader", () => {
		const effect = new ToneMappingEffect({ mode: ToneMappingMode.REINHARD2 });
		expect(effect.fragmentShader).toContain("Reinhard2ToneMapping");
	});
});
