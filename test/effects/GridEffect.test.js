import { jest } from "@jest/globals";
import { GridEffect } from "../../src/effects/GridEffect.js";
import { BlendFunction } from "../../src/enums/index.js";

describe("GridEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new GridEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("GridEffect");
	});

	test("default blend function is OVERLAY", () => {
		const e = new GridEffect();
		expect(e.blendMode.blendFunction).toBe(BlendFunction.OVERLAY);
	});

	test("default scale is 1.0", () => {
		const e = new GridEffect();
		expect(e.scale).toBe(1.0);
	});

	test("default lineWidth is 0.0", () => {
		const e = new GridEffect();
		expect(e.lineWidth).toBe(0.0);
	});

	test("scale setter clamps to minimum", () => {
		const e = new GridEffect();
		e.scale = 0;
		expect(e.scale).toBeGreaterThan(0);
	});

	test("setSize computes scale uniform with aspect correction", () => {
		const e = new GridEffect({ scale: 1.0 });
		e.setSize(800, 400);
		const scaleVec = e.uniforms.get("scale").value;
		expect(scaleVec.x).toBeGreaterThan(scaleVec.y);
	});

	test("setSize computes lineWidth uniform", () => {
		const e = new GridEffect({ lineWidth: 0.5 });
		e.setSize(800, 600);
		expect(e.uniforms.get("lineWidth").value).toBeGreaterThan(0.5);
	});

	test("fragment shader contains grid logic", () => {
		const e = new GridEffect();
		expect(e.getFragmentShader()).toContain("mod");
		expect(e.getFragmentShader()).toContain("smoothstep");
	});
});
