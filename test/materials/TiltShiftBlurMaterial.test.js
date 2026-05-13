import { jest } from "@jest/globals";
import { TiltShiftBlurMaterial } from "../../src/materials/TiltShiftBlurMaterial.js";

describe("TiltShiftBlurMaterial", () => {
	test("can be instantiated", () => {
		const mat = new TiltShiftBlurMaterial();
		expect(mat.name).toBe("TiltShiftBlurMaterial");
	});

	test("has tilt shift specific uniforms", () => {
		const mat = new TiltShiftBlurMaterial();
		expect(mat.uniforms.aspect).toBeTruthy();
		expect(mat.uniforms.rotation).toBeTruthy();
		expect(mat.uniforms.maskParams).toBeTruthy();
	});

	test("offset getter/setter works", () => {
		const mat = new TiltShiftBlurMaterial({ offset: 0.2 });
		expect(mat.offset).toBe(0.2);
		mat.offset = 0.5;
		expect(mat.offset).toBe(0.5);
	});

	test("rotation getter/setter works", () => {
		const mat = new TiltShiftBlurMaterial({ rotation: Math.PI / 4 });
		expect(mat.rotation).toBeCloseTo(Math.PI / 4);
	});

	test("focusArea and feather control mask params", () => {
		const mat = new TiltShiftBlurMaterial({ offset: 0, focusArea: 0.5, feather: 0.2 });
		const params = mat.uniforms.maskParams.value;
		expect(params.x).toBeCloseTo(-0.5);
		expect(params.y).toBeCloseTo(-0.3);
		expect(params.z).toBeCloseTo(0.5);
		expect(params.w).toBeCloseTo(0.3);
	});

	test("setSize updates aspect ratio", () => {
		const mat = new TiltShiftBlurMaterial();
		mat.setSize(800, 400);
		expect(mat.uniforms.aspect.value).toBe(2.0);
	});

	test("fragment shader contains gradient mask", () => {
		const mat = new TiltShiftBlurMaterial();
		expect(mat.fragmentShader).toContain("linearGradientMask");
	});
});
