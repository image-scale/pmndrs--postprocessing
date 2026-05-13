import { jest } from "@jest/globals";
import { BrightnessPass } from "../../src/passes/BrightnessPass.js";
import { BrightnessMaterial } from "../../src/materials/BrightnessMaterial.js";
import { Resolution } from "../../src/core/Resolution.js";
import { Vector2, WebGLRenderTarget } from "three";

describe("BrightnessPass", () => {
	test("can be instantiated with defaults", () => {
		const pass = new BrightnessPass();
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("BrightnessPass");
	});

	test("needsSwap is false", () => {
		const pass = new BrightnessPass();
		expect(pass.needsSwap).toBe(false);
	});

	test("has a render target with named texture", () => {
		const pass = new BrightnessPass();
		expect(pass.renderTarget).toBeTruthy();
		expect(pass.texture).toBeTruthy();
		expect(pass.texture.name).toBe("BrightnessPass.Target");
	});

	test("texture getter returns render target texture", () => {
		const pass = new BrightnessPass();
		expect(pass.texture).toBe(pass.renderTarget.texture);
	});

	test("accepts a custom render target", () => {
		const rt = new WebGLRenderTarget(256, 256);
		const pass = new BrightnessPass({ renderTarget: rt });
		expect(pass.renderTarget).toBe(rt);
	});

	test("fullscreenMaterial is a BrightnessMaterial", () => {
		const pass = new BrightnessPass();
		expect(pass.fullscreenMaterial).toBeInstanceOf(BrightnessMaterial);
	});

	test("luminanceMaterial getter returns fullscreenMaterial", () => {
		const pass = new BrightnessPass();
		expect(pass.luminanceMaterial).toBe(pass.fullscreenMaterial);
	});

	test("passes colorOutput to material", () => {
		const pass = new BrightnessPass({ colorOutput: true });
		expect(pass.fullscreenMaterial.colorOutput).toBe(true);
	});

	test("passes luminanceRange to material", () => {
		const range = new Vector2(0.2, 0.8);
		const pass = new BrightnessPass({ luminanceRange: range });
		expect(pass.fullscreenMaterial.luminanceRange).toBe(range);
	});

	test("has a Resolution instance", () => {
		const pass = new BrightnessPass();
		expect(pass.resolution).toBeInstanceOf(Resolution);
	});

	test("respects resolutionScale", () => {
		const pass = new BrightnessPass({ resolutionScale: 0.5 });
		expect(pass.resolution.scale).toBe(0.5);
	});

	test("setSize updates render target through resolution", () => {
		const pass = new BrightnessPass({ resolutionScale: 0.5 });
		pass.setSize(800, 600);
		expect(pass.renderTarget.width).toBe(400);
		expect(pass.renderTarget.height).toBe(300);
	});

	test("setSize at full scale matches input size", () => {
		const pass = new BrightnessPass({ resolutionScale: 1.0 });
		pass.setSize(1024, 768);
		expect(pass.renderTarget.width).toBe(1024);
		expect(pass.renderTarget.height).toBe(768);
	});

	test("initialize sets framebuffer type on texture", () => {
		const pass = new BrightnessPass();
		pass.initialize(null, false, 1016);
		expect(pass.renderTarget.texture.type).toBe(1016);
		expect(pass.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH).toBe("1");
	});

	test("dispose does not throw", () => {
		const pass = new BrightnessPass();
		expect(() => pass.dispose()).not.toThrow();
	});
});
