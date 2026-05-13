import { jest } from "@jest/globals";
import { GammaCorrectionEffect } from "../../src/effects/GammaCorrectionEffect.js";
import { BlendFunction } from "../../src/enums/index.js";

describe("GammaCorrectionEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new GammaCorrectionEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("GammaCorrectionEffect");
	});

	test("default blend function is SRC", () => {
		const e = new GammaCorrectionEffect();
		expect(e.blendMode.blendFunction).toBe(BlendFunction.SRC);
	});

	test("default gamma is 2.0", () => {
		const e = new GammaCorrectionEffect();
		expect(e.gamma).toBe(2.0);
	});

	test("gamma getter/setter works", () => {
		const e = new GammaCorrectionEffect({ gamma: 2.2 });
		expect(e.gamma).toBeCloseTo(2.2);
		e.gamma = 1.8;
		expect(e.gamma).toBeCloseTo(1.8);
	});

	test("fragment shader contains pow for gamma correction", () => {
		const e = new GammaCorrectionEffect();
		expect(e.getFragmentShader()).toContain("pow");
		expect(e.getFragmentShader()).toContain("gamma");
	});
});
