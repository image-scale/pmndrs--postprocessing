import { jest } from "@jest/globals";
import { ScanlineEffect } from "../../src/effects/ScanlineEffect.js";
import { BlendFunction } from "../../src/enums/index.js";

describe("ScanlineEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new ScanlineEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("ScanlineEffect");
	});

	test("default blend function is OVERLAY", () => {
		const e = new ScanlineEffect();
		expect(e.blendMode.blendFunction).toBe(BlendFunction.OVERLAY);
	});

	test("default density is 1.25", () => {
		const e = new ScanlineEffect();
		expect(e.density).toBe(1.25);
	});

	test("default scrollSpeed is 0 and SCROLL define not set", () => {
		const e = new ScanlineEffect();
		expect(e.scrollSpeed).toBe(0.0);
		expect(e.defines.has("SCROLL")).toBe(false);
	});

	test("scrollSpeed setter enables SCROLL define", () => {
		const e = new ScanlineEffect();
		e.scrollSpeed = 1.5;
		expect(e.defines.has("SCROLL")).toBe(true);
		e.scrollSpeed = 0;
		expect(e.defines.has("SCROLL")).toBe(false);
	});

	test("setSize computes count from height and density", () => {
		const e = new ScanlineEffect({ density: 2.0 });
		e.setSize(800, 600);
		expect(e.uniforms.get("count").value).toBe(Math.round(600 * 2.0));
	});

	test("density setter triggers setSize recomputation", () => {
		const e = new ScanlineEffect();
		e.setSize(800, 600);
		e.density = 2.0;
		expect(e.uniforms.get("count").value).toBe(Math.round(600 * 2.0));
	});

	test("constructor with non-zero scrollSpeed sets SCROLL define", () => {
		const e = new ScanlineEffect({ scrollSpeed: 0.5 });
		expect(e.defines.has("SCROLL")).toBe(true);
	});

	test("fragment shader contains scanline logic", () => {
		const e = new ScanlineEffect();
		expect(e.getFragmentShader()).toContain("sin");
		expect(e.getFragmentShader()).toContain("cos");
		expect(e.getFragmentShader()).toContain("count");
	});
});
