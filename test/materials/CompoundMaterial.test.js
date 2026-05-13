import { jest } from "@jest/globals";
import { CompoundMaterial } from "../../src/materials/CompoundMaterial.js";
import { EffectShaderSection as Section } from "../../src/enums/index.js";
import { PerspectiveCamera, OrthographicCamera, Uniform, Vector2 } from "three";

describe("CompoundMaterial", () => {
	test("can be instantiated with no args", () => {
		const mat = new CompoundMaterial();
		expect(mat).toBeTruthy();
		expect(mat.name).toBe("CompoundMaterial");
	});

	test("has no blending, no depth test, no tone mapping", () => {
		const mat = new CompoundMaterial();
		expect(mat.depthWrite).toBe(false);
		expect(mat.depthTest).toBe(false);
		expect(mat.toneMapped).toBe(false);
	});

	test("has built-in uniforms", () => {
		const mat = new CompoundMaterial();
		expect(mat.uniforms.inputBuffer).toBeTruthy();
		expect(mat.uniforms.depthBuffer).toBeTruthy();
		expect(mat.uniforms.resolution).toBeTruthy();
		expect(mat.uniforms.texelSize).toBeTruthy();
		expect(mat.uniforms.cameraNear).toBeTruthy();
		expect(mat.uniforms.cameraFar).toBeTruthy();
		expect(mat.uniforms.aspect).toBeTruthy();
		expect(mat.uniforms.time).toBeTruthy();
	});

	test("has built-in defines", () => {
		const mat = new CompoundMaterial();
		expect(mat.defines.DEPTH_PACKING).toBe("0");
		expect(mat.defines.ENCODE_OUTPUT).toBe("1");
		expect(mat.defines.THREE_REVISION).toBeDefined();
	});

	test("inputBuffer setter sets uniform", () => {
		const mat = new CompoundMaterial();
		const tex = { isTexture: true };
		mat.inputBuffer = tex;
		expect(mat.uniforms.inputBuffer.value).toBe(tex);
	});

	test("depthBuffer getter/setter works", () => {
		const mat = new CompoundMaterial();
		expect(mat.depthBuffer).toBeNull();
		const tex = { isTexture: true };
		mat.depthBuffer = tex;
		expect(mat.depthBuffer).toBe(tex);
	});

	test("depthPacking getter/setter works", () => {
		const mat = new CompoundMaterial();
		expect(mat.depthPacking).toBe(0);
		mat.depthPacking = 3201;
		expect(mat.depthPacking).toBe(3201);
		expect(mat.defines.DEPTH_PACKING).toBe("3201");
	});

	test("encodeOutput getter/setter toggles define", () => {
		const mat = new CompoundMaterial();
		expect(mat.encodeOutput).toBe(true);
		mat.encodeOutput = false;
		expect(mat.encodeOutput).toBe(false);
		expect(mat.defines.ENCODE_OUTPUT).toBeUndefined();
		mat.encodeOutput = true;
		expect(mat.defines.ENCODE_OUTPUT).toBe("1");
	});

	test("time getter/setter works", () => {
		const mat = new CompoundMaterial();
		expect(mat.time).toBe(0.0);
		mat.time = 3.14;
		expect(mat.time).toBe(3.14);
	});

	test("copyCameraSettings with PerspectiveCamera", () => {
		const cam = new PerspectiveCamera(75, 1, 0.1, 500);
		const mat = new CompoundMaterial(null, null, null, cam);
		expect(mat.uniforms.cameraNear.value).toBe(0.1);
		expect(mat.uniforms.cameraFar.value).toBe(500);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBe("1");
	});

	test("copyCameraSettings with OrthographicCamera removes PERSPECTIVE_CAMERA", () => {
		const pCam = new PerspectiveCamera(75, 1, 0.1, 500);
		const mat = new CompoundMaterial(null, null, null, pCam);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBe("1");

		const oCam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
		mat.copyCameraSettings(oCam);
		expect(mat.defines.PERSPECTIVE_CAMERA).toBeUndefined();
		expect(mat.uniforms.cameraNear.value).toBe(0.1);
		expect(mat.uniforms.cameraFar.value).toBe(100);
	});

	test("setSize updates resolution, texelSize, and aspect", () => {
		const mat = new CompoundMaterial();
		mat.setSize(800, 400);
		expect(mat.uniforms.resolution.value.x).toBe(800);
		expect(mat.uniforms.resolution.value.y).toBe(400);
		expect(mat.uniforms.texelSize.value.x).toBeCloseTo(1.0 / 800);
		expect(mat.uniforms.texelSize.value.y).toBeCloseTo(1.0 / 400);
		expect(mat.uniforms.aspect.value).toBe(2.0);
	});

	test("setShaderParts replaces template placeholders", () => {
		const mat = new CompoundMaterial();
		const parts = new Map([
			[Section.FRAGMENT_HEAD, "// fragment head code"],
			[Section.FRAGMENT_MAIN_UV, ""],
			[Section.FRAGMENT_MAIN_IMAGE, "// main image code"],
			[Section.VERTEX_HEAD, "// vertex head code"],
			[Section.VERTEX_MAIN_SUPPORT, ""]
		]);
		mat.setShaderParts(parts);
		expect(mat.fragmentShader).toContain("// fragment head code");
		expect(mat.fragmentShader).toContain("// main image code");
		expect(mat.fragmentShader).not.toContain("FRAGMENT_HEAD");
		expect(mat.vertexShader).toContain("// vertex head code");
		expect(mat.vertexShader).not.toContain("VERTEX_HEAD");
	});

	test("setDefines merges into material defines", () => {
		const mat = new CompoundMaterial();
		mat.setDefines(new Map([["CUSTOM_DEFINE", "42"]]));
		expect(mat.defines.CUSTOM_DEFINE).toBe("42");
		expect(mat.defines.ENCODE_OUTPUT).toBe("1");
	});

	test("setUniforms merges into material uniforms", () => {
		const mat = new CompoundMaterial();
		const u = new Uniform(5.0);
		mat.setUniforms(new Map([["custom", u]]));
		expect(mat.uniforms.custom).toBe(u);
		expect(mat.uniforms.inputBuffer).toBeTruthy();
	});

	test("setExtensions populates extensions object", () => {
		const mat = new CompoundMaterial();
		mat.setExtensions(new Set(["OES_texture_float", "EXT_frag_depth"]));
		expect(mat.extensions.OES_texture_float).toBe(true);
		expect(mat.extensions.EXT_frag_depth).toBe(true);
	});

	test("setShaderData calls all sub-methods", () => {
		const mat = new CompoundMaterial();
		const data = {
			shaderParts: new Map([
				[Section.FRAGMENT_HEAD, "// head"],
				[Section.FRAGMENT_MAIN_UV, ""],
				[Section.FRAGMENT_MAIN_IMAGE, ""],
				[Section.VERTEX_HEAD, ""],
				[Section.VERTEX_MAIN_SUPPORT, ""]
			]),
			defines: new Map([["FOO", "1"]]),
			uniforms: new Map([["bar", new Uniform(0)]]),
			extensions: new Set(["EXT_test"])
		};
		mat.setShaderData(data);
		expect(mat.fragmentShader).toContain("// head");
		expect(mat.defines.FOO).toBe("1");
		expect(mat.uniforms.bar).toBeTruthy();
		expect(mat.extensions.EXT_test).toBe(true);
	});

	test("fragment shader template contains utility functions", () => {
		const mat = new CompoundMaterial();
		const parts = new Map([
			[Section.FRAGMENT_HEAD, ""],
			[Section.FRAGMENT_MAIN_UV, ""],
			[Section.FRAGMENT_MAIN_IMAGE, ""],
			[Section.VERTEX_HEAD, ""],
			[Section.VERTEX_MAIN_SUPPORT, ""]
		]);
		mat.setShaderParts(parts);
		expect(mat.fragmentShader).toContain("readDepth");
		expect(mat.fragmentShader).toContain("getViewZ");
		expect(mat.fragmentShader).toContain("sRGBToLinear");
		expect(mat.fragmentShader).toContain("RGBToHSL");
		expect(mat.fragmentShader).toContain("HSLToRGB");
	});
});
