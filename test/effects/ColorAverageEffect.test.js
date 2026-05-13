import { jest } from "@jest/globals";
import { ColorAverageEffect } from "../../src/effects/ColorAverageEffect.js";
import { BlendFunction } from "../../src/enums/index.js";

describe("ColorAverageEffect", () => {
	test("can be instantiated with no arguments", () => {
		const e = new ColorAverageEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("ColorAverageEffect");
	});

	test("accepts a blend function", () => {
		const e = new ColorAverageEffect(BlendFunction.ADD);
		expect(e.blendMode.blendFunction).toBe(BlendFunction.ADD);
	});

	test("fragment shader contains mainImage", () => {
		const e = new ColorAverageEffect();
		expect(e.getFragmentShader()).toContain("mainImage");
	});

	test("fragment shader averages RGB channels", () => {
		const e = new ColorAverageEffect();
		const frag = e.getFragmentShader();
		expect(frag).toContain("inputColor.r");
		expect(frag).toContain("inputColor.g");
		expect(frag).toContain("inputColor.b");
		expect(frag).toContain("3.0");
	});

	test("has no uniforms", () => {
		const e = new ColorAverageEffect();
		expect(e.uniforms.size).toBe(0);
	});
});
