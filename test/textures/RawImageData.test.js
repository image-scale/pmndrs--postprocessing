import { jest } from "@jest/globals";
import { RawImageData } from "../../src/textures/RawImageData.js";

describe("RawImageData", () => {
	test("can be instantiated with defaults", () => {
		const img = new RawImageData();
		expect(img.width).toBe(0);
		expect(img.height).toBe(0);
		expect(img.data).toBeNull();
	});

	test("can be instantiated with dimensions and data", () => {
		const data = new Uint8ClampedArray(16);
		const img = new RawImageData(2, 2, data);
		expect(img.width).toBe(2);
		expect(img.height).toBe(2);
		expect(img.data).toBe(data);
	});

	test("toCanvas returns null in non-browser environment", () => {
		const img = new RawImageData(2, 2, new Uint8ClampedArray(16));
		expect(img.toCanvas()).toBeNull();
	});

	test("static from extracts data from ImageData-like objects", () => {
		const data = new Uint8ClampedArray(16);
		const result = RawImageData.from({ width: 2, height: 2, data });
		expect(result).toBeInstanceOf(RawImageData);
		expect(result.width).toBe(2);
		expect(result.height).toBe(2);
		expect(result.data).toBe(data);
	});
});
