import { jest } from "@jest/globals";
import { OutlineEdgeMaterial } from "../../src/materials/OutlineEdgeMaterial.js";

describe("OutlineEdgeMaterial", () => {
	test("can be instantiated", () => {
		const mat = new OutlineEdgeMaterial();
		expect(mat.name).toBe("OutlineEdgeMaterial");
	});

	test("has inputBuffer uniform", () => {
		const mat = new OutlineEdgeMaterial();
		expect(mat.uniforms.inputBuffer).toBeDefined();
		expect(mat.uniforms.inputBuffer.value).toBeNull();
	});

	test("has texelSize uniform", () => {
		const mat = new OutlineEdgeMaterial();
		expect(mat.uniforms.texelSize).toBeDefined();
		expect(mat.uniforms.texelSize.value.x).toBe(0);
		expect(mat.uniforms.texelSize.value.y).toBe(0);
	});

	test("inputBuffer setter works", () => {
		const mat = new OutlineEdgeMaterial();
		const tex = { isTexture: true };
		mat.inputBuffer = tex;
		expect(mat.uniforms.inputBuffer.value).toBe(tex);
	});

	test("setSize updates texelSize", () => {
		const mat = new OutlineEdgeMaterial();
		mat.setSize(320, 240);
		expect(mat.uniforms.texelSize.value.x).toBeCloseTo(1 / 320);
		expect(mat.uniforms.texelSize.value.y).toBeCloseTo(1 / 240);
	});

	test("uses NoBlending", () => {
		const mat = new OutlineEdgeMaterial();
		expect(mat.blending).toBe(0);
	});

	test("depthWrite and depthTest are false", () => {
		const mat = new OutlineEdgeMaterial();
		expect(mat.depthWrite).toBe(false);
		expect(mat.depthTest).toBe(false);
	});

	test("vertex shader contains texelSize and vUv offsets", () => {
		const mat = new OutlineEdgeMaterial();
		expect(mat.vertexShader).toContain("texelSize");
		expect(mat.vertexShader).toContain("vUv0");
		expect(mat.vertexShader).toContain("vUv3");
	});

	test("fragment shader contains edge detection logic", () => {
		const mat = new OutlineEdgeMaterial();
		expect(mat.fragmentShader).toContain("inputBuffer");
		expect(mat.fragmentShader).toContain("visibilityFactor");
	});
});
