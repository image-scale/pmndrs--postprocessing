import { jest } from "@jest/globals";
import { LUTCubeLoader } from "../../src/loaders/LUTCubeLoader.js";
import { LookupTexture } from "../../src/textures/lut/LookupTexture.js";
import { Loader } from "three";

describe("LUTCubeLoader", () => {
	let loader;

	beforeEach(() => {
		loader = new LUTCubeLoader();
	});

	test("can be instantiated", () => {
		expect(loader).toBeInstanceOf(Loader);
	});

	test("parse creates LookupTexture from .cube data", () => {
		const input = `
TITLE "Test LUT"
LUT_3D_SIZE 2

0.0 0.0 0.0
1.0 0.0 0.0
0.0 1.0 0.0
1.0 1.0 0.0
0.0 0.0 1.0
1.0 0.0 1.0
0.0 1.0 1.0
1.0 1.0 1.0
`;
		const lut = loader.parse(input);
		expect(lut).toBeInstanceOf(LookupTexture);
		expect(lut.image.width).toBe(2);
		expect(lut.name).toBe("Test LUT");
	});

	test("parse handles DOMAIN_MIN and DOMAIN_MAX", () => {
		const input = `
LUT_3D_SIZE 2
DOMAIN_MIN 0.1 0.2 0.3
DOMAIN_MAX 0.9 0.8 0.7

0.0 0.0 0.0
1.0 0.0 0.0
0.0 1.0 0.0
1.0 1.0 0.0
0.0 0.0 1.0
1.0 0.0 1.0
0.0 1.0 1.0
1.0 1.0 1.0
`;
		const lut = loader.parse(input);
		expect(lut.domainMin.x).toBeCloseTo(0.1);
		expect(lut.domainMin.y).toBeCloseTo(0.2);
		expect(lut.domainMax.z).toBeCloseTo(0.7);
	});

	test("parse stores data with alpha = 1.0", () => {
		const input = `
LUT_3D_SIZE 2

0.0 0.0 0.0
1.0 0.0 0.0
0.0 1.0 0.0
1.0 1.0 0.0
0.0 0.0 1.0
1.0 0.0 1.0
0.0 1.0 1.0
1.0 1.0 1.0
`;
		const lut = loader.parse(input);
		const data = lut.image.data;
		for (let i = 3; i < data.length; i += 4) {
			expect(data[i]).toBe(1.0);
		}
	});

	test("parse throws on missing size", () => {
		expect(() => loader.parse("no size here")).toThrow();
	});

	test("loadAsync returns a Promise", () => {
		expect(typeof loader.loadAsync).toBe("function");
	});
});
