import { jest } from "@jest/globals";
import { PixelationEffect } from "../../src/effects/PixelationEffect.js";

describe("PixelationEffect", () => {
	test("can be instantiated with default granularity", () => {
		const e = new PixelationEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("PixelationEffect");
	});

	test("default granularity is 30", () => {
		const e = new PixelationEffect();
		expect(e.granularity).toBe(30);
	});

	test("granularity is floored to even integer", () => {
		const e = new PixelationEffect(15);
		expect(e.granularity).toBe(16);
		const e2 = new PixelationEffect(14.7);
		expect(e2.granularity).toBe(14);
	});

	test("granularity of 0 deactivates the effect", () => {
		const e = new PixelationEffect(0);
		expect(e.uniforms.get("active").value).toBe(false);
	});

	test("positive granularity activates the effect", () => {
		const e = new PixelationEffect(10);
		expect(e.uniforms.get("active").value).toBe(true);
	});

	test("setSize computes d uniform correctly", () => {
		const e = new PixelationEffect(10);
		e.setSize(100, 100);
		const d = e.uniforms.get("d").value;
		expect(d.x).toBeCloseTo(0.1);
		expect(d.y).toBeCloseTo(0.1);
		expect(d.z).toBeCloseTo(10.0);
		expect(d.w).toBeCloseTo(10.0);
	});

	test("uses mainUv not mainImage", () => {
		const e = new PixelationEffect();
		expect(e.getFragmentShader()).toContain("mainUv");
		expect(e.getFragmentShader()).not.toContain("mainImage");
	});

	test("custom granularity via constructor", () => {
		const e = new PixelationEffect(50);
		expect(e.granularity).toBe(50);
	});
});
