import { jest } from "@jest/globals";
import { LookupTexture } from "../../src/textures/lut/LookupTexture.js";
import { Data3DTexture, FloatType, UnsignedByteType, LinearFilter, ClampToEdgeWrapping, LinearSRGBColorSpace } from "three";

describe("LookupTexture", () => {
	test("can be instantiated", () => {
		const data = new Float32Array(4 * 4 * 4 * 4);
		const lut = new LookupTexture(data, 4);
		expect(lut).toBeInstanceOf(Data3DTexture);
	});

	test("has correct size", () => {
		const data = new Float32Array(8 * 8 * 8 * 4);
		const lut = new LookupTexture(data, 8);
		expect(lut.image.width).toBe(8);
		expect(lut.image.height).toBe(8);
		expect(lut.image.depth).toBe(8);
	});

	test("default type is FloatType", () => {
		const data = new Float32Array(4 * 4 * 4 * 4);
		const lut = new LookupTexture(data, 4);
		expect(lut.type).toBe(FloatType);
	});

	test("uses LinearFilter", () => {
		const data = new Float32Array(4 * 4 * 4 * 4);
		const lut = new LookupTexture(data, 4);
		expect(lut.minFilter).toBe(LinearFilter);
		expect(lut.magFilter).toBe(LinearFilter);
	});

	test("uses ClampToEdgeWrapping", () => {
		const data = new Float32Array(4 * 4 * 4 * 4);
		const lut = new LookupTexture(data, 4);
		expect(lut.wrapS).toBe(ClampToEdgeWrapping);
		expect(lut.wrapT).toBe(ClampToEdgeWrapping);
		expect(lut.wrapR).toBe(ClampToEdgeWrapping);
	});

	test("has domain min/max vectors", () => {
		const data = new Float32Array(4 * 4 * 4 * 4);
		const lut = new LookupTexture(data, 4);
		expect(lut.domainMin.x).toBe(0);
		expect(lut.domainMax.x).toBe(1);
	});

	test("createNeutral generates identity LUT", () => {
		const lut = LookupTexture.createNeutral(4);
		expect(lut.name).toBe("neutral");
		expect(lut.image.width).toBe(4);

		const data = lut.image.data;
		expect(data[0]).toBeCloseTo(0);
		expect(data[1]).toBeCloseTo(0);
		expect(data[2]).toBeCloseTo(0);
		expect(data[3]).toBe(1.0);

		const last = (3 + 3 * 4 + 3 * 16) * 4;
		expect(data[last]).toBeCloseTo(1);
		expect(data[last + 1]).toBeCloseTo(1);
		expect(data[last + 2]).toBeCloseTo(1);
	});

	test("convertToUint8 converts float data", () => {
		const lut = LookupTexture.createNeutral(2);
		expect(lut.type).toBe(FloatType);
		lut.convertToUint8();
		expect(lut.type).toBe(UnsignedByteType);
		expect(lut.image.data).toBeInstanceOf(Uint8Array);
	});

	test("convertToFloat converts uint8 data", () => {
		const lut = LookupTexture.createNeutral(2);
		lut.convertToUint8();
		lut.convertToFloat();
		expect(lut.type).toBe(FloatType);
		expect(lut.image.data).toBeInstanceOf(Float32Array);
	});

	test("convertLinearToSRGB changes colorSpace", () => {
		const lut = LookupTexture.createNeutral(2);
		lut.convertLinearToSRGB();
		expect(lut.colorSpace).toBe("srgb");
	});

	test("convertSRGBToLinear changes colorSpace", () => {
		const lut = LookupTexture.createNeutral(2);
		lut.convertLinearToSRGB();
		lut.convertSRGBToLinear();
		expect(lut.colorSpace).toBe(LinearSRGBColorSpace);
	});
});
