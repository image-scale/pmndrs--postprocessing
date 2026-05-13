import { jest } from "@jest/globals";
import { SSAOMaterial } from "../../src/materials/SSAOMaterial.js";
import { PerspectiveCamera, OrthographicCamera } from "three";

describe("SSAOMaterial", () => {
	let camera;

	beforeEach(() => {
		camera = new PerspectiveCamera(75, 1, 0.1, 100);
	});

	test("can be instantiated", () => {
		const mat = new SSAOMaterial(camera);
		expect(mat.name).toBe("SSAOMaterial");
	});

	test("has sample count defines", () => {
		const mat = new SSAOMaterial(camera);
		expect(mat.defines.SAMPLES_INT).toBeDefined();
		expect(mat.defines.INV_SAMPLES_FLOAT).toBeDefined();
	});

	test("samples getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.samples = 16;
		expect(mat.samples).toBe(16);
		expect(mat.defines.SAMPLES_INT).toBe("16");
	});

	test("rings getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.rings = 5;
		expect(mat.rings).toBe(5);
	});

	test("radius getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.radius = 0.5;
		expect(mat.radius).toBeCloseTo(0.5);
	});

	test("radius is clamped to [1e-6, 1.0]", () => {
		const mat = new SSAOMaterial(camera);
		mat.radius = 2.0;
		expect(mat.radius).toBe(1.0);
		mat.radius = -1.0;
		expect(mat.radius).toBeCloseTo(1e-6);
	});

	test("bias getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.bias = 0.05;
		expect(mat.bias).toBe(0.05);
	});

	test("fade getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.fade = 0.02;
		expect(mat.fade).toBe(0.02);
	});

	test("intensity getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.intensity = 2.0;
		expect(mat.intensity).toBe(2.0);
	});

	test("minRadiusScale getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.minRadiusScale = 0.5;
		expect(mat.minRadiusScale).toBe(0.5);
	});

	test("copyCameraSettings sets perspective define", () => {
		const mat = new SSAOMaterial(camera);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBe("1");
	});

	test("copyCameraSettings with orthographic removes perspective define", () => {
		const mat = new SSAOMaterial(camera);
		const orthoCam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		mat.copyCameraSettings(orthoCam);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBeUndefined();
	});

	test("copyCameraSettings copies near/far", () => {
		const mat = new SSAOMaterial(camera);
		expect(mat.uniforms.cameraNearFar.value.x).toBe(0.1);
		expect(mat.uniforms.cameraNearFar.value.y).toBe(100);
	});

	test("normalDepthBuffer setter sets define", () => {
		const mat = new SSAOMaterial(camera);
		const tex = { isTexture: true };
		mat.normalDepthBuffer = tex;
		expect(mat.defines.NORMAL_DEPTH).toBe("1");
		mat.normalDepthBuffer = null;
		expect(mat.defines.NORMAL_DEPTH).toBeUndefined();
	});

	test("normalBuffer getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		const tex = { isTexture: true };
		mat.normalBuffer = tex;
		expect(mat.normalBuffer).toBe(tex);
	});

	test("depthBuffer setter works", () => {
		const mat = new SSAOMaterial(camera);
		const tex = { isTexture: true };
		mat.depthBuffer = tex;
		expect(mat.uniforms.depthBuffer.value).toBe(tex);
	});

	test("depthPacking setter updates define", () => {
		const mat = new SSAOMaterial(camera);
		mat.depthPacking = 3201;
		expect(mat.defines.DEPTH_PACKING).toBe("3201");
	});

	test("distanceThreshold getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.distanceThreshold = 0.5;
		expect(mat.distanceThreshold).toBeCloseTo(0.5);
	});

	test("distanceFalloff getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.distanceThreshold = 0.5;
		mat.distanceFalloff = 0.1;
		expect(mat.distanceFalloff).toBeCloseTo(0.1);
	});

	test("proximityThreshold getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.proximityThreshold = 0.01;
		expect(mat.proximityThreshold).toBeCloseTo(0.01);
	});

	test("proximityFalloff getter/setter works", () => {
		const mat = new SSAOMaterial(camera);
		mat.proximityThreshold = 0.01;
		mat.proximityFalloff = 0.05;
		expect(mat.proximityFalloff).toBeCloseTo(0.05);
	});

	test("setSize updates texelSize and resolution", () => {
		const mat = new SSAOMaterial(camera);
		mat.setSize(640, 480);
		expect(mat.uniforms.texelSize.value.x).toBeCloseTo(1 / 640);
		expect(mat.uniforms.texelSize.value.y).toBeCloseTo(1 / 480);
		expect(mat.resolution.x).toBe(640);
		expect(mat.resolution.y).toBe(480);
	});

	test("noiseTexture setter works", () => {
		const mat = new SSAOMaterial(camera);
		const tex = { isTexture: true };
		mat.noiseTexture = tex;
		expect(mat.uniforms.noiseTexture.value).toBe(tex);
	});

	test("setSize updates noiseScale when noise texture is set", () => {
		const mat = new SSAOMaterial(camera);
		mat.noiseTexture = { isTexture: true, image: { width: 64, height: 64 } };
		mat.setSize(640, 480);
		expect(mat.uniforms.noiseScale.value.x).toBeCloseTo(10);
		expect(mat.uniforms.noiseScale.value.y).toBeCloseTo(7.5);
	});

	test("fragment shader contains SSAO sampling logic", () => {
		const mat = new SSAOMaterial(camera);
		expect(mat.fragmentShader).toContain("getAmbientOcclusion");
		expect(mat.fragmentShader).toContain("SPIRAL_TURNS");
		expect(mat.fragmentShader).toContain("RADIUS");
	});
});
