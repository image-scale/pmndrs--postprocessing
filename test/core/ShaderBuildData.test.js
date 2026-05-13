import { jest } from "@jest/globals";
import { ShaderBuildData } from "../../src/core/ShaderBuildData.js";
import { EffectAttribute, EffectShaderSection as Section } from "../../src/enums/index.js";

describe("ShaderBuildData", () => {
	test("can be instantiated", () => {
		const data = new ShaderBuildData();
		expect(data).toBeTruthy();
	});

	test("has shaderParts map with all five sections initialized to null", () => {
		const data = new ShaderBuildData();
		expect(data.shaderParts.size).toBe(5);
		expect(data.shaderParts.get(Section.FRAGMENT_HEAD)).toBeNull();
		expect(data.shaderParts.get(Section.FRAGMENT_MAIN_UV)).toBeNull();
		expect(data.shaderParts.get(Section.FRAGMENT_MAIN_IMAGE)).toBeNull();
		expect(data.shaderParts.get(Section.VERTEX_HEAD)).toBeNull();
		expect(data.shaderParts.get(Section.VERTEX_MAIN_SUPPORT)).toBeNull();
	});

	test("has empty defines and uniforms maps", () => {
		const data = new ShaderBuildData();
		expect(data.defines).toBeInstanceOf(Map);
		expect(data.defines.size).toBe(0);
		expect(data.uniforms).toBeInstanceOf(Map);
		expect(data.uniforms.size).toBe(0);
	});

	test("has empty blendModes map and extensions set", () => {
		const data = new ShaderBuildData();
		expect(data.blendModes).toBeInstanceOf(Map);
		expect(data.blendModes.size).toBe(0);
		expect(data.extensions).toBeInstanceOf(Set);
		expect(data.extensions.size).toBe(0);
	});

	test("attributes defaults to NONE", () => {
		const data = new ShaderBuildData();
		expect(data.attributes).toBe(EffectAttribute.NONE);
	});

	test("has empty varyings set", () => {
		const data = new ShaderBuildData();
		expect(data.varyings).toBeInstanceOf(Set);
		expect(data.varyings.size).toBe(0);
	});

	test("uvTransformation and readDepth default to false", () => {
		const data = new ShaderBuildData();
		expect(data.uvTransformation).toBe(false);
		expect(data.readDepth).toBe(false);
	});

	test("colorSpace defaults to LinearSRGBColorSpace", () => {
		const data = new ShaderBuildData();
		expect(data.colorSpace).toBe("srgb-linear");
	});
});
