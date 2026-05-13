import { jest } from "@jest/globals";
import { SceneRenderPass } from "../../src/passes/SceneRenderPass.js";
import { Scene, PerspectiveCamera, MeshBasicMaterial } from "three";

describe("SceneRenderPass", () => {
	test("can be instantiated with scene and camera", () => {
		const scene = new Scene();
		const camera = new PerspectiveCamera();
		const pass = new SceneRenderPass(scene, camera);
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("SceneRenderPass");
	});

	test("needsSwap is false", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera());
		expect(pass.needsSwap).toBe(false);
	});

	test("needsDepthBlit is true", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera());
		expect(pass.needsDepthBlit).toBe(true);
	});

	test("ignoreBackground defaults to false", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera());
		expect(pass.ignoreBackground).toBe(false);
	});

	test("selection defaults to null", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera());
		expect(pass.selection).toBeNull();
	});

	test("overrideMaterial starts as null if not provided", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera());
		expect(pass.overrideMaterial).toBeNull();
	});

	test("overrideMaterial can be set", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera());
		const mat = new MeshBasicMaterial();
		pass.overrideMaterial = mat;
		expect(pass.overrideMaterial).toBe(mat);
	});

	test("overrideMaterial can be set to null to clear", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera(), new MeshBasicMaterial());
		pass.overrideMaterial = null;
		expect(pass.overrideMaterial).toBeNull();
	});

	test("clear getter/setter proxies to clearPass", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera());
		expect(pass.clear).toBe(true);
		pass.clear = false;
		expect(pass.clearPass.enabled).toBe(false);
	});

	test("has a clearPass", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera());
		expect(pass.clearPass).toBeTruthy();
	});

	test("dispose does not throw", () => {
		const pass = new SceneRenderPass(new Scene(), new PerspectiveCamera());
		expect(() => pass.dispose()).not.toThrow();
	});
});
