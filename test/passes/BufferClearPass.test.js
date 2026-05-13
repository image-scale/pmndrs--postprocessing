import { jest } from "@jest/globals";
import { BufferClearPass } from "../../src/passes/BufferClearPass.js";

describe("BufferClearPass", () => {
	test("can be instantiated", () => {
		const pass = new BufferClearPass();
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("BufferClearPass");
	});

	test("needsSwap is false", () => {
		const pass = new BufferClearPass();
		expect(pass.needsSwap).toBe(false);
	});

	test("defaults to clearing color and depth but not stencil", () => {
		const pass = new BufferClearPass();
		expect(pass.color).toBe(true);
		expect(pass.depth).toBe(true);
		expect(pass.stencil).toBe(false);
	});

	test("can customize clear flags via constructor", () => {
		const pass = new BufferClearPass(false, false, true);
		expect(pass.color).toBe(false);
		expect(pass.depth).toBe(false);
		expect(pass.stencil).toBe(true);
	});

	test("setClearFlags updates all flags", () => {
		const pass = new BufferClearPass();
		pass.setClearFlags(false, true, true);
		expect(pass.color).toBe(false);
		expect(pass.depth).toBe(true);
		expect(pass.stencil).toBe(true);
	});

	test("overrideClearColor defaults to null", () => {
		const pass = new BufferClearPass();
		expect(pass.overrideClearColor).toBeNull();
	});

	test("overrideClearAlpha defaults to -1", () => {
		const pass = new BufferClearPass();
		expect(pass.overrideClearAlpha).toBe(-1);
	});

	test("dispose does not throw", () => {
		const pass = new BufferClearPass();
		expect(() => pass.dispose()).not.toThrow();
	});
});
