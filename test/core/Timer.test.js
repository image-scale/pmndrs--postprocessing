import { jest } from "@jest/globals";
import { Timer } from "../../src/core/Timer.js";

describe("Timer", () => {
	test("can be instantiated", () => {
		const timer = new Timer();
		expect(timer).toBeTruthy();
	});

	test("initial delta and elapsed are zero", () => {
		const timer = new Timer();
		expect(timer.delta).toBe(0);
		expect(timer.elapsed).toBe(0);
		expect(timer.getDelta()).toBe(0);
		expect(timer.getElapsed()).toBe(0);
	});

	test("timescale defaults to 1.0", () => {
		const timer = new Timer();
		expect(timer.timescale).toBe(1.0);
	});

	test("useFixedDelta defaults to false", () => {
		const timer = new Timer();
		expect(timer.useFixedDelta).toBe(false);
	});

	test("fixedDelta defaults to 1/60 seconds", () => {
		const timer = new Timer();
		expect(timer.fixedDelta).toBeCloseTo(1 / 60, 5);
	});

	test("fixedDelta can be set in seconds", () => {
		const timer = new Timer();
		timer.fixedDelta = 0.05;
		expect(timer.fixedDelta).toBeCloseTo(0.05, 5);
	});

	test("update with fixed delta produces consistent timing", () => {
		const timer = new Timer();
		timer.useFixedDelta = true;
		timer.update();
		expect(timer.delta).toBeCloseTo(1 / 60, 5);
		timer.update();
		expect(timer.elapsed).toBeCloseTo(2 / 60, 4);
	});

	test("timescale multiplies delta", () => {
		const timer = new Timer();
		timer.useFixedDelta = true;
		timer.timescale = 2.0;
		timer.update();
		expect(timer.delta).toBeCloseTo(2 / 60, 5);
	});

	test("reset zeroes delta and elapsed", () => {
		const timer = new Timer();
		timer.useFixedDelta = true;
		timer.update();
		timer.update();
		timer.reset();
		expect(timer.delta).toBe(0);
		expect(timer.elapsed).toBe(0);
	});

	test("autoReset defaults to false", () => {
		const timer = new Timer();
		expect(timer.autoReset).toBe(false);
	});

	test("dispose sets autoReset to false", () => {
		const timer = new Timer();
		timer.autoReset = true;
		timer.dispose();
		expect(timer.autoReset).toBe(false);
	});

	test("update with explicit timestamp uses provided value", () => {
		const timer = new Timer();
		timer.update(1000);
		timer.update(1016.67);
		expect(timer.delta).toBeCloseTo(0.01667, 3);
	});
});
