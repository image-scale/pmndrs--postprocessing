import { jest } from "@jest/globals";
import { CallbackPass } from "../../src/passes/CallbackPass.js";

describe("CallbackPass", () => {
	test("can be instantiated", () => {
		const pass = new CallbackPass(() => {});
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("CallbackPass");
	});

	test("needsSwap is false", () => {
		const pass = new CallbackPass(() => {});
		expect(pass.needsSwap).toBe(false);
	});

	test("executes callback on render", () => {
		const fn = jest.fn();
		const pass = new CallbackPass(fn);
		pass.render(null, null, null, 0, false);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("handles null callback without throwing", () => {
		const pass = new CallbackPass(null);
		expect(() => pass.render(null, null, null, 0, false)).not.toThrow();
	});

	test("dispose does not throw", () => {
		const pass = new CallbackPass(() => {});
		expect(() => pass.dispose()).not.toThrow();
	});
});
