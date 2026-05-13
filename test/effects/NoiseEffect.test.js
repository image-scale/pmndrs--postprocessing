import { jest } from "@jest/globals";
import { NoiseEffect } from "../../src/effects/NoiseEffect.js";
import { BlendFunction } from "../../src/enums/index.js";

describe("NoiseEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new NoiseEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("NoiseEffect");
	});

	test("default blend function is SCREEN", () => {
		const e = new NoiseEffect();
		expect(e.blendMode.blendFunction).toBe(BlendFunction.SCREEN);
	});

	test("premultiply defaults to false", () => {
		const e = new NoiseEffect();
		expect(e.premultiply).toBe(false);
		expect(e.defines.has("PREMULTIPLY")).toBe(false);
	});

	test("premultiply can be set to true", () => {
		const e = new NoiseEffect({ premultiply: true });
		expect(e.premultiply).toBe(true);
		expect(e.defines.has("PREMULTIPLY")).toBe(true);
	});

	test("premultiply setter toggles define", () => {
		const e = new NoiseEffect();
		e.premultiply = true;
		expect(e.defines.has("PREMULTIPLY")).toBe(true);
		e.premultiply = false;
		expect(e.defines.has("PREMULTIPLY")).toBe(false);
	});

	test("fragment shader contains mainImage", () => {
		const e = new NoiseEffect();
		expect(e.getFragmentShader()).toContain("mainImage");
	});
});
