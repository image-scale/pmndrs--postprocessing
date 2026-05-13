import { jest } from "@jest/globals";
import { DepthMaskMaterial } from "../../src/materials/DepthMaskMaterial.js";
import { DepthTestStrategy } from "../../src/enums/index.js";
import {
	LessDepth,
	EqualDepth,
	NotEqualDepth,
	AlwaysDepth,
	NeverDepth,
	GreaterDepth,
	PerspectiveCamera,
	OrthographicCamera
} from "three";

describe("DepthMaskMaterial", () => {
	test("can be instantiated", () => {
		const mat = new DepthMaskMaterial();
		expect(mat.name).toBe("DepthMaskMaterial");
	});

	test("default depth mode is LessDepth", () => {
		const mat = new DepthMaskMaterial();
		expect(mat.depthMode).toBe(LessDepth);
	});

	test("default maxDepthStrategy is KEEP_MAX_DEPTH", () => {
		const mat = new DepthMaskMaterial();
		expect(mat.maxDepthStrategy).toBe(DepthTestStrategy.KEEP_MAX_DEPTH);
	});

	test("default epsilon is 0.0001", () => {
		const mat = new DepthMaskMaterial();
		expect(mat.epsilon).toBeCloseTo(0.0001);
	});

	test("epsilon setter updates define", () => {
		const mat = new DepthMaskMaterial();
		mat.epsilon = 0.001;
		expect(mat.epsilon).toBeCloseTo(0.001);
	});

	test("depthMode setter EqualDepth sets correct test expression", () => {
		const mat = new DepthMaskMaterial();
		mat.depthMode = EqualDepth;
		expect(mat.defines["depthTest(d0, d1)"]).toContain("DEPTH_EPSILON");
	});

	test("depthMode setter NotEqualDepth sets correct test expression", () => {
		const mat = new DepthMaskMaterial();
		mat.depthMode = NotEqualDepth;
		expect(mat.defines["depthTest(d0, d1)"]).toContain(">");
	});

	test("depthMode setter AlwaysDepth sets true", () => {
		const mat = new DepthMaskMaterial();
		mat.depthMode = AlwaysDepth;
		expect(mat.defines["depthTest(d0, d1)"]).toBe("true");
	});

	test("depthMode setter NeverDepth sets false", () => {
		const mat = new DepthMaskMaterial();
		mat.depthMode = NeverDepth;
		expect(mat.defines["depthTest(d0, d1)"]).toBe("false");
	});

	test("depthMode setter GreaterDepth sets d0 < d1", () => {
		const mat = new DepthMaskMaterial();
		mat.depthMode = GreaterDepth;
		expect(mat.defines["depthTest(d0, d1)"]).toBe("d0 < d1");
	});

	test("depthBuffer0 setter works", () => {
		const mat = new DepthMaskMaterial();
		const tex = { isTexture: true };
		mat.depthBuffer0 = tex;
		expect(mat.uniforms.depthBuffer0.value).toBe(tex);
	});

	test("depthBuffer1 setter works", () => {
		const mat = new DepthMaskMaterial();
		const tex = { isTexture: true };
		mat.depthBuffer1 = tex;
		expect(mat.uniforms.depthBuffer1.value).toBe(tex);
	});

	test("depthPacking0 setter updates define", () => {
		const mat = new DepthMaskMaterial();
		mat.depthPacking0 = 3201;
		expect(mat.defines.DEPTH_PACKING_0).toBe("3201");
	});

	test("depthPacking1 setter updates define", () => {
		const mat = new DepthMaskMaterial();
		mat.depthPacking1 = 3201;
		expect(mat.defines.DEPTH_PACKING_1).toBe("3201");
	});

	test("maxDepthStrategy setter updates define", () => {
		const mat = new DepthMaskMaterial();
		mat.maxDepthStrategy = DepthTestStrategy.DISCARD_MAX_DEPTH;
		expect(mat.maxDepthStrategy).toBe(DepthTestStrategy.DISCARD_MAX_DEPTH);
	});

	test("copyCameraSettings with perspective camera", () => {
		const mat = new DepthMaskMaterial();
		const cam = new PerspectiveCamera(75, 1, 0.5, 200);
		mat.copyCameraSettings(cam);
		expect(mat.uniforms.cameraNearFar.value.x).toBe(0.5);
		expect(mat.uniforms.cameraNearFar.value.y).toBe(200);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBe("1");
	});

	test("copyCameraSettings with orthographic camera", () => {
		const mat = new DepthMaskMaterial();
		const cam = new OrthographicCamera(-10, 10, 10, -10, 0.1, 50);
		mat.copyCameraSettings(cam);
		expect(mat.uniforms.cameraNearFar.value.x).toBe(0.1);
		expect(mat.uniforms.cameraNearFar.value.y).toBe(50);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBeUndefined();
	});

	test("copyCameraSettings removes PERSPECTIVE_CAMERA for ortho after perspective", () => {
		const mat = new DepthMaskMaterial();
		const persp = new PerspectiveCamera(75, 1, 0.1, 100);
		const ortho = new OrthographicCamera(-10, 10, 10, -10, 0.1, 50);
		mat.copyCameraSettings(persp);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBe("1");
		mat.copyCameraSettings(ortho);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBeUndefined();
	});

	test("fragment shader contains depth buffer samplers", () => {
		const mat = new DepthMaskMaterial();
		expect(mat.fragmentShader).toContain("depthBuffer0");
		expect(mat.fragmentShader).toContain("depthBuffer1");
	});

	test("fragment shader contains discard logic", () => {
		const mat = new DepthMaskMaterial();
		expect(mat.fragmentShader).toContain("discard");
	});

	test("has no blending", () => {
		const mat = new DepthMaskMaterial();
		expect(mat.blending).toBe(0);
	});
});
