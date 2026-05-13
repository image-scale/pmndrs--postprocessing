import { jest } from "@jest/globals";
import { GaussianBlurPass } from "../../src/passes/GaussianBlurPass.js";
import { GaussianBlurMaterial } from "../../src/materials/GaussianBlurMaterial.js";
import { Resolution } from "../../src/core/Resolution.js";

describe("GaussianBlurPass", () => {
	test("can be instantiated with defaults", () => {
		const pass = new GaussianBlurPass();
		expect(pass.name).toBe("GaussianBlurPass");
		expect(pass.needsSwap).toBe(false);
	});

	test("has two render targets", () => {
		const pass = new GaussianBlurPass();
		expect(pass.renderTargetA).toBeTruthy();
		expect(pass.renderTargetB).toBeTruthy();
	});

	test("has a Gaussian blur material", () => {
		const pass = new GaussianBlurPass();
		expect(pass.blurMaterial).toBeInstanceOf(GaussianBlurMaterial);
	});

	test("has a resolution", () => {
		const pass = new GaussianBlurPass();
		expect(pass.resolution).toBeInstanceOf(Resolution);
	});

	test("iterations getter/setter works", () => {
		const pass = new GaussianBlurPass({ iterations: 2 });
		expect(pass.iterations).toBe(2);
	});

	test("texture returns target B", () => {
		const pass = new GaussianBlurPass();
		expect(pass.texture).toBe(pass.renderTargetB.texture);
	});

	test("setSize resizes render targets", () => {
		const pass = new GaussianBlurPass({ resolutionScale: 0.5 });
		pass.setSize(1024, 768);
		expect(pass.renderTargetA.width).toBe(512);
		expect(pass.renderTargetA.height).toBe(384);
	});

	test("copy material is pre-connected to target B", () => {
		const pass = new GaussianBlurPass();
		expect(pass.copyMaterial.inputBuffer).toBe(pass.renderTargetB.texture);
	});
});
