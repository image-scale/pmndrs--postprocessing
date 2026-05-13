import { jest } from "@jest/globals";
import { DepthCopyMaterial } from "../../src/materials/DepthCopyMaterial.js";
import { DepthCopyMode } from "../../src/enums/index.js";
import { RGBADepthPacking, BasicDepthPacking } from "three";

describe("DepthCopyMaterial", () => {
	test("can be instantiated", () => {
		const mat = new DepthCopyMaterial();
		expect(mat.name).toBe("DepthCopyMaterial");
	});

	test("default mode is FULL", () => {
		const mat = new DepthCopyMaterial();
		expect(mat.mode).toBe(DepthCopyMode.FULL);
	});

	test("mode setter updates define", () => {
		const mat = new DepthCopyMaterial();
		mat.mode = DepthCopyMode.SINGLE;
		expect(mat.mode).toBe(DepthCopyMode.SINGLE);
		expect(mat.defines.DEPTH_COPY_MODE).toBe("1");
	});

	test("depthBuffer getter/setter works", () => {
		const mat = new DepthCopyMaterial();
		const tex = { isTexture: true };
		mat.depthBuffer = tex;
		expect(mat.depthBuffer).toBe(tex);
	});

	test("inputDepthPacking setter updates define", () => {
		const mat = new DepthCopyMaterial();
		mat.inputDepthPacking = RGBADepthPacking;
		expect(mat.defines.INPUT_DEPTH_PACKING).toBe("3201");
	});

	test("outputDepthPacking getter/setter works", () => {
		const mat = new DepthCopyMaterial();
		mat.outputDepthPacking = RGBADepthPacking;
		expect(mat.outputDepthPacking).toBe(RGBADepthPacking);
		expect(mat.defines.OUTPUT_DEPTH_PACKING).toBe("3201");
	});

	test("texelPosition getter returns Vector2", () => {
		const mat = new DepthCopyMaterial();
		expect(mat.texelPosition).toBeDefined();
		expect(mat.texelPosition.x).toBe(0);
		expect(mat.texelPosition.y).toBe(0);
	});

	test("has no blending", () => {
		const mat = new DepthCopyMaterial();
		expect(mat.blending).toBe(0);
	});

	test("depthWrite is false", () => {
		const mat = new DepthCopyMaterial();
		expect(mat.depthWrite).toBe(false);
	});

	test("fragment shader contains packing include", () => {
		const mat = new DepthCopyMaterial();
		expect(mat.fragmentShader).toContain("packing");
	});

	test("vertex shader handles DEPTH_COPY_MODE", () => {
		const mat = new DepthCopyMaterial();
		expect(mat.vertexShader).toContain("DEPTH_COPY_MODE");
	});
});
