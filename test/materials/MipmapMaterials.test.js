import { jest } from "@jest/globals";
import { DownsamplingMaterial } from "../../src/materials/DownsamplingMaterial.js";
import { UpsamplingMaterial } from "../../src/materials/UpsamplingMaterial.js";

describe("DownsamplingMaterial", () => {
	test("can be instantiated", () => {
		const mat = new DownsamplingMaterial();
		expect(mat.name).toBe("DownsamplingMaterial");
	});

	test("inputBuffer getter/setter works", () => {
		const mat = new DownsamplingMaterial();
		const tex = { isTexture: true };
		mat.inputBuffer = tex;
		expect(mat.inputBuffer).toBe(tex);
	});

	test("setSize updates texelSize", () => {
		const mat = new DownsamplingMaterial();
		mat.setSize(1024, 512);
		expect(mat.uniforms.texelSize.value.x).toBeCloseTo(1.0 / 1024);
		expect(mat.uniforms.texelSize.value.y).toBeCloseTo(1.0 / 512);
	});

	test("fragment shader has 13-tap sampling with weights", () => {
		const mat = new DownsamplingMaterial();
		expect(mat.fragmentShader).toContain("WEIGHT_INNER");
		expect(mat.fragmentShader).toContain("WEIGHT_OUTER");
	});
});

describe("UpsamplingMaterial", () => {
	test("can be instantiated", () => {
		const mat = new UpsamplingMaterial();
		expect(mat.name).toBe("UpsamplingMaterial");
	});

	test("radius defaults to 0.85", () => {
		const mat = new UpsamplingMaterial();
		expect(mat.radius).toBeCloseTo(0.85);
	});

	test("radius getter/setter works", () => {
		const mat = new UpsamplingMaterial();
		mat.radius = 0.5;
		expect(mat.radius).toBe(0.5);
	});

	test("inputBuffer and supportBuffer getters/setters", () => {
		const mat = new UpsamplingMaterial();
		const tex1 = { isTexture: true };
		const tex2 = { isTexture: true };
		mat.inputBuffer = tex1;
		mat.supportBuffer = tex2;
		expect(mat.inputBuffer).toBe(tex1);
		expect(mat.supportBuffer).toBe(tex2);
	});

	test("fragment shader blends with support buffer", () => {
		const mat = new UpsamplingMaterial();
		expect(mat.fragmentShader).toContain("supportBuffer");
		expect(mat.fragmentShader).toContain("mix");
	});
});
