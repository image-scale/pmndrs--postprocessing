import { jest } from "@jest/globals";
import { AdaptiveLuminancePass } from "../../src/passes/AdaptiveLuminancePass.js";
import { AdaptiveLuminanceMaterial } from "../../src/materials/AdaptiveLuminanceMaterial.js";

describe("AdaptiveLuminancePass", () => {
	const mockTexture = { isTexture: true };

	test("can be instantiated", () => {
		const pass = new AdaptiveLuminancePass(mockTexture);
		expect(pass.name).toBe("AdaptiveLuminancePass");
	});

	test("needsSwap is false", () => {
		const pass = new AdaptiveLuminancePass(mockTexture);
		expect(pass.needsSwap).toBe(false);
	});

	test("uses AdaptiveLuminanceMaterial", () => {
		const pass = new AdaptiveLuminancePass(mockTexture);
		expect(pass.fullscreenMaterial).toBeInstanceOf(AdaptiveLuminanceMaterial);
	});

	test("has two 1x1 render targets", () => {
		const pass = new AdaptiveLuminancePass(mockTexture);
		expect(pass.renderTargetPrevious).toBeDefined();
		expect(pass.renderTargetAdapted).toBeDefined();
		expect(pass.renderTargetPrevious.width).toBe(1);
		expect(pass.renderTargetAdapted.width).toBe(1);
	});

	test("texture getter returns adapted luminance texture", () => {
		const pass = new AdaptiveLuminancePass(mockTexture);
		expect(pass.texture).toBe(pass.renderTargetAdapted.texture);
	});

	test("adaptationRate getter/setter works", () => {
		const pass = new AdaptiveLuminancePass(mockTexture, { adaptationRate: 2.0 });
		expect(pass.adaptationRate).toBe(2.0);
		pass.adaptationRate = 0.5;
		expect(pass.adaptationRate).toBe(0.5);
	});

	test("minLuminance is configurable", () => {
		const pass = new AdaptiveLuminancePass(mockTexture, { minLuminance: 0.05 });
		expect(pass.fullscreenMaterial.minLuminance).toBe(0.05);
	});

	test("has a copy pass for saving previous luminance", () => {
		const pass = new AdaptiveLuminancePass(mockTexture);
		expect(pass.copyPass).toBeDefined();
	});

	test("material has luminance buffers connected", () => {
		const pass = new AdaptiveLuminancePass(mockTexture);
		const mat = pass.fullscreenMaterial;
		expect(mat.uniforms.luminanceBuffer0.value).toBe(pass.renderTargetPrevious.texture);
		expect(mat.uniforms.luminanceBuffer1.value).toBe(mockTexture);
	});
});
