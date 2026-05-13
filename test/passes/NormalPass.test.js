import { jest } from "@jest/globals";
import { NormalPass } from "../../src/passes/NormalPass.js";
import { Scene, PerspectiveCamera, Color, MeshNormalMaterial } from "three";

describe("NormalPass", () => {
	let scene, camera;

	beforeEach(() => {
		scene = new Scene();
		camera = new PerspectiveCamera(75, 1, 0.1, 100);
	});

	test("can be instantiated", () => {
		const pass = new NormalPass(scene, camera);
		expect(pass.name).toBe("NormalPass");
	});

	test("needsSwap is false", () => {
		const pass = new NormalPass(scene, camera);
		expect(pass.needsSwap).toBe(false);
	});

	test("has a renderTarget", () => {
		const pass = new NormalPass(scene, camera);
		expect(pass.renderTarget).toBeDefined();
		expect(pass.renderTarget.texture.name).toBe("NormalPass.Target");
	});

	test("texture getter returns renderTarget texture", () => {
		const pass = new NormalPass(scene, camera);
		expect(pass.texture).toBe(pass.renderTarget.texture);
	});

	test("has an internal SceneRenderPass", () => {
		const pass = new NormalPass(scene, camera);
		expect(pass.renderPass).toBeDefined();
	});

	test("internal render pass uses normal material", () => {
		const pass = new NormalPass(scene, camera);
		expect(pass.renderPass.overrideMaterial).toBeInstanceOf(MeshNormalMaterial);
	});

	test("ignoreBackground is true on internal pass", () => {
		const pass = new NormalPass(scene, camera);
		expect(pass.renderPass.ignoreBackground).toBe(true);
	});

	test("skipShadowMapUpdate is true on internal pass", () => {
		const pass = new NormalPass(scene, camera);
		expect(pass.renderPass.skipShadowMapUpdate).toBe(true);
	});

	test("clear pass has blue-ish clear color", () => {
		const pass = new NormalPass(scene, camera);
		const clearColor = pass.renderPass.clearPass.overrideClearColor;
		expect(clearColor).toBeInstanceOf(Color);
		expect(clearColor.getHex()).toBe(0x7777ff);
	});

	test("has a resolution manager", () => {
		const pass = new NormalPass(scene, camera);
		expect(pass.resolution).toBeDefined();
	});

	test("setSize updates renderTarget size", () => {
		const pass = new NormalPass(scene, camera);
		pass.setSize(1920, 1080);
		expect(pass.renderTarget.width).toBe(1920);
		expect(pass.renderTarget.height).toBe(1080);
	});

	test("mainScene setter propagates to renderPass", () => {
		const pass = new NormalPass(scene, camera);
		const newScene = new Scene();
		pass.mainScene = newScene;
		expect(pass.renderPass.scene).toBe(newScene);
	});

	test("mainCamera setter propagates to renderPass", () => {
		const pass = new NormalPass(scene, camera);
		const newCamera = new PerspectiveCamera();
		pass.mainCamera = newCamera;
		expect(pass.renderPass.camera).toBe(newCamera);
	});

	test("resolution scale can be configured", () => {
		const pass = new NormalPass(scene, camera, { resolutionScale: 0.5 });
		pass.setSize(800, 600);
		expect(pass.renderTarget.width).toBe(400);
		expect(pass.renderTarget.height).toBe(300);
	});
});
