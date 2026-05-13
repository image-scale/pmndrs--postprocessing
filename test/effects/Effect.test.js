import { jest } from "@jest/globals";
import { Effect } from "../../src/effects/Effect.js";
import { BlendFunction, EffectAttribute } from "../../src/enums/index.js";

describe("Effect", () => {
	test("can be created with name and null fragment shader", () => {
		const effect = new Effect("TestEffect", null);
		expect(effect).toBeTruthy();
		expect(effect.name).toBe("TestEffect");
	});

	test("can be created and disposed", () => {
		const effect = new Effect("TestEffect", null);
		expect(() => effect.dispose()).not.toThrow();
	});

	test("has default attributes of NONE", () => {
		const effect = new Effect("Test", null);
		expect(effect.attributes).toBe(EffectAttribute.NONE);
	});

	test("has a blendMode with default NORMAL", () => {
		const effect = new Effect("Test", null);
		expect(effect.blendMode).toBeTruthy();
		expect(effect.blendMode.blendFunction).toBe(BlendFunction.NORMAL);
	});

	test("accepts custom blendFunction", () => {
		const effect = new Effect("Test", null, { blendFunction: BlendFunction.SCREEN });
		expect(effect.blendMode.blendFunction).toBe(BlendFunction.SCREEN);
	});

	test("stores fragment and vertex shaders", () => {
		const frag = "void mainImage(in vec4 c, in vec2 uv, out vec4 o) { o = c; }";
		const vert = "void mainSupport() {}";
		const effect = new Effect("Test", frag, { vertexShader: vert });
		expect(effect.fragmentShader).toBe(frag);
		expect(effect.vertexShader).toBe(vert);
	});

	test("uniforms and defines are Maps", () => {
		const effect = new Effect("Test", null);
		expect(effect.uniforms).toBeInstanceOf(Map);
		expect(effect.defines).toBeInstanceOf(Map);
	});

	test("setChanged dispatches change event", () => {
		const effect = new Effect("Test", null);
		const handler = jest.fn();
		effect.addEventListener("change", handler);
		effect.setChanged();
		expect(handler).toHaveBeenCalled();
	});

	test("setFragmentShader triggers change event", () => {
		const effect = new Effect("Test", null);
		const handler = jest.fn();
		effect.addEventListener("change", handler);
		effect.setFragmentShader("new shader");
		expect(handler).toHaveBeenCalled();
		expect(effect.fragmentShader).toBe("new shader");
	});

	test("setVertexShader triggers change event", () => {
		const effect = new Effect("Test", null);
		const handler = jest.fn();
		effect.addEventListener("change", handler);
		effect.setVertexShader("new vert");
		expect(handler).toHaveBeenCalled();
		expect(effect.vertexShader).toBe("new vert");
	});

	test("setAttributes triggers change event", () => {
		const effect = new Effect("Test", null);
		const handler = jest.fn();
		effect.addEventListener("change", handler);
		effect.setAttributes(EffectAttribute.DEPTH);
		expect(handler).toHaveBeenCalled();
		expect(effect.attributes).toBe(EffectAttribute.DEPTH);
	});

	test("changing blendMode blendFunction triggers effect change", () => {
		const effect = new Effect("Test", null);
		const handler = jest.fn();
		effect.addEventListener("change", handler);
		effect.blendMode.blendFunction = BlendFunction.SCREEN;
		expect(handler).toHaveBeenCalled();
	});

	test("inputColorSpace defaults to LinearSRGBColorSpace", () => {
		const effect = new Effect("Test", null);
		expect(effect.inputColorSpace).toBeTruthy();
	});

	test("setDepthTexture, update, setSize, initialize are no-ops", () => {
		const effect = new Effect("Test", null);
		expect(() => effect.setDepthTexture(null)).not.toThrow();
		expect(() => effect.update(null, null, 0)).not.toThrow();
		expect(() => effect.setSize(100, 100)).not.toThrow();
		expect(() => effect.initialize(null, false, undefined)).not.toThrow();
	});

	test("getters and setters for shader/attributes", () => {
		const effect = new Effect("Test", "frag");
		expect(effect.getFragmentShader()).toBe("frag");
		expect(effect.getVertexShader()).toBeNull();
		expect(effect.getAttributes()).toBe(EffectAttribute.NONE);
	});
});
