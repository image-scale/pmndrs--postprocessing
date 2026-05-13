import { jest } from "@jest/globals";
import { BrightnessContrastEffect } from "../../src/effects/BrightnessContrastEffect.js";
import { BlendFunction } from "../../src/enums/index.js";
import { SRGBColorSpace } from "three";

describe("BrightnessContrastEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new BrightnessContrastEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("BrightnessContrastEffect");
	});

	test("default blend function is SRC", () => {
		const e = new BrightnessContrastEffect();
		expect(e.blendMode.blendFunction).toBe(BlendFunction.SRC);
	});

	test("brightness defaults to 0", () => {
		const e = new BrightnessContrastEffect();
		expect(e.brightness).toBe(0.0);
	});

	test("contrast defaults to 0", () => {
		const e = new BrightnessContrastEffect();
		expect(e.contrast).toBe(0.0);
	});

	test("brightness getter/setter works", () => {
		const e = new BrightnessContrastEffect({ brightness: 0.5 });
		expect(e.brightness).toBe(0.5);
		e.brightness = -0.3;
		expect(e.brightness).toBe(-0.3);
	});

	test("contrast getter/setter works", () => {
		const e = new BrightnessContrastEffect({ contrast: 0.7 });
		expect(e.contrast).toBe(0.7);
		e.contrast = -0.2;
		expect(e.contrast).toBe(-0.2);
	});

	test("inputColorSpace is sRGB", () => {
		const e = new BrightnessContrastEffect();
		expect(e.inputColorSpace).toBe(SRGBColorSpace);
	});

	test("fragment shader contains mainImage", () => {
		const e = new BrightnessContrastEffect();
		expect(e.getFragmentShader()).toContain("mainImage");
		expect(e.getFragmentShader()).toContain("brightness");
		expect(e.getFragmentShader()).toContain("contrast");
	});

	test("accepts custom blend function", () => {
		const e = new BrightnessContrastEffect({ blendFunction: BlendFunction.ADD });
		expect(e.blendMode.blendFunction).toBe(BlendFunction.ADD);
	});
});
