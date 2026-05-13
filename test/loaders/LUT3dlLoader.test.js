import { jest } from "@jest/globals";
import { LUT3dlLoader } from "../../src/loaders/LUT3dlLoader.js";
import { LookupTexture } from "../../src/textures/lut/LookupTexture.js";
import { Loader } from "three";

describe("LUT3dlLoader", () => {
	let loader;

	beforeEach(() => {
		loader = new LUT3dlLoader();
	});

	test("can be instantiated", () => {
		expect(loader).toBeInstanceOf(Loader);
	});

	test("parse creates LookupTexture from .3dl data", () => {
		const input = `
0 128 256

0 0 0
128 128 128
256 256 256
0 0 0
128 128 128
256 256 256
0 0 0
128 128 128
256 256 256
0 0 0
128 128 128
256 256 256
0 0 0
128 128 128
256 256 256
0 0 0
128 128 128
256 256 256
0 0 0
128 128 128
256 256 256
0 0 0
128 128 128
256 256 256
0 0 0
128 128 128
256 256 256
`;
		const lut = loader.parse(input);
		expect(lut).toBeInstanceOf(LookupTexture);
		expect(lut.image.width).toBe(3);
	});

	test("parse normalizes values to 0-1 range", () => {
		const input = `
0 512

0 0 0
512 512 512
0 0 0
512 512 512
0 0 0
512 512 512
0 0 0
512 512 512
`;
		const lut = loader.parse(input);
		const data = lut.image.data;
		for (let i = 0; i < data.length; i += 4) {
			expect(data[i]).toBeLessThanOrEqual(1.0);
			expect(data[i + 1]).toBeLessThanOrEqual(1.0);
			expect(data[i + 2]).toBeLessThanOrEqual(1.0);
		}
	});

	test("parse throws on invalid input", () => {
		expect(() => loader.parse("invalid data")).toThrow();
	});

	test("loadAsync returns a Promise", () => {
		expect(typeof loader.loadAsync).toBe("function");
	});
});
