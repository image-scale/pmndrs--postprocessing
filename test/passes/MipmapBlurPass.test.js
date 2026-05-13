import { jest } from "@jest/globals";
import { MipmapBlurPass } from "../../src/passes/MipmapBlurPass.js";

describe("MipmapBlurPass", () => {
	test("can be instantiated", () => {
		const pass = new MipmapBlurPass();
		expect(pass.name).toBe("MipmapBlurPass");
		expect(pass.needsSwap).toBe(false);
	});

	test("default levels is 8", () => {
		const pass = new MipmapBlurPass();
		expect(pass.levels).toBe(8);
	});

	test("creates correct number of mipmaps", () => {
		const pass = new MipmapBlurPass();
		expect(pass.downsamplingMipmaps.length).toBe(8);
		expect(pass.upsamplingMipmaps.length).toBe(7);
	});

	test("levels setter recreates mipmaps", () => {
		const pass = new MipmapBlurPass();
		pass.levels = 4;
		expect(pass.downsamplingMipmaps.length).toBe(4);
		expect(pass.upsamplingMipmaps.length).toBe(3);
	});

	test("texture returns render target texture", () => {
		const pass = new MipmapBlurPass();
		expect(pass.texture).toBe(pass.renderTarget.texture);
	});

	test("radius getter/setter proxies to upsampling material", () => {
		const pass = new MipmapBlurPass();
		expect(pass.radius).toBeCloseTo(0.85);
		pass.radius = 0.5;
		expect(pass.radius).toBe(0.5);
	});

	test("setSize creates progressive halving of mipmap sizes", () => {
		const pass = new MipmapBlurPass();
		pass.levels = 3;
		pass.setSize(800, 600);
		expect(pass.downsamplingMipmaps[0].width).toBe(400);
		expect(pass.downsamplingMipmaps[0].height).toBe(300);
		expect(pass.downsamplingMipmaps[1].width).toBe(200);
		expect(pass.downsamplingMipmaps[1].height).toBe(150);
		expect(pass.downsamplingMipmaps[2].width).toBe(100);
		expect(pass.downsamplingMipmaps[2].height).toBe(75);
	});

	test("upsamplingMipmaps[0] is the same object as renderTarget", () => {
		const pass = new MipmapBlurPass();
		expect(pass.upsamplingMipmaps[0]).toBe(pass.renderTarget);
	});
});
