import { jest } from "@jest/globals";
import { OutlineEffect } from "../../src/effects/OutlineEffect.js";
import { BlendFunction, KernelSize } from "../../src/enums/index.js";
import { Scene, PerspectiveCamera, Mesh, BoxGeometry, MeshBasicMaterial } from "three";

describe("OutlineEffect", () => {
	let scene, camera;

	beforeEach(() => {
		scene = new Scene();
		camera = new PerspectiveCamera(75, 1, 0.1, 100);
		camera.position.set(0, 0, 5);
		camera.updateMatrixWorld();
	});

	test("can be instantiated", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.name).toBe("OutlineEffect");
	});

	test("has selection", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.selection).toBeDefined();
		expect(effect.selection.size).toBe(0);
	});

	test("xRay defaults to true", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.xRay).toBe(true);
		expect(effect.defines.has("X_RAY")).toBe(true);
	});

	test("xRay setter toggles define", () => {
		const effect = new OutlineEffect(scene, camera);
		effect.xRay = false;
		expect(effect.defines.has("X_RAY")).toBe(false);
		effect.xRay = true;
		expect(effect.defines.has("X_RAY")).toBe(true);
	});

	test("edgeStrength getter/setter works", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.edgeStrength).toBe(1.0);
		effect.edgeStrength = 2.5;
		expect(effect.edgeStrength).toBe(2.5);
	});

	test("visibleEdgeColor getter/setter works", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.visibleEdgeColor).toBeDefined();
		expect(effect.visibleEdgeColor.r).toBeCloseTo(1.0);
	});

	test("hiddenEdgeColor getter/setter works", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.hiddenEdgeColor).toBeDefined();
	});

	test("pulseSpeed defaults to 0", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.pulseSpeed).toBe(0);
	});

	test("has depthPass", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.depthPass).toBeDefined();
		expect(effect.depthPass.name).toBe("DepthPass");
	});

	test("has maskPass", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.maskPass).toBeDefined();
	});

	test("has blurPass", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.blurPass).toBeDefined();
		expect(effect.blurPass.enabled).toBe(false);
	});

	test("blur option enables blur pass", () => {
		const effect = new OutlineEffect(scene, camera, { blur: true });
		expect(effect.blurPass.enabled).toBe(true);
	});

	test("has outlinePass", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.outlinePass).toBeDefined();
	});

	test("has render target for mask", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.renderTargetMask).toBeDefined();
		expect(effect.renderTargetMask.texture.name).toBe("Outline.Mask");
	});

	test("has render target for outline", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.renderTargetOutline).toBeDefined();
		expect(effect.renderTargetOutline.texture.name).toBe("Outline.Edges");
	});

	test("multisampling getter/setter works", () => {
		const effect = new OutlineEffect(scene, camera, { multisampling: 4 });
		expect(effect.multisampling).toBe(4);
	});

	test("resolution delegates to blurPass", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.resolution).toBe(effect.blurPass.resolution);
	});

	test("patternScale getter/setter works", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.patternScale).toBe(1.0);
		effect.patternScale = 2.0;
		expect(effect.patternScale).toBe(2.0);
	});

	test("patternTexture setter enables USE_PATTERN define", () => {
		const effect = new OutlineEffect(scene, camera);
		const tex = { isTexture: true };
		effect.patternTexture = tex;
		expect(effect.defines.has("USE_PATTERN")).toBe(true);
		expect(effect.vertexShader).not.toBeNull();
	});

	test("patternTexture null disables USE_PATTERN", () => {
		const effect = new OutlineEffect(scene, camera);
		effect.patternTexture = { isTexture: true };
		effect.patternTexture = null;
		expect(effect.defines.has("USE_PATTERN")).toBe(false);
		expect(effect.vertexShader).toBeNull();
	});

	test("custom blend function", () => {
		const effect = new OutlineEffect(scene, camera, { blendFunction: BlendFunction.ALPHA });
		expect(effect.defines.has("ALPHA")).toBe(true);
	});

	test("setSize updates render targets", () => {
		const effect = new OutlineEffect(scene, camera);
		effect.setSize(640, 480);
		expect(effect.renderTargetMask.width).toBe(640);
		expect(effect.renderTargetMask.height).toBe(480);
	});

	test("fragment shader contains outline compositing logic", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.fragmentShader).toContain("edgeTexture");
		expect(effect.fragmentShader).toContain("maskTexture");
		expect(effect.fragmentShader).toContain("visibleEdgeColor");
		expect(effect.fragmentShader).toContain("hiddenEdgeColor");
	});

	test("forceUpdate defaults to true", () => {
		const effect = new OutlineEffect(scene, camera);
		expect(effect.forceUpdate).toBe(true);
	});

	test("custom options", () => {
		const effect = new OutlineEffect(scene, camera, {
			edgeStrength: 3.0,
			pulseSpeed: 2.0,
			kernelSize: KernelSize.LARGE
		});
		expect(effect.edgeStrength).toBe(3.0);
		expect(effect.pulseSpeed).toBe(2.0);
	});
});
