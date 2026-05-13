import { jest } from "@jest/globals";
import { ColorDepthEffect } from "../../src/effects/ColorDepthEffect.js";

describe("ColorDepthEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new ColorDepthEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("ColorDepthEffect");
	});

	test("default bit depth is 16", () => {
		const e = new ColorDepthEffect();
		expect(e.bitDepth).toBe(16);
	});

	test("factor uniform is computed from bits", () => {
		const e = new ColorDepthEffect({ bits: 16 });
		expect(e.uniforms.get("factor").value).toBeCloseTo(Math.pow(2.0, 16 / 3.0));
	});

	test("bitDepth setter updates factor", () => {
		const e = new ColorDepthEffect();
		e.bitDepth = 8;
		expect(e.bitDepth).toBe(8);
		expect(e.uniforms.get("factor").value).toBeCloseTo(Math.pow(2.0, 8 / 3.0));
	});

	test("fragment shader contains quantization logic", () => {
		const e = new ColorDepthEffect();
		expect(e.getFragmentShader()).toContain("floor");
		expect(e.getFragmentShader()).toContain("factor");
	});

	test("custom bit depth in constructor", () => {
		const e = new ColorDepthEffect({ bits: 4 });
		expect(e.bitDepth).toBe(4);
		expect(e.uniforms.get("factor").value).toBeCloseTo(Math.pow(2.0, 4 / 3.0));
	});
});
