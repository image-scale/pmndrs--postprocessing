import { jest } from "@jest/globals";
import { FrameCopyPass } from "../../src/passes/FrameCopyPass.js";

describe("FrameCopyPass", () => {
	test("can be instantiated", () => {
		const pass = new FrameCopyPass();
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("FrameCopyPass");
	});

	test("needsSwap is false", () => {
		const pass = new FrameCopyPass();
		expect(pass.needsSwap).toBe(false);
	});

	test("has a render target with texture", () => {
		const pass = new FrameCopyPass();
		expect(pass.renderTarget).toBeTruthy();
		expect(pass.texture).toBeTruthy();
		expect(pass.texture.name).toBe("FrameCopyPass.Target");
	});

	test("autoResize defaults to true", () => {
		const pass = new FrameCopyPass();
		expect(pass.autoResize).toBe(true);
	});

	test("setSize resizes render target when autoResize is true", () => {
		const pass = new FrameCopyPass();
		pass.setSize(800, 600);
		expect(pass.renderTarget.width).toBe(800);
		expect(pass.renderTarget.height).toBe(600);
	});

	test("setSize does not resize when autoResize is false", () => {
		const pass = new FrameCopyPass(undefined, false);
		pass.setSize(800, 600);
		expect(pass.renderTarget.width).toBe(1);
		expect(pass.renderTarget.height).toBe(1);
	});

	test("has a fullscreen material", () => {
		const pass = new FrameCopyPass();
		expect(pass.fullscreenMaterial).toBeTruthy();
	});

	test("can be disposed", () => {
		const pass = new FrameCopyPass();
		expect(() => pass.dispose()).not.toThrow();
	});
});
