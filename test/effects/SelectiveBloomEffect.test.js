import { jest } from "@jest/globals";
import { SelectiveBloomEffect } from "../../src/effects/SelectiveBloomEffect.js";
import { BloomEffect } from "../../src/effects/BloomEffect.js";
import { DepthMaskMaterial } from "../../src/materials/DepthMaskMaterial.js";
import { DepthPass } from "../../src/passes/DepthPass.js";
import { Selection } from "../../src/core/Selection.js";
import { EffectAttribute, DepthTestStrategy } from "../../src/enums/index.js";
import { EqualDepth, NotEqualDepth, Scene, PerspectiveCamera, Object3D } from "three";

describe("SelectiveBloomEffect", () => {
	let scene, camera;

	beforeEach(() => {
		scene = new Scene();
		camera = new PerspectiveCamera(75, 1, 0.1, 100);
	});

	test("can be instantiated", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.name).toBe("BloomEffect");
	});

	test("extends BloomEffect", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect).toBeInstanceOf(BloomEffect);
	});

	test("has DEPTH attribute", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.getAttributes() & EffectAttribute.DEPTH).toBeTruthy();
	});

	test("has a DepthPass", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.depthPass).toBeInstanceOf(DepthPass);
	});

	test("has a clearPass", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.clearPass).toBeDefined();
		expect(effect.clearPass.overrideClearColor).toBeDefined();
	});

	test("has a depthMaskPass", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.depthMaskPass).toBeDefined();
	});

	test("depthMaskMaterial is a DepthMaskMaterial", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.depthMaskMaterial).toBeInstanceOf(DepthMaskMaterial);
	});

	test("has a selection set", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.selection).toBeInstanceOf(Selection);
	});

	test("has renderTargetMasked", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.renderTargetMasked).toBeDefined();
		expect(effect.renderTargetMasked.texture.name).toBe("Bloom.Masked");
	});

	test("inverted defaults to false", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.inverted).toBe(false);
	});

	test("inverted setter changes depth mode", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		effect.inverted = true;
		expect(effect.inverted).toBe(true);
		expect(effect.depthMaskMaterial.depthMode).toBe(NotEqualDepth);
		effect.inverted = false;
		expect(effect.depthMaskMaterial.depthMode).toBe(EqualDepth);
	});

	test("ignoreBackground defaults to false", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		expect(effect.ignoreBackground).toBe(false);
	});

	test("ignoreBackground setter changes maxDepthStrategy", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		effect.ignoreBackground = true;
		expect(effect.depthMaskMaterial.maxDepthStrategy).toBe(DepthTestStrategy.DISCARD_MAX_DEPTH);
		effect.ignoreBackground = false;
		expect(effect.depthMaskMaterial.maxDepthStrategy).toBe(DepthTestStrategy.KEEP_MAX_DEPTH);
	});

	test("setDepthTexture sets depth on mask material", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		const mockTexture = { isTexture: true };
		effect.setDepthTexture(mockTexture, 3201);
		expect(effect.depthMaskMaterial.uniforms.depthBuffer0.value).toBe(mockTexture);
	});

	test("setSize propagates to parent and sub-passes", () => {
		const effect = new SelectiveBloomEffect(scene, camera);
		effect.setSize(1920, 1080);
		expect(effect.renderTargetMasked.width).toBe(1920);
		expect(effect.renderTargetMasked.height).toBe(1080);
	});

	test("passes bloom options through to parent", () => {
		const effect = new SelectiveBloomEffect(scene, camera, {
			intensity: 3.0,
			luminanceThreshold: 0.8
		});
		expect(effect.intensity).toBe(3.0);
		expect(effect.luminanceMaterial.threshold).toBe(0.8);
	});
});
