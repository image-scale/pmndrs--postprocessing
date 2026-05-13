import { jest } from "@jest/globals";
import { ChromaticAberrationEffect } from "../../src/effects/ChromaticAberrationEffect.js";
import { EffectAttribute } from "../../src/enums/index.js";
import { Vector2 } from "three";

describe("ChromaticAberrationEffect", () => {
	test("can be instantiated", () => {
		const effect = new ChromaticAberrationEffect();
		expect(effect.name).toBe("ChromaticAberrationEffect");
	});

	test("has CONVOLUTION attribute", () => {
		const effect = new ChromaticAberrationEffect();
		expect(effect.getAttributes() & EffectAttribute.CONVOLUTION).toBeTruthy();
	});

	test("offset defaults to small values", () => {
		const effect = new ChromaticAberrationEffect();
		expect(effect.offset.x).toBeCloseTo(0.001);
		expect(effect.offset.y).toBeCloseTo(0.0005);
	});

	test("offset getter/setter works", () => {
		const effect = new ChromaticAberrationEffect();
		effect.offset = new Vector2(0.01, 0.02);
		expect(effect.offset.x).toBe(0.01);
		expect(effect.offset.y).toBe(0.02);
	});

	test("radialModulation defaults to false", () => {
		const effect = new ChromaticAberrationEffect();
		expect(effect.radialModulation).toBe(false);
	});

	test("radialModulation setter adds/removes define", () => {
		const effect = new ChromaticAberrationEffect();
		effect.radialModulation = true;
		expect(effect.defines.has("RADIAL_MODULATION")).toBe(true);
		effect.radialModulation = false;
		expect(effect.defines.has("RADIAL_MODULATION")).toBe(false);
	});

	test("modulationOffset getter/setter works", () => {
		const effect = new ChromaticAberrationEffect({ modulationOffset: 0.3 });
		expect(effect.modulationOffset).toBe(0.3);
		effect.modulationOffset = 0.5;
		expect(effect.modulationOffset).toBe(0.5);
	});

	test("has vertex shader", () => {
		const effect = new ChromaticAberrationEffect();
		expect(effect.vertexShader).toBeTruthy();
		expect(effect.vertexShader).toContain("vUvR");
	});

	test("fragment shader contains mainImage", () => {
		const effect = new ChromaticAberrationEffect();
		expect(effect.fragmentShader).toContain("mainImage");
	});
});
