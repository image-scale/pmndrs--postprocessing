import { jest } from "@jest/globals";
import { FXAAEffect } from "../../src/effects/FXAAEffect.js";
import { BlendFunction } from "../../src/enums/index.js";

describe("FXAAEffect", () => {
	test("can be instantiated", () => {
		const effect = new FXAAEffect();
		expect(effect.name).toBe("FXAAEffect");
	});

	test("default blend function is SRC", () => {
		const effect = new FXAAEffect();
		expect(effect.blendMode.blendFunction).toBe(BlendFunction.SRC);
	});

	test("default minEdgeThreshold", () => {
		const effect = new FXAAEffect();
		expect(effect.minEdgeThreshold).toBeCloseTo(0.0312);
	});

	test("minEdgeThreshold setter works", () => {
		const effect = new FXAAEffect();
		effect.minEdgeThreshold = 0.05;
		expect(effect.minEdgeThreshold).toBeCloseTo(0.05);
	});

	test("default maxEdgeThreshold", () => {
		const effect = new FXAAEffect();
		expect(effect.maxEdgeThreshold).toBeCloseTo(0.125);
	});

	test("maxEdgeThreshold setter works", () => {
		const effect = new FXAAEffect();
		effect.maxEdgeThreshold = 0.2;
		expect(effect.maxEdgeThreshold).toBeCloseTo(0.2);
	});

	test("default subpixelQuality", () => {
		const effect = new FXAAEffect();
		expect(effect.subpixelQuality).toBeCloseTo(0.75);
	});

	test("subpixelQuality setter works", () => {
		const effect = new FXAAEffect();
		effect.subpixelQuality = 1.0;
		expect(effect.subpixelQuality).toBe(1.0);
	});

	test("default samples is 12", () => {
		const effect = new FXAAEffect();
		expect(effect.samples).toBe(12);
	});

	test("samples setter works", () => {
		const effect = new FXAAEffect();
		effect.samples = 8;
		expect(effect.samples).toBe(8);
	});

	test("has vertex shader", () => {
		const effect = new FXAAEffect();
		expect(effect.vertexShader).toBeTruthy();
		expect(effect.vertexShader).toContain("vUvDown");
	});

	test("fragment shader contains FXAA logic", () => {
		const effect = new FXAAEffect();
		expect(effect.fragmentShader).toContain("fxaa");
		expect(effect.fragmentShader).toContain("QUALITY");
	});
});
