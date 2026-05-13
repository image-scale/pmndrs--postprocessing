import { jest } from "@jest/globals";
import { KawaseBlurPass } from "../../src/passes/KawaseBlurPass.js";
import { KawaseBlurMaterial } from "../../src/materials/KawaseBlurMaterial.js";
import { KernelSize } from "../../src/enums/index.js";
import { Resolution } from "../../src/core/Resolution.js";

describe("KawaseBlurPass", () => {
	test("can be instantiated with defaults", () => {
		const pass = new KawaseBlurPass();
		expect(pass.name).toBe("KawaseBlurPass");
		expect(pass.needsSwap).toBe(false);
	});

	test("default resolution scale is 0.5", () => {
		const pass = new KawaseBlurPass();
		expect(pass.resolution.scale).toBe(0.5);
	});

	test("has Kawase blur material", () => {
		const pass = new KawaseBlurPass();
		expect(pass.blurMaterial).toBeInstanceOf(KawaseBlurMaterial);
	});

	test("kernelSize getter/setter proxies to material", () => {
		const pass = new KawaseBlurPass({ kernelSize: KernelSize.LARGE });
		expect(pass.kernelSize).toBe(KernelSize.LARGE);
		pass.kernelSize = KernelSize.SMALL;
		expect(pass.kernelSize).toBe(KernelSize.SMALL);
	});

	test("setSize resizes render targets at half resolution", () => {
		const pass = new KawaseBlurPass({ resolutionScale: 0.5 });
		pass.setSize(800, 600);
		expect(pass.renderTargetA.width).toBe(400);
		expect(pass.renderTargetA.height).toBe(300);
	});

	test("texture returns target B", () => {
		const pass = new KawaseBlurPass();
		expect(pass.texture).toBe(pass.renderTargetB.texture);
	});

	test("has two render targets", () => {
		const pass = new KawaseBlurPass();
		expect(pass.renderTargetA).toBeTruthy();
		expect(pass.renderTargetB).toBeTruthy();
	});
});
