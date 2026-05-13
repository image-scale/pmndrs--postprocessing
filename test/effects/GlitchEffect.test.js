import { jest } from "@jest/globals";
import { GlitchEffect } from "../../src/effects/GlitchEffect.js";
import { GlitchMode } from "../../src/enums/index.js";
import { Vector2 } from "three";

describe("GlitchEffect", () => {
	test("can be instantiated", () => {
		const effect = new GlitchEffect();
		expect(effect.name).toBe("GlitchEffect");
	});

	test("default mode is SPORADIC", () => {
		const effect = new GlitchEffect();
		expect(effect.mode).toBe(GlitchMode.SPORADIC);
	});

	test("generates perturbation map when none provided", () => {
		const effect = new GlitchEffect();
		expect(effect.perturbationMap).toBeTruthy();
		expect(effect.perturbationMap.name).toBe("Glitch.Generated");
	});

	test("accepts custom perturbation map", () => {
		const tex = { isTexture: true, name: "custom", minFilter: 0, magFilter: 0, wrapS: 0, wrapT: 0, generateMipmaps: true };
		const effect = new GlitchEffect({ perturbationMap: tex });
		expect(effect.perturbationMap).toBe(tex);
	});

	test("active defaults to false", () => {
		const effect = new GlitchEffect();
		expect(effect.active).toBe(false);
	});

	test("columns getter/setter works", () => {
		const effect = new GlitchEffect({ columns: 0.1 });
		expect(effect.columns).toBe(0.1);
		effect.columns = 0.2;
		expect(effect.columns).toBe(0.2);
	});

	test("has delay, duration, and strength vectors", () => {
		const effect = new GlitchEffect();
		expect(effect.delay).toBeInstanceOf(Vector2);
		expect(effect.duration).toBeInstanceOf(Vector2);
		expect(effect.strength).toBeInstanceOf(Vector2);
	});

	test("ratio defaults to 0.85", () => {
		const effect = new GlitchEffect();
		expect(effect.ratio).toBe(0.85);
	});

	test("fragment shader contains mainUv", () => {
		const effect = new GlitchEffect();
		expect(effect.fragmentShader).toContain("mainUv");
		expect(effect.fragmentShader).toContain("perturbationMap");
	});

	test("chromaticAberrationOffset defaults to null", () => {
		const effect = new GlitchEffect();
		expect(effect.chromaticAberrationOffset).toBeNull();
	});
});
