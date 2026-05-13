import { jest } from "@jest/globals";
import { ASCIIEffect } from "../../src/effects/ASCIIEffect.js";

describe("ASCIIEffect", () => {
	test("can be instantiated", () => {
		const effect = new ASCIIEffect();
		expect(effect.name).toBe("ASCIIEffect");
	});

	test("default cellSize is 16", () => {
		const effect = new ASCIIEffect();
		expect(effect.cellSize).toBe(16);
	});

	test("cellSize getter/setter works", () => {
		const effect = new ASCIIEffect({ cellSize: 8 });
		expect(effect.cellSize).toBe(8);
		effect.cellSize = 32;
		expect(effect.cellSize).toBe(32);
	});

	test("inverted defaults to false", () => {
		const effect = new ASCIIEffect();
		expect(effect.inverted).toBe(false);
	});

	test("inverted setter adds/removes define", () => {
		const effect = new ASCIIEffect();
		effect.inverted = true;
		expect(effect.defines.has("INVERTED")).toBe(true);
		effect.inverted = false;
		expect(effect.defines.has("INVERTED")).toBe(false);
	});

	test("color defaults to null (no USE_COLOR)", () => {
		const effect = new ASCIIEffect();
		expect(effect.defines.has("USE_COLOR")).toBe(false);
	});

	test("setting color enables USE_COLOR define", () => {
		const effect = new ASCIIEffect();
		effect.color = 0x00ff00;
		expect(effect.defines.has("USE_COLOR")).toBe(true);
	});

	test("setting color to null disables USE_COLOR", () => {
		const effect = new ASCIIEffect();
		effect.color = 0xff0000;
		expect(effect.defines.has("USE_COLOR")).toBe(true);
		effect.color = null;
		expect(effect.defines.has("USE_COLOR")).toBe(false);
	});

	test("setSize updates cell count", () => {
		const effect = new ASCIIEffect({ cellSize: 16 });
		effect.setSize(320, 240);
		const cellCount = effect.uniforms.get("cellCount").value;
		expect(cellCount.x).toBe(20);
		expect(cellCount.y).toBe(15);
	});

	test("has character count defines", () => {
		const effect = new ASCIIEffect();
		expect(effect.defines.has("CHAR_COUNT_MINUS_ONE")).toBe(true);
		expect(effect.defines.has("TEX_CELL_COUNT")).toBe(true);
		expect(effect.defines.has("INV_TEX_CELL_COUNT")).toBe(true);
	});

	test("fragment shader contains ASCII rendering logic", () => {
		const effect = new ASCIIEffect();
		expect(effect.fragmentShader).toContain("asciiTexture");
		expect(effect.fragmentShader).toContain("characterIndex");
	});
});
