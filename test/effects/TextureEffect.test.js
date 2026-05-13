import { jest } from "@jest/globals";
import { TextureEffect } from "../../src/effects/TextureEffect.js";
import { ColorChannel } from "../../src/enums/index.js";
import { Texture, UnsignedByteType, FloatType, Matrix3 } from "three";

describe("TextureEffect", () => {
	test("can be instantiated with defaults", () => {
		const effect = new TextureEffect();
		expect(effect.name).toBe("TextureEffect");
	});

	test("texture defaults to null", () => {
		const effect = new TextureEffect();
		expect(effect.texture).toBeNull();
	});

	test("texture getter/setter works", () => {
		const effect = new TextureEffect();
		const tex = new Texture();
		tex.matrixAutoUpdate = false;
		effect.texture = tex;
		expect(effect.texture).toBe(tex);
	});

	test("sets UV_TRANSFORM define when texture has matrixAutoUpdate", () => {
		const effect = new TextureEffect();
		const tex = new Texture();
		tex.matrixAutoUpdate = true;
		effect.texture = tex;
		expect(effect.defines.has("UV_TRANSFORM")).toBe(true);
	});

	test("removes UV_TRANSFORM define when texture does not auto-update", () => {
		const effect = new TextureEffect();
		const tex = new Texture();
		tex.matrixAutoUpdate = false;
		effect.texture = tex;
		expect(effect.defines.has("UV_TRANSFORM")).toBe(false);
	});

	test("aspectCorrection defaults to false", () => {
		const effect = new TextureEffect();
		expect(effect.aspectCorrection).toBe(false);
	});

	test("aspectCorrection setter adds/removes define", () => {
		const effect = new TextureEffect();
		effect.aspectCorrection = true;
		expect(effect.defines.has("ASPECT_CORRECTION")).toBe(true);
		effect.aspectCorrection = false;
		expect(effect.defines.has("ASPECT_CORRECTION")).toBe(false);
	});

	test("setTextureSwizzleRGBA changes TEXEL define", () => {
		const effect = new TextureEffect();
		effect.setTextureSwizzleRGBA(ColorChannel.RED, ColorChannel.RED, ColorChannel.RED, ColorChannel.ALPHA);
		expect(effect.defines.get("TEXEL")).toBe("texel.rrra");
	});

	test("default TEXEL define is 'texel'", () => {
		const effect = new TextureEffect();
		expect(effect.defines.get("TEXEL")).toBe("texel");
	});

	test("setTextureSwizzleRGBA with identity keeps 'texel'", () => {
		const effect = new TextureEffect();
		effect.setTextureSwizzleRGBA(
			ColorChannel.RED, ColorChannel.GREEN,
			ColorChannel.BLUE, ColorChannel.ALPHA
		);
		expect(effect.defines.get("TEXEL")).toBe("texel");
	});

	test("fragment shader contains map sampler", () => {
		const effect = new TextureEffect();
		expect(effect.fragmentShader).toContain("map");
		expect(effect.fragmentShader).toContain("TEXEL");
	});

	test("has map and scale uniforms", () => {
		const effect = new TextureEffect();
		expect(effect.uniforms.has("map")).toBe(true);
		expect(effect.uniforms.has("scale")).toBe(true);
	});

	test("uvTransform property reflects texture state", () => {
		const effect = new TextureEffect();
		const tex = new Texture();
		tex.matrixAutoUpdate = true;
		effect.texture = tex;
		expect(effect.uvTransform).toBe(true);
	});
});
