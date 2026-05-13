import { jest } from "@jest/globals";
import { SSAOEffect } from "../../src/effects/SSAOEffect.js";
import { BlendFunction, EffectAttribute } from "../../src/enums/index.js";
import { PerspectiveCamera } from "three";

describe("SSAOEffect", () => {
	let camera, normalBuffer;

	beforeEach(() => {
		camera = new PerspectiveCamera(75, 1, 0.1, 100);
		camera.position.set(0, 0, 5);
		camera.updateMatrixWorld();
		camera.updateProjectionMatrix();
		normalBuffer = { isTexture: true };
	});

	test("can be instantiated", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.name).toBe("SSAOEffect");
	});

	test("has DEPTH attribute", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.attributes).toBe(EffectAttribute.DEPTH);
	});

	test("default blend function is MULTIPLY", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.blendMode.blendFunction).toBe(BlendFunction.MULTIPLY);
	});

	test("has render target", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.renderTarget).toBeDefined();
		expect(effect.renderTarget.texture.name).toBe("AO.Target");
	});

	test("has resolution", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.resolution).toBeDefined();
	});

	test("samples getter/setter works", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.samples).toBe(9);
		effect.samples = 16;
		expect(effect.samples).toBe(16);
	});

	test("rings getter/setter works", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.rings).toBe(7);
		effect.rings = 5;
		expect(effect.rings).toBe(5);
	});

	test("radius getter/setter works", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.radius).toBeCloseTo(0.1825);
		effect.radius = 0.5;
		expect(effect.radius).toBeCloseTo(0.5);
	});

	test("intensity getter/setter works", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.intensity).toBe(1.0);
		effect.intensity = 2.0;
		expect(effect.intensity).toBe(2.0);
	});

	test("luminanceInfluence getter/setter works", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.luminanceInfluence).toBe(0.7);
		effect.luminanceInfluence = 0.3;
		expect(effect.luminanceInfluence).toBe(0.3);
	});

	test("depthAwareUpsampling defaults to true", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.depthAwareUpsampling).toBe(true);
		expect(effect.defines.has("DEPTH_AWARE_UPSAMPLING")).toBe(true);
	});

	test("depthAwareUpsampling setter works", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		effect.depthAwareUpsampling = false;
		expect(effect.defines.has("DEPTH_AWARE_UPSAMPLING")).toBe(false);
	});

	test("color defaults to null (no COLORIZE)", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.color).toBeNull();
		expect(effect.defines.has("COLORIZE")).toBe(false);
	});

	test("color setter enables COLORIZE define", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		effect.color = 0xff0000;
		expect(effect.defines.has("COLORIZE")).toBe(true);
		expect(effect.color).not.toBeNull();
	});

	test("setting color to null disables COLORIZE", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		effect.color = 0xff0000;
		effect.color = null;
		expect(effect.defines.has("COLORIZE")).toBe(false);
	});

	test("has ssaoMaterial", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.ssaoMaterial).toBeDefined();
		expect(effect.ssaoMaterial.name).toBe("SSAOMaterial");
	});

	test("has ssaoPass", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.ssaoPass).toBeDefined();
	});

	test("has depthDownsamplingPass", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.depthDownsamplingPass).toBeDefined();
		expect(effect.depthDownsamplingPass.enabled).toBe(true);
	});

	test("depthDownsamplingPass disabled when normalDepthBuffer provided", () => {
		const normalDepthTex = { isTexture: true };
		const effect = new SSAOEffect(camera, normalBuffer, { normalDepthBuffer: normalDepthTex });
		expect(effect.depthDownsamplingPass.enabled).toBe(false);
		expect(effect.defines.has("NORMAL_DEPTH")).toBe(true);
	});

	test("normalBuffer getter/setter works", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.normalBuffer).toBe(normalBuffer);
		const newNormal = { isTexture: true, name: "new" };
		effect.normalBuffer = newNormal;
		expect(effect.normalBuffer).toBe(newNormal);
	});

	test("setDepthTexture propagates to material and pass", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		const depthTex = { isTexture: true };
		effect.setDepthTexture(depthTex, 3201);
		expect(effect.ssaoMaterial.uniforms.depthBuffer.value).toBe(depthTex);
	});

	test("setSize updates render target and material", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		effect.setSize(640, 480);
		expect(effect.renderTarget.width).toBe(640);
		expect(effect.renderTarget.height).toBe(480);
	});

	test("fragment shader contains AO compositing logic", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.fragmentShader).toContain("aoBuffer");
		expect(effect.fragmentShader).toContain("luminanceInfluence");
	});

	test("custom options", () => {
		const effect = new SSAOEffect(camera, normalBuffer, {
			samples: 16,
			rings: 5,
			radius: 0.3,
			intensity: 1.5,
			bias: 0.05,
			fade: 0.02
		});
		expect(effect.samples).toBe(16);
		expect(effect.rings).toBe(5);
		expect(effect.radius).toBeCloseTo(0.3);
		expect(effect.intensity).toBe(1.5);
	});

	test("has THRESHOLD define", () => {
		const effect = new SSAOEffect(camera, normalBuffer);
		expect(effect.defines.has("THRESHOLD")).toBe(true);
	});
});
