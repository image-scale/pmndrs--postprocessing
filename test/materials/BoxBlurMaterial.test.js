import { jest } from "@jest/globals";
import { BoxBlurMaterial } from "../../src/materials/BoxBlurMaterial.js";

describe("BoxBlurMaterial", () => {
	test("can be instantiated with defaults", () => {
		const mat = new BoxBlurMaterial();
		expect(mat.name).toBe("BoxBlurMaterial");
	});

	test("default kernel size is 5", () => {
		const mat = new BoxBlurMaterial();
		expect(mat.defines.KERNEL_SIZE).toBe("5");
		expect(mat.defines.KERNEL_SIZE_HALF).toBe("2");
		expect(mat.defines.KERNEL_SIZE_SQ).toBe("25");
	});

	test("even kernel size is rounded up to odd", () => {
		const mat = new BoxBlurMaterial(4);
		expect(mat.defines.KERNEL_SIZE).toBe("5");
	});

	test("inputBuffer getter/setter works", () => {
		const mat = new BoxBlurMaterial();
		const tex = { isTexture: true };
		mat.inputBuffer = tex;
		expect(mat.inputBuffer).toBe(tex);
	});

	test("scale getter/setter works", () => {
		const mat = new BoxBlurMaterial();
		expect(mat.scale).toBe(1.0);
		mat.scale = 2.0;
		expect(mat.scale).toBe(2.0);
	});

	test("setSize updates texelSize", () => {
		const mat = new BoxBlurMaterial();
		mat.setSize(800, 600);
		expect(mat.uniforms.texelSize.value.x).toBeCloseTo(1.0 / 800);
		expect(mat.uniforms.texelSize.value.y).toBeCloseTo(1.0 / 600);
	});

	test("INV_KERNEL_SIZE_SQ is correct", () => {
		const mat = new BoxBlurMaterial(3);
		expect(parseFloat(mat.defines.INV_KERNEL_SIZE_SQ)).toBeCloseTo(1.0 / 9.0);
	});
});
