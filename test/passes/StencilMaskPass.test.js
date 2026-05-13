import { jest } from "@jest/globals";
import { StencilMaskPass } from "../../src/passes/StencilMaskPass.js";
import { Scene, PerspectiveCamera } from "three";

describe("StencilMaskPass", () => {
	test("can be instantiated with scene and camera", () => {
		const pass = new StencilMaskPass(new Scene(), new PerspectiveCamera());
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("StencilMaskPass");
	});

	test("needsSwap is false", () => {
		const pass = new StencilMaskPass(new Scene(), new PerspectiveCamera());
		expect(pass.needsSwap).toBe(false);
	});

	test("inverted defaults to false", () => {
		const pass = new StencilMaskPass(new Scene(), new PerspectiveCamera());
		expect(pass.inverted).toBe(false);
	});

	test("has a clear pass for stencil", () => {
		const pass = new StencilMaskPass(new Scene(), new PerspectiveCamera());
		expect(pass.clearPass).toBeTruthy();
	});

	test("clear getter/setter proxies to clearPass.enabled", () => {
		const pass = new StencilMaskPass(new Scene(), new PerspectiveCamera());
		expect(pass.clear).toBe(true);
		pass.clear = false;
		expect(pass.clearPass.enabled).toBe(false);
	});

	test("dispose does not throw", () => {
		const pass = new StencilMaskPass(new Scene(), new PerspectiveCamera());
		expect(() => pass.dispose()).not.toThrow();
	});
});
