import { jest } from "@jest/globals";
import { DepthDownsamplingPass } from "../../src/passes/DepthDownsamplingPass.js";

describe("DepthDownsamplingPass", () => {
	test("can be instantiated", () => {
		const pass = new DepthDownsamplingPass();
		expect(pass.name).toBe("DepthDownsamplingPass");
	});

	test("needsDepthTexture is true", () => {
		const pass = new DepthDownsamplingPass();
		expect(pass.needsDepthTexture).toBe(true);
	});

	test("needsSwap is false", () => {
		const pass = new DepthDownsamplingPass();
		expect(pass.needsSwap).toBe(false);
	});

	test("has render target", () => {
		const pass = new DepthDownsamplingPass();
		expect(pass.renderTarget).toBeDefined();
		expect(pass.renderTarget.texture.name).toBe("DepthDownsamplingPass.Target");
	});

	test("texture getter returns render target texture", () => {
		const pass = new DepthDownsamplingPass();
		expect(pass.texture).toBe(pass.renderTarget.texture);
	});

	test("has resolution", () => {
		const pass = new DepthDownsamplingPass();
		expect(pass.resolution).toBeDefined();
	});

	test("default resolution scale is 0.5", () => {
		const pass = new DepthDownsamplingPass();
		expect(pass.resolution.scale).toBe(0.5);
	});

	test("setDepthTexture sets material depth buffer", () => {
		const pass = new DepthDownsamplingPass();
		const tex = { isTexture: true };
		pass.setDepthTexture(tex, 3201);
		expect(pass.fullscreenMaterial.uniforms.depthBuffer.value).toBe(tex);
		expect(pass.fullscreenMaterial.defines.DEPTH_PACKING).toBe("3201");
	});

	test("normalBuffer option sets DOWNSAMPLE_NORMALS", () => {
		const normalTex = { isTexture: true };
		const pass = new DepthDownsamplingPass({ normalBuffer: normalTex });
		expect(pass.fullscreenMaterial.defines.DOWNSAMPLE_NORMALS).toBe("1");
	});

	test("setSize updates render target and material", () => {
		const pass = new DepthDownsamplingPass({ resolutionScale: 0.5 });
		pass.setSize(800, 600);
		expect(pass.renderTarget.width).toBe(400);
		expect(pass.renderTarget.height).toBe(300);
	});

	test("render target does not generate mipmaps", () => {
		const pass = new DepthDownsamplingPass();
		expect(pass.renderTarget.texture.generateMipmaps).toBe(false);
	});
});
