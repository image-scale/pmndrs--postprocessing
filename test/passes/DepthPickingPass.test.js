import { jest } from "@jest/globals";
import { DepthPickingPass } from "../../src/passes/DepthPickingPass.js";
import { DepthCopyPass } from "../../src/passes/DepthCopyPass.js";
import { DepthCopyMode } from "../../src/enums/index.js";
import { RGBADepthPacking, BasicDepthPacking, Vector2 } from "three";

describe("DepthPickingPass", () => {
	test("can be instantiated", () => {
		const pass = new DepthPickingPass();
		expect(pass.name).toBe("DepthPickingPass");
	});

	test("extends DepthCopyPass", () => {
		const pass = new DepthPickingPass();
		expect(pass).toBeInstanceOf(DepthCopyPass);
	});

	test("default mode is SINGLE", () => {
		const pass = new DepthPickingPass();
		expect(pass.fullscreenMaterial.mode).toBe(DepthCopyMode.SINGLE);
	});

	test("FULL mode can be set", () => {
		const pass = new DepthPickingPass({ mode: DepthCopyMode.FULL });
		expect(pass.fullscreenMaterial.mode).toBe(DepthCopyMode.FULL);
	});

	test("uses Uint8Array for RGBA packing", () => {
		const pass = new DepthPickingPass({ depthPacking: RGBADepthPacking });
		expect(pass.pixelBuffer).toBeInstanceOf(Uint8Array);
		expect(pass.pixelBuffer.length).toBe(4);
	});

	test("uses Float32Array for basic packing", () => {
		const pass = new DepthPickingPass({ depthPacking: BasicDepthPacking });
		expect(pass.pixelBuffer).toBeInstanceOf(Float32Array);
		expect(pass.pixelBuffer.length).toBe(4);
	});

	test("readDepth returns a promise", () => {
		const pass = new DepthPickingPass();
		const ndc = new Vector2(0, 0);
		const promise = pass.readDepth(ndc);
		expect(promise).toBeInstanceOf(Promise);
		pass.callback = null;
	});

	test("readDepth sets texel position", () => {
		const pass = new DepthPickingPass();
		const ndc = new Vector2(0.5, -0.5);
		pass.readDepth(ndc);
		expect(pass.fullscreenMaterial.texelPosition.x).toBeCloseTo(0.75);
		expect(pass.fullscreenMaterial.texelPosition.y).toBeCloseTo(0.25);
		pass.callback = null;
	});

	test("callback is initially null", () => {
		const pass = new DepthPickingPass();
		expect(pass.callback).toBeNull();
	});

	test("setSize only resizes in FULL mode", () => {
		const passSingle = new DepthPickingPass({ mode: DepthCopyMode.SINGLE });
		passSingle.setSize(800, 600);
		expect(passSingle.renderTarget.width).toBe(1);

		const passFull = new DepthPickingPass({ mode: DepthCopyMode.FULL });
		passFull.setSize(800, 600);
		expect(passFull.renderTarget.width).toBe(800);
	});
});
