import { jest } from "@jest/globals";
import { VignetteEffect } from "../../src/effects/VignetteEffect.js";
import { VignetteTechnique } from "../../src/enums/index.js";

describe("VignetteEffect", () => {
	test("can be instantiated with defaults", () => {
		const e = new VignetteEffect();
		expect(e).toBeTruthy();
		expect(e.name).toBe("VignetteEffect");
	});

	test("default technique is DEFAULT (0)", () => {
		const e = new VignetteEffect();
		expect(e.technique).toBe(VignetteTechnique.DEFAULT);
	});

	test("technique setter updates define", () => {
		const e = new VignetteEffect();
		e.technique = VignetteTechnique.ESKIL;
		expect(e.technique).toBe(VignetteTechnique.ESKIL);
		expect(e.defines.get("VIGNETTE_TECHNIQUE")).toBe("1");
	});

	test("offset defaults to 0.5", () => {
		const e = new VignetteEffect();
		expect(e.offset).toBe(0.5);
	});

	test("darkness defaults to 0.5", () => {
		const e = new VignetteEffect();
		expect(e.darkness).toBe(0.5);
	});

	test("offset getter/setter works", () => {
		const e = new VignetteEffect({ offset: 0.8 });
		expect(e.offset).toBe(0.8);
		e.offset = 0.3;
		expect(e.offset).toBe(0.3);
	});

	test("darkness getter/setter works", () => {
		const e = new VignetteEffect({ darkness: 0.9 });
		expect(e.darkness).toBe(0.9);
		e.darkness = 0.1;
		expect(e.darkness).toBe(0.1);
	});

	test("fragment shader contains vignette logic", () => {
		const e = new VignetteEffect();
		expect(e.getFragmentShader()).toContain("smoothstep");
		expect(e.getFragmentShader()).toContain("VIGNETTE_TECHNIQUE");
	});
});
