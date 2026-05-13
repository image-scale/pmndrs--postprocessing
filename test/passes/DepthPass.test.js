import { jest } from "@jest/globals";
import { DepthPass } from "../../src/passes/DepthPass.js";
import { Scene, PerspectiveCamera, Color } from "three";

describe("DepthPass", () => {
	let scene, camera;

	beforeEach(() => {
		scene = new Scene();
		camera = new PerspectiveCamera(75, 1, 0.1, 100);
	});

	test("can be instantiated", () => {
		const pass = new DepthPass(scene, camera);
		expect(pass.name).toBe("DepthPass");
	});

	test("needsSwap is false", () => {
		const pass = new DepthPass(scene, camera);
		expect(pass.needsSwap).toBe(false);
	});

	test("has a renderTarget", () => {
		const pass = new DepthPass(scene, camera);
		expect(pass.renderTarget).toBeDefined();
		expect(pass.renderTarget.texture.name).toBe("DepthPass.Target");
	});

	test("texture getter returns renderTarget texture", () => {
		const pass = new DepthPass(scene, camera);
		expect(pass.texture).toBe(pass.renderTarget.texture);
	});

	test("has an internal SceneRenderPass", () => {
		const pass = new DepthPass(scene, camera);
		expect(pass.renderPass).toBeDefined();
		expect(pass.renderPass.name).toBe("SceneRenderPass");
	});

	test("internal render pass uses depth material", () => {
		const pass = new DepthPass(scene, camera);
		expect(pass.renderPass.overrideMaterial).toBeDefined();
		expect(pass.renderPass.overrideMaterial.depthPacking).toBeDefined();
	});

	test("ignoreBackground is true on internal pass", () => {
		const pass = new DepthPass(scene, camera);
		expect(pass.renderPass.ignoreBackground).toBe(true);
	});

	test("skipShadowMapUpdate is true on internal pass", () => {
		const pass = new DepthPass(scene, camera);
		expect(pass.renderPass.skipShadowMapUpdate).toBe(true);
	});

	test("has a resolution manager", () => {
		const pass = new DepthPass(scene, camera);
		expect(pass.resolution).toBeDefined();
	});

	test("setSize updates renderTarget size", () => {
		const pass = new DepthPass(scene, camera);
		pass.setSize(1920, 1080);
		expect(pass.renderTarget.width).toBe(1920);
		expect(pass.renderTarget.height).toBe(1080);
	});

	test("initialize sets clear color for standard depth", () => {
		const pass = new DepthPass(scene, camera);
		const renderer = {
			capabilities: { reversedDepthBuffer: false }
		};
		pass.initialize(renderer, false, undefined);
		expect(pass.renderPass.clearPass.overrideClearColor).toBeInstanceOf(Color);
		expect(pass.renderPass.clearPass.overrideClearColor.getHex()).toBe(0xffffff);
	});

	test("initialize sets clear color for reversed depth", () => {
		const pass = new DepthPass(scene, camera);
		const renderer = {
			capabilities: { reversedDepthBuffer: true }
		};
		pass.initialize(renderer, false, undefined);
		expect(pass.renderPass.clearPass.overrideClearColor.getHex()).toBe(0x000000);
	});

	test("mainScene setter propagates to renderPass", () => {
		const pass = new DepthPass(scene, camera);
		const newScene = new Scene();
		pass.mainScene = newScene;
		expect(pass.renderPass.scene).toBe(newScene);
	});

	test("mainCamera setter propagates to renderPass", () => {
		const pass = new DepthPass(scene, camera);
		const newCamera = new PerspectiveCamera();
		pass.mainCamera = newCamera;
		expect(pass.renderPass.camera).toBe(newCamera);
	});
});
