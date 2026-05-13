import { jest } from "@jest/globals";
import { DotScreenEffect } from "../../src/effects/DotScreenEffect.js";

describe("DotScreenEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new DotScreenEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("DotScreenEffect");
	});

	test("default angle is PI/2", () => {
		const e = new DotScreenEffect();
		expect(e.angle).toBeCloseTo(Math.PI * 0.5);
	});

	test("angle setter precomputes sin/cos vector", () => {
		const e = new DotScreenEffect({ angle: Math.PI / 4 });
		const v = e.uniforms.get("angle").value;
		expect(v.x).toBeCloseTo(Math.sin(Math.PI / 4));
		expect(v.y).toBeCloseTo(Math.cos(Math.PI / 4));
	});

	test("angle getter recovers the angle", () => {
		const e = new DotScreenEffect({ angle: 1.0 });
		expect(e.angle).toBeCloseTo(1.0);
	});

	test("default scale is 1.0", () => {
		const e = new DotScreenEffect();
		expect(e.scale).toBe(1.0);
	});

	test("scale getter/setter works", () => {
		const e = new DotScreenEffect({ scale: 2.5 });
		expect(e.scale).toBe(2.5);
		e.scale = 0.5;
		expect(e.scale).toBe(0.5);
	});

	test("fragment shader contains pattern function", () => {
		const e = new DotScreenEffect();
		expect(e.getFragmentShader()).toContain("pattern");
		expect(e.getFragmentShader()).toContain("sin");
	});
});
