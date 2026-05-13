import { jest } from "@jest/globals";
import { AdaptiveLuminanceMaterial } from "../../src/materials/AdaptiveLuminanceMaterial.js";

describe("AdaptiveLuminanceMaterial", () => {
	test("can be instantiated", () => {
		const mat = new AdaptiveLuminanceMaterial();
		expect(mat.name).toBe("AdaptiveLuminanceMaterial");
	});

	test("default minLuminance is 0.01", () => {
		const mat = new AdaptiveLuminanceMaterial();
		expect(mat.minLuminance).toBeCloseTo(0.01);
	});

	test("minLuminance getter/setter works", () => {
		const mat = new AdaptiveLuminanceMaterial();
		mat.minLuminance = 0.05;
		expect(mat.minLuminance).toBe(0.05);
	});

	test("default adaptationRate is 1.0", () => {
		const mat = new AdaptiveLuminanceMaterial();
		expect(mat.adaptationRate).toBe(1.0);
	});

	test("adaptationRate getter/setter works", () => {
		const mat = new AdaptiveLuminanceMaterial();
		mat.adaptationRate = 2.5;
		expect(mat.adaptationRate).toBe(2.5);
	});

	test("luminanceBuffer0 setter works", () => {
		const mat = new AdaptiveLuminanceMaterial();
		const tex = { isTexture: true };
		mat.luminanceBuffer0 = tex;
		expect(mat.uniforms.luminanceBuffer0.value).toBe(tex);
	});

	test("luminanceBuffer1 setter works", () => {
		const mat = new AdaptiveLuminanceMaterial();
		const tex = { isTexture: true };
		mat.luminanceBuffer1 = tex;
		expect(mat.uniforms.luminanceBuffer1.value).toBe(tex);
	});

	test("mipLevel1x1 setter updates define", () => {
		const mat = new AdaptiveLuminanceMaterial();
		mat.mipLevel1x1 = 8;
		expect(mat.defines.MIP_LEVEL_1X1).toBe("8.0");
	});

	test("deltaTime setter works", () => {
		const mat = new AdaptiveLuminanceMaterial();
		mat.deltaTime = 0.016;
		expect(mat.uniforms.deltaTime.value).toBeCloseTo(0.016);
	});

	test("has shaderTextureLOD extension", () => {
		const mat = new AdaptiveLuminanceMaterial();
		expect(mat.extensions.shaderTextureLOD).toBe(true);
	});

	test("fragment shader contains adaptive luminance logic", () => {
		const mat = new AdaptiveLuminanceMaterial();
		expect(mat.fragmentShader).toContain("adaptedLum");
		expect(mat.fragmentShader).toContain("tau");
	});
});
