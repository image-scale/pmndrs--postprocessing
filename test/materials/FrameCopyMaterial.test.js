import { jest } from "@jest/globals";
import { FrameCopyMaterial } from "../../src/materials/FrameCopyMaterial.js";
import { Vector4 } from "three";

describe("FrameCopyMaterial", () => {
	test("can be instantiated", () => {
		const mat = new FrameCopyMaterial();
		expect(mat).toBeTruthy();
		expect(mat.name).toBe("FrameCopyMaterial");
	});

	test("defaults to no blending and no depth test", () => {
		const mat = new FrameCopyMaterial();
		expect(mat.depthWrite).toBe(false);
		expect(mat.depthTest).toBe(false);
		expect(mat.toneMapped).toBe(false);
	});

	test("inputBuffer getter/setter works", () => {
		const mat = new FrameCopyMaterial();
		expect(mat.inputBuffer).toBeNull();
		const fakeTex = { isTexture: true };
		mat.inputBuffer = fakeTex;
		expect(mat.inputBuffer).toBe(fakeTex);
	});

	test("setting inputBuffer to null removes COLOR_WRITE define", () => {
		const mat = new FrameCopyMaterial();
		expect(mat.defines.COLOR_WRITE).toBeDefined();
		mat.inputBuffer = null;
		expect(mat.defines.COLOR_WRITE).toBeUndefined();
	});

	test("depthBuffer enables DEPTH_WRITE define and depth test", () => {
		const mat = new FrameCopyMaterial();
		expect(mat.defines.DEPTH_WRITE).toBeUndefined();
		mat.depthBuffer = { isTexture: true };
		expect(mat.defines.DEPTH_WRITE).toBe("1");
		expect(mat.depthTest).toBe(true);
		expect(mat.depthWrite).toBe(true);
	});

	test("setting depthBuffer to null disables depth", () => {
		const mat = new FrameCopyMaterial();
		mat.depthBuffer = { isTexture: true };
		mat.depthBuffer = null;
		expect(mat.defines.DEPTH_WRITE).toBeUndefined();
		expect(mat.depthTest).toBe(false);
	});

	test("depthPacking setter updates define", () => {
		const mat = new FrameCopyMaterial();
		mat.depthPacking = 3201;
		expect(mat.defines.DEPTH_PACKING).toBe("3201");
	});

	test("colorSpaceConversion getter/setter", () => {
		const mat = new FrameCopyMaterial();
		expect(mat.colorSpaceConversion).toBe(true);
		mat.colorSpaceConversion = false;
		expect(mat.colorSpaceConversion).toBe(false);
		expect(mat.defines.COLOR_SPACE_CONVERSION).toBeUndefined();
	});

	test("channelWeights setter adds USE_WEIGHTS define", () => {
		const mat = new FrameCopyMaterial();
		mat.channelWeights = new Vector4(1, 0, 0, 0);
		expect(mat.defines.USE_WEIGHTS).toBe("1");
		mat.channelWeights = null;
		expect(mat.defines.USE_WEIGHTS).toBeUndefined();
	});

	test("has vertex and fragment shaders", () => {
		const mat = new FrameCopyMaterial();
		expect(mat.vertexShader).toContain("vUv");
		expect(mat.fragmentShader).toContain("inputBuffer");
	});
});
