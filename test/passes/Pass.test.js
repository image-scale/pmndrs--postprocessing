import { jest } from "@jest/globals";
import { Pass } from "../../src/passes/Pass.js";
import { MeshBasicMaterial } from "three";

describe("Pass", () => {
	test("can be instantiated with defaults", () => {
		const pass = new Pass();
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("Pass");
		expect(pass.enabled).toBe(true);
		expect(pass.needsSwap).toBe(true);
		expect(pass.needsDepthBlit).toBe(false);
		expect(pass.needsDepthTexture).toBe(false);
	});

	test("can be instantiated with a custom name", () => {
		const pass = new Pass("CustomPass");
		expect(pass.name).toBe("CustomPass");
	});

	test("renderToScreen is inverse of rtt", () => {
		const pass = new Pass();
		expect(pass.rtt).toBe(true);
		expect(pass.renderToScreen).toBe(false);
		pass.renderToScreen = true;
		expect(pass.rtt).toBe(false);
		expect(pass.renderToScreen).toBe(true);
	});

	test("has a static fullscreen triangle geometry", () => {
		const geometry = Pass.fullscreenGeometry;
		expect(geometry).toBeTruthy();
		expect(geometry.getAttribute("position")).toBeTruthy();
		expect(geometry.getAttribute("uv")).toBeTruthy();
		const posArray = geometry.getAttribute("position").array;
		expect(posArray.length).toBe(9);
	});

	test("fullscreen geometry has 3 vertices forming a large triangle", () => {
		const geo = Pass.fullscreenGeometry;
		const pos = geo.getAttribute("position").array;
		expect(pos[0]).toBe(-1);
		expect(pos[1]).toBe(-1);
		expect(pos[3]).toBe(3);
		expect(pos[4]).toBe(-1);
		expect(pos[6]).toBe(-1);
		expect(pos[7]).toBe(3);
	});

	test("fullscreenMaterial is null by default", () => {
		const pass = new Pass();
		expect(pass.fullscreenMaterial).toBeNull();
	});

	test("setting fullscreenMaterial creates a screen mesh", () => {
		const pass = new Pass();
		const material = new MeshBasicMaterial();
		pass.fullscreenMaterial = material;
		expect(pass.fullscreenMaterial).toBe(material);
	});

	test("render throws by default", () => {
		const pass = new Pass();
		expect(() => pass.render(null, null, null, 0, false)).toThrow();
	});

	test("setSize, initialize, setDepthTexture are no-ops", () => {
		const pass = new Pass();
		expect(() => pass.setSize(100, 100)).not.toThrow();
		expect(() => pass.initialize(null, false, undefined)).not.toThrow();
		expect(() => pass.setDepthTexture(null)).not.toThrow();
	});

	test("getDepthTexture returns null", () => {
		const pass = new Pass();
		expect(pass.getDepthTexture()).toBeNull();
	});

	test("dispose does not throw", () => {
		const pass = new Pass();
		expect(() => pass.dispose()).not.toThrow();
	});
});
