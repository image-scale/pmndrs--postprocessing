import { jest } from "@jest/globals";
import { BoxBlurPass } from "../../src/passes/BoxBlurPass.js";
import { BoxBlurMaterial } from "../../src/materials/BoxBlurMaterial.js";
import { Resolution } from "../../src/core/Resolution.js";

describe("BoxBlurPass", () => {
	test("can be instantiated with defaults", () => {
		const pass = new BoxBlurPass();
		expect(pass.name).toBe("BoxBlurPass");
		expect(pass.needsSwap).toBe(false);
	});

	test("has two render targets", () => {
		const pass = new BoxBlurPass();
		expect(pass.renderTargetA).toBeTruthy();
		expect(pass.renderTargetB).toBeTruthy();
	});

	test("has a blur material", () => {
		const pass = new BoxBlurPass();
		expect(pass.blurMaterial).toBeInstanceOf(BoxBlurMaterial);
	});

	test("has a resolution", () => {
		const pass = new BoxBlurPass();
		expect(pass.resolution).toBeInstanceOf(Resolution);
	});

	test("iterations getter/setter works", () => {
		const pass = new BoxBlurPass({ iterations: 3 });
		expect(pass.iterations).toBe(3);
		pass.iterations = 5;
		expect(pass.iterations).toBe(5);
	});

	test("setSize resizes render targets and material", () => {
		const pass = new BoxBlurPass({ resolutionScale: 0.5 });
		pass.setSize(800, 600);
		expect(pass.renderTargetA.width).toBe(400);
		expect(pass.renderTargetA.height).toBe(300);
	});

	test("texture getter returns target B texture", () => {
		const pass = new BoxBlurPass();
		expect(pass.texture).toBe(pass.renderTargetB.texture);
	});

	test("dispose does not throw", () => {
		const pass = new BoxBlurPass();
		expect(() => pass.dispose()).not.toThrow();
	});
});
