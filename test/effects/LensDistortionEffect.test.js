import { jest } from "@jest/globals";
import { LensDistortionEffect } from "../../src/effects/LensDistortionEffect.js";
import { Vector2 } from "three";

describe("LensDistortionEffect", () => {
	test("can be instantiated", () => {
		const effect = new LensDistortionEffect();
		expect(effect.name).toBe("LensDistortionEffect");
	});

	test("distortion defaults to (0,0)", () => {
		const effect = new LensDistortionEffect();
		expect(effect.distortion.x).toBe(0);
		expect(effect.distortion.y).toBe(0);
	});

	test("distortion getter/setter works", () => {
		const effect = new LensDistortionEffect();
		effect.distortion = new Vector2(0.5, -0.5);
		expect(effect.distortion.x).toBe(0.5);
	});

	test("principalPoint defaults to (0,0)", () => {
		const effect = new LensDistortionEffect();
		expect(effect.principalPoint.x).toBe(0);
	});

	test("focalLength defaults to (1,1)", () => {
		const effect = new LensDistortionEffect();
		expect(effect.focalLength.x).toBe(1);
		expect(effect.focalLength.y).toBe(1);
	});

	test("skew defaults to 0", () => {
		const effect = new LensDistortionEffect();
		expect(effect.skew).toBe(0);
	});

	test("skew getter/setter works", () => {
		const effect = new LensDistortionEffect({ skew: 0.1 });
		expect(effect.skew).toBe(0.1);
		effect.skew = 0.5;
		expect(effect.skew).toBe(0.5);
	});

	test("fragment shader contains lens distortion logic", () => {
		const effect = new LensDistortionEffect();
		expect(effect.fragmentShader).toContain("mainUv");
		expect(effect.fragmentShader).toContain("distortion");
	});

	test("no vertex shader", () => {
		const effect = new LensDistortionEffect();
		expect(effect.vertexShader).toBeNull();
	});
});
