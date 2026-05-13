import { jest } from "@jest/globals";
import { KawaseBlurMaterial } from "../../src/materials/KawaseBlurMaterial.js";
import { KernelSize } from "../../src/enums/index.js";

describe("KawaseBlurMaterial", () => {
	test("can be instantiated with defaults", () => {
		const mat = new KawaseBlurMaterial();
		expect(mat.name).toBe("KawaseBlurMaterial");
	});

	test("kernelSequence returns preset for kernel size", () => {
		const mat = new KawaseBlurMaterial(KernelSize.MEDIUM);
		const seq = mat.kernelSequence;
		expect(seq.length).toBe(4);
		expect(seq[0]).toBe(0.0);
	});

	test("different kernel sizes produce different sequence lengths", () => {
		const small = new KawaseBlurMaterial(KernelSize.SMALL);
		const huge = new KawaseBlurMaterial(KernelSize.HUGE);
		expect(huge.kernelSequence.length).toBeGreaterThan(small.kernelSequence.length);
	});

	test("inputBuffer getter/setter works", () => {
		const mat = new KawaseBlurMaterial();
		const tex = { isTexture: true };
		mat.inputBuffer = tex;
		expect(mat.inputBuffer).toBe(tex);
	});

	test("setSize sets texelSize as vec4 with half-texel values", () => {
		const mat = new KawaseBlurMaterial();
		mat.setSize(100, 200);
		const ts = mat.uniforms.texelSize.value;
		expect(ts.x).toBeCloseTo(0.01);
		expect(ts.y).toBeCloseTo(0.005);
		expect(ts.z).toBeCloseTo(0.005);
		expect(ts.w).toBeCloseTo(0.0025);
	});

	test("kernelSize getter/setter works", () => {
		const mat = new KawaseBlurMaterial(KernelSize.SMALL);
		expect(mat.kernelSize).toBe(KernelSize.SMALL);
		mat.kernelSize = KernelSize.LARGE;
		expect(mat.kernelSize).toBe(KernelSize.LARGE);
	});
});
