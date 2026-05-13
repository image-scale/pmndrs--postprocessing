import { jest } from "@jest/globals";
import { SepiaEffect } from "../../src/effects/SepiaEffect.js";

describe("SepiaEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new SepiaEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("SepiaEffect");
	});

	test("intensity defaults to 1.0", () => {
		const e = new SepiaEffect();
		expect(e.intensity).toBe(1.0);
	});

	test("intensity maps to blend opacity", () => {
		const e = new SepiaEffect({ intensity: 0.5 });
		expect(e.intensity).toBe(0.5);
		expect(e.blendMode.opacity.value).toBe(0.5);
	});

	test("intensity setter updates blend opacity", () => {
		const e = new SepiaEffect();
		e.intensity = 0.75;
		expect(e.blendMode.opacity.value).toBe(0.75);
	});

	test("has sepia weight uniforms", () => {
		const e = new SepiaEffect();
		expect(e.uniforms.get("weightsR")).toBeTruthy();
		expect(e.uniforms.get("weightsG")).toBeTruthy();
		expect(e.uniforms.get("weightsB")).toBeTruthy();
	});

	test("sepia weights have correct default values", () => {
		const e = new SepiaEffect();
		const wr = e.uniforms.get("weightsR").value;
		expect(wr.x).toBeCloseTo(0.393);
		expect(wr.y).toBeCloseTo(0.769);
		expect(wr.z).toBeCloseTo(0.189);
	});

	test("fragment shader contains mainImage with dot products", () => {
		const e = new SepiaEffect();
		expect(e.getFragmentShader()).toContain("mainImage");
		expect(e.getFragmentShader()).toContain("dot");
	});
});
