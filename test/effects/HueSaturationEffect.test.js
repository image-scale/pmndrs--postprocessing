import { jest } from "@jest/globals";
import { HueSaturationEffect } from "../../src/effects/HueSaturationEffect.js";
import { BlendFunction } from "../../src/enums/index.js";

describe("HueSaturationEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new HueSaturationEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("HueSaturationEffect");
	});

	test("default blend function is SRC", () => {
		const e = new HueSaturationEffect();
		expect(e.blendMode.blendFunction).toBe(BlendFunction.SRC);
	});

	test("default hue is 0 (identity rotation)", () => {
		const e = new HueSaturationEffect();
		expect(e.hue).toBeCloseTo(0.0);
		const hueVec = e.uniforms.get("hue").value;
		expect(hueVec.x).toBeCloseTo(1.0);
		expect(hueVec.y).toBeCloseTo(0.0);
		expect(hueVec.z).toBeCloseTo(0.0);
	});

	test("hue setter precomputes rotation vector", () => {
		const e = new HueSaturationEffect();
		e.hue = Math.PI / 3;
		const hueVec = e.uniforms.get("hue").value;
		const s = Math.sin(Math.PI / 3);
		const c = Math.cos(Math.PI / 3);
		expect(hueVec.x).toBeCloseTo((2.0 * c + 1.0) / 3.0);
		expect(hueVec.y).toBeCloseTo((-Math.sqrt(3.0) * s - c + 1.0) / 3.0);
		expect(hueVec.z).toBeCloseTo((Math.sqrt(3.0) * s - c + 1.0) / 3.0);
	});

	test("hue getter recovers the angle", () => {
		const e = new HueSaturationEffect({ hue: Math.PI / 4 });
		expect(e.hue).toBeCloseTo(Math.PI / 4);
	});

	test("default saturation is 0", () => {
		const e = new HueSaturationEffect();
		expect(e.saturation).toBe(0.0);
	});

	test("saturation getter/setter works", () => {
		const e = new HueSaturationEffect({ saturation: 0.5 });
		expect(e.saturation).toBe(0.5);
		e.saturation = -0.3;
		expect(e.saturation).toBe(-0.3);
	});

	test("fragment shader contains hue rotation and saturation logic", () => {
		const e = new HueSaturationEffect();
		const frag = e.getFragmentShader();
		expect(frag).toContain("dot");
		expect(frag).toContain("hue");
		expect(frag).toContain("saturation");
		expect(frag).toContain("average");
	});

	test("accepts custom constructor options", () => {
		const e = new HueSaturationEffect({
			blendFunction: BlendFunction.ADD,
			hue: 1.0,
			saturation: -0.5
		});
		expect(e.blendMode.blendFunction).toBe(BlendFunction.ADD);
		expect(e.hue).toBeCloseTo(1.0);
		expect(e.saturation).toBe(-0.5);
	});
});
