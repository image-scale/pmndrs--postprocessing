import { jest } from "@jest/globals";
import { BlendMode } from "../../../src/effects/blending/BlendMode.js";
import { BlendFunction } from "../../../src/enums/index.js";

describe("BlendMode", () => {
	test("can be created with NORMAL blend function", () => {
		const bm = new BlendMode(BlendFunction.NORMAL);
		expect(bm).toBeTruthy();
		expect(bm.blendFunction).toBe(BlendFunction.NORMAL);
	});

	test("opacity defaults to 1.0", () => {
		const bm = new BlendMode(BlendFunction.NORMAL);
		expect(bm.getOpacity()).toBe(1.0);
	});

	test("opacity can be set via constructor", () => {
		const bm = new BlendMode(BlendFunction.NORMAL, 0.5);
		expect(bm.getOpacity()).toBe(0.5);
	});

	test("setOpacity updates value", () => {
		const bm = new BlendMode(BlendFunction.NORMAL);
		bm.setOpacity(0.3);
		expect(bm.getOpacity()).toBeCloseTo(0.3);
	});

	test("changing blendFunction dispatches change event", () => {
		const bm = new BlendMode(BlendFunction.NORMAL);
		const handler = jest.fn();
		bm.addEventListener("change", handler);
		bm.blendFunction = BlendFunction.SCREEN;
		expect(handler).toHaveBeenCalled();
		expect(bm.blendFunction).toBe(BlendFunction.SCREEN);
	});

	test("setting same blendFunction does not dispatch", () => {
		const bm = new BlendMode(BlendFunction.NORMAL);
		const handler = jest.fn();
		bm.addEventListener("change", handler);
		bm.blendFunction = BlendFunction.NORMAL;
		expect(handler).not.toHaveBeenCalled();
	});

	test("getShaderCode returns GLSL for NORMAL", () => {
		const bm = new BlendMode(BlendFunction.NORMAL);
		const code = bm.getShaderCode();
		expect(code).toContain("blend");
		expect(code).toContain("mix(dst, src, opacity)");
	});

	test("getShaderCode returns GLSL for SCREEN", () => {
		const bm = new BlendMode(BlendFunction.SCREEN);
		const code = bm.getShaderCode();
		expect(code).toContain("blend");
		expect(code).toContain("dst.rgb + src.rgb");
	});

	test("getShaderCode returns null for DST (no-op)", () => {
		const bm = new BlendMode(BlendFunction.DST);
		expect(bm.getShaderCode()).toBeNull();
	});

	test("getShaderCode returns GLSL for all blend modes except DST", () => {
		for (const key of Object.keys(BlendFunction)) {
			const value = BlendFunction[key];
			if (key === "SKIP" || key === "SET") continue;
			const bm = new BlendMode(value);
			const code = bm.getShaderCode();
			if (value === BlendFunction.DST) {
				expect(code).toBeNull();
			} else {
				expect(code).toContain("blend");
			}
		}
	});

	test("getBlendFunction and setBlendFunction work", () => {
		const bm = new BlendMode(BlendFunction.NORMAL);
		expect(bm.getBlendFunction()).toBe(BlendFunction.NORMAL);
		bm.setBlendFunction(BlendFunction.ADD);
		expect(bm.getBlendFunction()).toBe(BlendFunction.ADD);
	});
});
