import { jest } from "@jest/globals";
import { Resolution } from "../../src/core/Resolution.js";

describe("Resolution", () => {
	test("can be instantiated with null", () => {
		expect(new Resolution(null)).toBeTruthy();
	});

	test("AUTO_SIZE is -1", () => {
		expect(Resolution.AUTO_SIZE).toBe(-1);
	});

	test("default scale is 1.0", () => {
		const r = new Resolution(null);
		expect(r.scale).toBe(1.0);
	});

	test("uses scale when both dimensions are AUTO_SIZE", () => {
		const r = new Resolution({ setSize() {} });
		r.setBaseSize(1920, 1080);
		r.setScale(0.5);
		expect(r.getWidth()).toBe(Math.round(1920 * 0.5));
		expect(r.getHeight()).toBe(Math.round(1080 * 0.5));
	});

	test("uses preferred sizes directly when both are set", () => {
		const r = new Resolution({ setSize() {} });
		r.setBaseSize(1920, 1080);
		r.setPreferredSize(512, 256);
		expect(r.getWidth()).toBe(512);
		expect(r.getHeight()).toBe(256);
	});

	test("computes width from aspect ratio when only height is preferred", () => {
		const r = new Resolution({ setSize() {} });
		const aspect = 1920 / 1080;
		r.setBaseSize(1920, 1080);
		r.setPreferredSize(Resolution.AUTO_SIZE, 480);
		expect(r.getWidth()).toBe(Math.round(480 * aspect));
	});

	test("computes height from aspect ratio when only width is preferred", () => {
		const r = new Resolution({ setSize() {} });
		const aspect = 1920 / 1080;
		r.setBaseSize(1920, 1080);
		r.setPreferredSize(720, Resolution.AUTO_SIZE);
		expect(r.getHeight()).toBe(Math.round(720 / aspect));
	});

	test("dispatches change event when base size changes", () => {
		const r = new Resolution({ setSize() {} });
		const handler = jest.fn();
		r.addEventListener("change", handler);
		r.setBaseSize(1920, 1080);
		expect(handler).toHaveBeenCalled();
	});

	test("dispatches change event when preferred size changes", () => {
		const r = new Resolution({ setSize() {} });
		const handler = jest.fn();
		r.addEventListener("change", handler);
		r.preferredWidth = 512;
		expect(handler).toHaveBeenCalled();
	});

	test("dispatches change event when scale changes", () => {
		const r = new Resolution({ setSize() {} });
		const handler = jest.fn();
		r.addEventListener("change", handler);
		r.scale = 0.5;
		expect(handler).toHaveBeenCalled();
	});

	test("calls resizable.setSize on change", () => {
		const resizable = { setSize: jest.fn() };
		const r = new Resolution(resizable);
		r.setBaseSize(800, 600);
		expect(resizable.setSize).toHaveBeenCalled();
	});

	test("does not dispatch change when setting same base size", () => {
		const r = new Resolution({ setSize() {} });
		r.setBaseSize(100, 100);
		const handler = jest.fn();
		r.addEventListener("change", handler);
		r.setBaseSize(100, 100);
		expect(handler).not.toHaveBeenCalled();
	});

	test("baseWidth and baseHeight getters work", () => {
		const r = new Resolution(null);
		r.setBaseSize(1920, 1080);
		expect(r.getBaseWidth()).toBe(1920);
		expect(r.getBaseHeight()).toBe(1080);
	});

	test("copy copies all fields from another resolution", () => {
		const r1 = new Resolution(null);
		r1.setBaseSize(1920, 1080);
		r1.setPreferredSize(512, 256);

		const r2 = new Resolution(null);
		r2.copy(r1);
		expect(r2.getWidth()).toBe(512);
		expect(r2.getHeight()).toBe(256);
	});
});
