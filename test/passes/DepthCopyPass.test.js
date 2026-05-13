import { jest } from "@jest/globals";
import { DepthCopyPass } from "../../src/passes/DepthCopyPass.js";
import { DepthCopyMaterial } from "../../src/materials/DepthCopyMaterial.js";
import { RGBADepthPacking, BasicDepthPacking, FloatType, UnsignedByteType } from "three";

describe("DepthCopyPass", () => {
	test("can be instantiated with defaults", () => {
		const pass = new DepthCopyPass();
		expect(pass.name).toBe("DepthCopyPass");
	});

	test("needsSwap is false", () => {
		const pass = new DepthCopyPass();
		expect(pass.needsSwap).toBe(false);
	});

	test("needsDepthTexture is true", () => {
		const pass = new DepthCopyPass();
		expect(pass.needsDepthTexture).toBe(true);
	});

	test("has a render target", () => {
		const pass = new DepthCopyPass();
		expect(pass.renderTarget).toBeDefined();
		expect(pass.renderTarget.texture.name).toBe("DepthCopyPass.Target");
	});

	test("texture getter returns renderTarget texture", () => {
		const pass = new DepthCopyPass();
		expect(pass.texture).toBe(pass.renderTarget.texture);
	});

	test("default depth packing is RGBADepthPacking", () => {
		const pass = new DepthCopyPass();
		expect(pass.depthPacking).toBe(RGBADepthPacking);
	});

	test("RGBA packing uses UnsignedByteType", () => {
		const pass = new DepthCopyPass({ depthPacking: RGBADepthPacking });
		expect(pass.renderTarget.texture.type).toBe(UnsignedByteType);
	});

	test("basic packing uses FloatType", () => {
		const pass = new DepthCopyPass({ depthPacking: BasicDepthPacking });
		expect(pass.renderTarget.texture.type).toBe(FloatType);
	});

	test("setDepthTexture configures material", () => {
		const pass = new DepthCopyPass();
		const tex = { isTexture: true };
		pass.setDepthTexture(tex, RGBADepthPacking);
		expect(pass.fullscreenMaterial.depthBuffer).toBe(tex);
	});

	test("setSize updates renderTarget", () => {
		const pass = new DepthCopyPass();
		pass.setSize(800, 600);
		expect(pass.renderTarget.width).toBe(800);
		expect(pass.renderTarget.height).toBe(600);
	});

	test("uses DepthCopyMaterial", () => {
		const pass = new DepthCopyPass();
		expect(pass.fullscreenMaterial).toBeInstanceOf(DepthCopyMaterial);
	});
});
