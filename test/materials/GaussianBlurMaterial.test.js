import { jest } from "@jest/globals";
import { GaussianBlurMaterial } from "../../src/materials/GaussianBlurMaterial.js";
import { Vector2 } from "three";

describe("GaussianBlurMaterial", () => {
	test("can be instantiated with defaults", () => {
		const mat = new GaussianBlurMaterial();
		expect(mat.name).toBe("GaussianBlurMaterial");
	});

	test("generates kernel on construction", () => {
		const mat = new GaussianBlurMaterial(35);
		const steps = parseInt(mat.defines.STEPS);
		expect(steps).toBeGreaterThan(0);
		expect(mat.uniforms.kernel.value.length).toBe(steps);
	});

	test("kernel entries have offset and weight", () => {
		const mat = new GaussianBlurMaterial(7);
		const kernel = mat.uniforms.kernel.value;
		expect(kernel[0].x).toBe(0);
		expect(kernel[0].y).toBeGreaterThan(0);
		for (let i = 1; i < kernel.length; i++) {
			expect(kernel[i].x).toBeGreaterThan(0);
			expect(kernel[i].y).toBeGreaterThan(0);
		}
	});

	test("inputBuffer getter/setter works", () => {
		const mat = new GaussianBlurMaterial();
		const tex = { isTexture: true };
		mat.inputBuffer = tex;
		expect(mat.inputBuffer).toBe(tex);
	});

	test("direction getter/setter works", () => {
		const mat = new GaussianBlurMaterial();
		mat.direction = new Vector2(1, 0);
		expect(mat.direction.x).toBe(1);
		expect(mat.direction.y).toBe(0);
	});

	test("setSize updates texelSize", () => {
		const mat = new GaussianBlurMaterial();
		mat.setSize(1920, 1080);
		expect(mat.uniforms.texelSize.value.x).toBeCloseTo(1.0 / 1920);
	});

	test("generateKernel updates STEPS define", () => {
		const mat = new GaussianBlurMaterial(7);
		const steps1 = parseInt(mat.defines.STEPS);
		mat.generateKernel(63);
		const steps2 = parseInt(mat.defines.STEPS);
		expect(steps2).toBeGreaterThan(steps1);
	});
});
