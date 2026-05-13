import { jest } from "@jest/globals";
import { DepthDownsamplingMaterial } from "../../src/materials/DepthDownsamplingMaterial.js";

describe("DepthDownsamplingMaterial", () => {
	test("can be instantiated", () => {
		const mat = new DepthDownsamplingMaterial();
		expect(mat.name).toBe("DepthDownsamplingMaterial");
	});

	test("has DEPTH_PACKING define", () => {
		const mat = new DepthDownsamplingMaterial();
		expect(mat.defines.DEPTH_PACKING).toBe("0");
	});

	test("depthBuffer setter works", () => {
		const mat = new DepthDownsamplingMaterial();
		const tex = { isTexture: true };
		mat.depthBuffer = tex;
		expect(mat.uniforms.depthBuffer.value).toBe(tex);
	});

	test("depthPacking setter updates define", () => {
		const mat = new DepthDownsamplingMaterial();
		mat.depthPacking = 3201;
		expect(mat.defines.DEPTH_PACKING).toBe("3201");
	});

	test("normalBuffer setter enables DOWNSAMPLE_NORMALS define", () => {
		const mat = new DepthDownsamplingMaterial();
		const tex = { isTexture: true };
		mat.normalBuffer = tex;
		expect(mat.defines.DOWNSAMPLE_NORMALS).toBe("1");
		expect(mat.uniforms.normalBuffer.value).toBe(tex);
	});

	test("normalBuffer setter disables DOWNSAMPLE_NORMALS when null", () => {
		const mat = new DepthDownsamplingMaterial();
		mat.normalBuffer = { isTexture: true };
		mat.normalBuffer = null;
		expect(mat.defines.DOWNSAMPLE_NORMALS).toBeUndefined();
	});

	test("setSize updates texelSize", () => {
		const mat = new DepthDownsamplingMaterial();
		mat.setSize(800, 600);
		expect(mat.uniforms.texelSize.value.x).toBeCloseTo(1 / 800);
		expect(mat.uniforms.texelSize.value.y).toBeCloseTo(1 / 600);
	});

	test("has texelSize uniform", () => {
		const mat = new DepthDownsamplingMaterial();
		expect(mat.uniforms.texelSize).toBeDefined();
	});

	test("vertex shader contains texelSize and vUv offsets", () => {
		const mat = new DepthDownsamplingMaterial();
		expect(mat.vertexShader).toContain("texelSize");
		expect(mat.vertexShader).toContain("vUv0");
	});

	test("fragment shader contains depth reading and findBestDepth", () => {
		const mat = new DepthDownsamplingMaterial();
		expect(mat.fragmentShader).toContain("findBestDepth");
		expect(mat.fragmentShader).toContain("readDepth");
	});

	test("uses NoBlending", () => {
		const mat = new DepthDownsamplingMaterial();
		expect(mat.blending).toBe(0);
	});
});
