import { jest } from "@jest/globals";
import { DepthEffect } from "../../src/effects/DepthEffect.js";
import { BlendFunction, EffectAttribute } from "../../src/enums/index.js";

describe("DepthEffect", () => {
	test("can be instantiated with defaults", () => {
		const effect = new DepthEffect();
		expect(effect.name).toBe("DepthEffect");
	});

	test("default blend function is SRC", () => {
		const effect = new DepthEffect();
		expect(effect.blendMode.blendFunction).toBe(BlendFunction.SRC);
	});

	test("has DEPTH attribute", () => {
		const effect = new DepthEffect();
		expect(effect.getAttributes() & EffectAttribute.DEPTH).toBeTruthy();
	});

	test("inverted defaults to false", () => {
		const effect = new DepthEffect();
		expect(effect.inverted).toBe(false);
	});

	test("inverted can be set via constructor", () => {
		const effect = new DepthEffect({ inverted: true });
		expect(effect.inverted).toBe(true);
	});

	test("inverted setter adds/removes INVERTED define", () => {
		const effect = new DepthEffect();
		expect(effect.defines.has("INVERTED")).toBe(false);
		effect.inverted = true;
		expect(effect.defines.has("INVERTED")).toBe(true);
		effect.inverted = false;
		expect(effect.defines.has("INVERTED")).toBe(false);
	});

	test("setting same inverted value does not trigger change", () => {
		const effect = new DepthEffect({ inverted: true });
		let changed = false;
		effect.addEventListener("change", () => { changed = true; });
		effect.inverted = true;
		expect(changed).toBe(false);
	});

	test("setting different inverted value triggers change", () => {
		const effect = new DepthEffect({ inverted: false });
		let changed = false;
		effect.addEventListener("change", () => { changed = true; });
		effect.inverted = true;
		expect(changed).toBe(true);
	});

	test("fragment shader contains depth visualization", () => {
		const effect = new DepthEffect();
		expect(effect.fragmentShader).toContain("depth");
		expect(effect.fragmentShader).toContain("INVERTED");
	});

	test("custom blend function", () => {
		const effect = new DepthEffect({ blendFunction: BlendFunction.NORMAL });
		expect(effect.blendMode.blendFunction).toBe(BlendFunction.NORMAL);
	});
});
