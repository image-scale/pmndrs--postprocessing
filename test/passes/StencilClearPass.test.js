import { jest } from "@jest/globals";
import { StencilClearPass } from "../../src/passes/StencilClearPass.js";

describe("StencilClearPass", () => {
	test("can be instantiated", () => {
		const pass = new StencilClearPass();
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("StencilClearPass");
	});

	test("needsSwap is false", () => {
		const pass = new StencilClearPass();
		expect(pass.needsSwap).toBe(false);
	});

	test("dispose does not throw", () => {
		const pass = new StencilClearPass();
		expect(() => pass.dispose()).not.toThrow();
	});
});
