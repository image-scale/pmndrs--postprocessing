import { jest } from "@jest/globals";
import { TiltShiftBlurPass } from "../../src/passes/TiltShiftBlurPass.js";
import { TiltShiftBlurMaterial } from "../../src/materials/TiltShiftBlurMaterial.js";

describe("TiltShiftBlurPass", () => {
	test("can be instantiated with defaults", () => {
		const pass = new TiltShiftBlurPass();
		expect(pass.name).toBe("TiltShiftBlurPass");
	});

	test("extends KawaseBlurPass", () => {
		const pass = new TiltShiftBlurPass();
		expect(pass.renderTargetA).toBeTruthy();
		expect(pass.renderTargetB).toBeTruthy();
	});

	test("uses TiltShiftBlurMaterial", () => {
		const pass = new TiltShiftBlurPass();
		expect(pass.blurMaterial).toBeInstanceOf(TiltShiftBlurMaterial);
	});

	test("offset getter/setter proxies to material", () => {
		const pass = new TiltShiftBlurPass({ offset: 0.3 });
		expect(pass.offset).toBe(0.3);
		pass.offset = 0.5;
		expect(pass.offset).toBe(0.5);
	});

	test("rotation getter/setter works", () => {
		const pass = new TiltShiftBlurPass({ rotation: Math.PI / 6 });
		expect(pass.rotation).toBeCloseTo(Math.PI / 6);
	});

	test("focusArea getter/setter works", () => {
		const pass = new TiltShiftBlurPass({ focusArea: 0.6 });
		expect(pass.focusArea).toBe(0.6);
		pass.focusArea = 0.2;
		expect(pass.focusArea).toBe(0.2);
	});

	test("feather getter/setter works", () => {
		const pass = new TiltShiftBlurPass({ feather: 0.1 });
		expect(pass.feather).toBe(0.1);
	});

	test("tiltShiftMaterial getter returns blur material", () => {
		const pass = new TiltShiftBlurPass();
		expect(pass.tiltShiftMaterial).toBe(pass.blurMaterial);
	});
});
