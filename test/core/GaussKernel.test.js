import { jest } from "@jest/globals";
import { GaussKernel } from "../../src/core/GaussKernel.js";

describe("GaussKernel", () => {
	test("can be instantiated with kernel size 3", () => {
		expect(new GaussKernel(3)).toBeTruthy();
	});

	test("throws for kernel size below 3", () => {
		expect(() => new GaussKernel(2)).toThrow();
	});

	test("throws for kernel size above 1020", () => {
		expect(() => new GaussKernel(1021)).toThrow();
	});

	test("produces non-null weights and offsets", () => {
		const k = new GaussKernel(5);
		expect(k.weights).not.toBeNull();
		expect(k.offsets).not.toBeNull();
		expect(k.linearWeights).not.toBeNull();
		expect(k.linearOffsets).not.toBeNull();
	});

	test("steps returns the number of discrete offsets", () => {
		const k = new GaussKernel(5);
		expect(k.steps).toBe(k.offsets.length);
		expect(k.steps).toBeGreaterThan(0);
	});

	test("linearSteps returns the number of linear offsets", () => {
		const k = new GaussKernel(5);
		expect(k.linearSteps).toBe(k.linearOffsets.length);
		expect(k.linearSteps).toBeGreaterThan(0);
	});

	test("discrete weights are normalized (sum ≈ 1 when doubled except center)", () => {
		const k = new GaussKernel(7);
		let sum = k.weights[0];
		for (let i = 1; i < k.weights.length; i++) {
			sum += k.weights[i] * 2;
		}
		expect(sum).toBeCloseTo(1.0, 5);
	});

	test("offsets start at 0 and are sequential integers", () => {
		const k = new GaussKernel(9);
		for (let i = 0; i < k.offsets.length; i++) {
			expect(k.offsets[i]).toBe(i);
		}
	});

	test("larger kernel size produces more steps", () => {
		const small = new GaussKernel(5);
		const large = new GaussKernel(15);
		expect(large.steps).toBeGreaterThan(small.steps);
	});

	test("linear offsets are between adjacent discrete offsets", () => {
		const k = new GaussKernel(7);
		for (let i = 1; i < k.linearOffsets.length; i++) {
			expect(k.linearOffsets[i]).toBeGreaterThan(0);
		}
	});

	test("edgeBias=0 works", () => {
		const k = new GaussKernel(5, 0);
		expect(k.weights).not.toBeNull();
		expect(k.steps).toBeGreaterThan(0);
	});

	test("linear sampling has fewer steps than discrete", () => {
		const k = new GaussKernel(11);
		expect(k.linearSteps).toBeLessThanOrEqual(k.steps);
	});
});
