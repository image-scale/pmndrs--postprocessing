import { jest } from "@jest/globals";
import { NoiseTexture } from "../../src/textures/NoiseTexture.js";
import { DataTexture, RedFormat, RGFormat, RGBAFormat, UnsignedByteType, FloatType } from "three";

describe("NoiseTexture", () => {
	test("can be instantiated", () => {
		const tex = new NoiseTexture(64, 64);
		expect(tex).toBeInstanceOf(DataTexture);
	});

	test("has correct dimensions", () => {
		const tex = new NoiseTexture(32, 16);
		expect(tex.image.width).toBe(32);
		expect(tex.image.height).toBe(16);
	});

	test("default format is RedFormat (1 channel)", () => {
		const tex = new NoiseTexture(4, 4);
		expect(tex.format).toBe(RedFormat);
		expect(tex.image.data.length).toBe(16);
	});

	test("RGFormat creates 2-channel data", () => {
		const tex = new NoiseTexture(4, 4, RGFormat);
		expect(tex.image.data.length).toBe(32);
	});

	test("RGBAFormat creates 4-channel data", () => {
		const tex = new NoiseTexture(4, 4, RGBAFormat);
		expect(tex.image.data.length).toBe(64);
	});

	test("UnsignedByteType creates Uint8Array", () => {
		const tex = new NoiseTexture(4, 4, RedFormat, UnsignedByteType);
		expect(tex.image.data).toBeInstanceOf(Uint8Array);
	});

	test("FloatType creates Float32Array", () => {
		const tex = new NoiseTexture(4, 4, RedFormat, FloatType);
		expect(tex.image.data).toBeInstanceOf(Float32Array);
	});

	test("data contains values in expected ranges", () => {
		const tex = new NoiseTexture(8, 8, RedFormat, UnsignedByteType);
		const data = tex.image.data;
		let hasNonZero = false;
		for (let i = 0; i < data.length; i++) {
			if (data[i] > 0) hasNonZero = true;
			expect(data[i]).toBeLessThanOrEqual(255);
		}
		expect(hasNonZero).toBe(true);
	});

	test("float data contains values between 0 and 1", () => {
		const tex = new NoiseTexture(8, 8, RedFormat, FloatType);
		const data = tex.image.data;
		for (let i = 0; i < data.length; i++) {
			expect(data[i]).toBeGreaterThanOrEqual(0);
			expect(data[i]).toBeLessThanOrEqual(1);
		}
	});
});
