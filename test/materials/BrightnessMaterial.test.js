import { jest } from "@jest/globals";
import { BrightnessMaterial } from "../../src/materials/BrightnessMaterial.js";
import { Vector2 } from "three";

describe("BrightnessMaterial", () => {
	test("can be instantiated with defaults", () => {
		const mat = new BrightnessMaterial();
		expect(mat).toBeTruthy();
		expect(mat.name).toBe("BrightnessMaterial");
	});

	test("defaults to no blending and no depth test", () => {
		const mat = new BrightnessMaterial();
		expect(mat.depthWrite).toBe(false);
		expect(mat.depthTest).toBe(false);
		expect(mat.toneMapped).toBe(false);
	});

	test("inputBuffer getter/setter works", () => {
		const mat = new BrightnessMaterial();
		expect(mat.inputBuffer).toBeNull();
		const fakeTex = { isTexture: true };
		mat.inputBuffer = fakeTex;
		expect(mat.inputBuffer).toBe(fakeTex);
	});

	test("threshold getter/setter works", () => {
		const mat = new BrightnessMaterial();
		expect(mat.threshold).toBe(0.0);
		mat.threshold = 0.5;
		expect(mat.threshold).toBe(0.5);
	});

	test("setting threshold > 0 enables THRESHOLD define", () => {
		const mat = new BrightnessMaterial();
		expect(mat.defines.THRESHOLD).toBeUndefined();
		mat.threshold = 0.5;
		expect(mat.defines.THRESHOLD).toBe("1");
	});

	test("setting threshold to 0 with smoothing 0 removes THRESHOLD define", () => {
		const mat = new BrightnessMaterial();
		mat.threshold = 0.5;
		mat.smoothing = 0;
		mat.threshold = 0;
		expect(mat.defines.THRESHOLD).toBeUndefined();
	});

	test("smoothing getter/setter works", () => {
		const mat = new BrightnessMaterial();
		expect(mat.smoothing).toBe(1.0);
		mat.smoothing = 0.25;
		expect(mat.smoothing).toBe(0.25);
	});

	test("smoothing > 0 enables THRESHOLD define", () => {
		const mat = new BrightnessMaterial();
		mat.smoothing = 0;
		mat.threshold = 0;
		expect(mat.defines.THRESHOLD).toBeUndefined();
		mat.smoothing = 0.5;
		expect(mat.defines.THRESHOLD).toBe("1");
	});

	test("colorOutput defaults to false", () => {
		const mat = new BrightnessMaterial();
		expect(mat.colorOutput).toBe(false);
		expect(mat.defines.COLOR).toBeUndefined();
	});

	test("colorOutput can be enabled via constructor", () => {
		const mat = new BrightnessMaterial(true);
		expect(mat.colorOutput).toBe(true);
		expect(mat.defines.COLOR).toBe("1");
	});

	test("colorOutput setter toggles COLOR define", () => {
		const mat = new BrightnessMaterial();
		mat.colorOutput = true;
		expect(mat.defines.COLOR).toBe("1");
		mat.colorOutput = false;
		expect(mat.defines.COLOR).toBeUndefined();
	});

	test("luminanceRange defaults to null", () => {
		const mat = new BrightnessMaterial();
		expect(mat.luminanceRange).toBeNull();
		expect(mat.defines.RANGE).toBeUndefined();
	});

	test("luminanceRange can be set via constructor", () => {
		const range = new Vector2(0.2, 0.8);
		const mat = new BrightnessMaterial(false, range);
		expect(mat.luminanceRange).toBe(range);
		expect(mat.defines.RANGE).toBe("1");
	});

	test("luminanceRange setter toggles RANGE define", () => {
		const mat = new BrightnessMaterial();
		mat.luminanceRange = new Vector2(0.1, 0.9);
		expect(mat.defines.RANGE).toBe("1");
		mat.luminanceRange = null;
		expect(mat.defines.RANGE).toBeUndefined();
	});

	test("has vertex and fragment shaders", () => {
		const mat = new BrightnessMaterial();
		expect(mat.vertexShader).toContain("vUv");
		expect(mat.fragmentShader).toContain("inputBuffer");
		expect(mat.fragmentShader).toContain("luminance");
	});

	test("fragment shader contains threshold logic", () => {
		const mat = new BrightnessMaterial();
		expect(mat.fragmentShader).toContain("smoothstep");
		expect(mat.fragmentShader).toContain("threshold");
	});

	test("version increments after property changes", () => {
		const mat = new BrightnessMaterial();
		const v0 = mat.version;
		mat.threshold = 0.5;
		expect(mat.version).toBeGreaterThan(v0);

		const v1 = mat.version;
		mat.colorOutput = true;
		expect(mat.version).toBeGreaterThan(v1);

		const v2 = mat.version;
		mat.luminanceRange = new Vector2(0, 1);
		expect(mat.version).toBeGreaterThan(v2);
	});
});
