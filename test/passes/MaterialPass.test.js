import { jest } from "@jest/globals";
import { MaterialPass } from "../../src/passes/MaterialPass.js";
import { ShaderMaterial } from "three";

describe("MaterialPass", () => {
	test("can be instantiated with a material", () => {
		const mat = new ShaderMaterial({ uniforms: { inputBuffer: { value: null } } });
		const pass = new MaterialPass(mat);
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("MaterialPass");
	});

	test("stores the input uniform name", () => {
		const mat = new ShaderMaterial();
		const pass = new MaterialPass(mat, "myInput");
		expect(pass.inputUniform).toBe("myInput");
	});

	test("default input uniform is 'inputBuffer'", () => {
		const mat = new ShaderMaterial();
		const pass = new MaterialPass(mat);
		expect(pass.inputUniform).toBe("inputBuffer");
	});

	test("dispose does not throw", () => {
		const mat = new ShaderMaterial();
		const pass = new MaterialPass(mat);
		expect(() => pass.dispose()).not.toThrow();
	});
});
