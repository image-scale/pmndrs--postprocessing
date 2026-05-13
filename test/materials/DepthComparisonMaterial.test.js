import { jest } from "@jest/globals";
import { DepthComparisonMaterial } from "../../src/materials/DepthComparisonMaterial.js";
import { PerspectiveCamera, OrthographicCamera } from "three";

describe("DepthComparisonMaterial", () => {
	test("can be instantiated", () => {
		const mat = new DepthComparisonMaterial();
		expect(mat.name).toBe("DepthComparisonMaterial");
	});

	test("has DEPTH_PACKING define", () => {
		const mat = new DepthComparisonMaterial();
		expect(mat.defines.DEPTH_PACKING).toBeDefined();
	});

	test("defaults to RGBA depth packing (3201)", () => {
		const mat = new DepthComparisonMaterial();
		expect(mat.defines.DEPTH_PACKING).toBe("3201");
	});

	test("has depthBuffer uniform", () => {
		const mat = new DepthComparisonMaterial();
		expect(mat.uniforms.depthBuffer).toBeDefined();
	});

	test("depthBuffer setter works", () => {
		const mat = new DepthComparisonMaterial();
		const tex = { isTexture: true };
		mat.depthBuffer = tex;
		expect(mat.uniforms.depthBuffer.value).toBe(tex);
	});

	test("depthPacking setter updates define", () => {
		const mat = new DepthComparisonMaterial();
		mat.depthPacking = 3200;
		expect(mat.defines.DEPTH_PACKING).toBe("3200");
	});

	test("copyCameraSettings with perspective camera", () => {
		const cam = new PerspectiveCamera(75, 1, 0.5, 500);
		const mat = new DepthComparisonMaterial(null, cam);
		expect(mat.uniforms.cameraNear.value).toBe(0.5);
		expect(mat.uniforms.cameraFar.value).toBe(500);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBe("1");
	});

	test("copyCameraSettings with orthographic camera", () => {
		const cam = new OrthographicCamera(-10, 10, 10, -10, 1, 100);
		const mat = new DepthComparisonMaterial(null, cam);
		expect(mat.uniforms.cameraNear.value).toBe(1);
		expect(mat.uniforms.cameraFar.value).toBe(100);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBeUndefined();
	});

	test("accepts depth texture in constructor", () => {
		const tex = { isTexture: true };
		const mat = new DepthComparisonMaterial(tex);
		expect(mat.uniforms.depthBuffer.value).toBe(tex);
	});

	test("vertex shader contains vViewZ and vProjTexCoord", () => {
		const mat = new DepthComparisonMaterial();
		expect(mat.vertexShader).toContain("vViewZ");
		expect(mat.vertexShader).toContain("vProjTexCoord");
	});

	test("fragment shader contains depth comparison logic", () => {
		const mat = new DepthComparisonMaterial();
		expect(mat.fragmentShader).toContain("depthTest");
		expect(mat.fragmentShader).toContain("depthBuffer");
	});

	test("uses NoBlending", () => {
		const mat = new DepthComparisonMaterial();
		expect(mat.blending).toBe(0);
	});
});
