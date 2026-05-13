import { jest } from "@jest/globals";
import { EffectComposer } from "../../src/core/EffectComposer.js";
import { Pass } from "../../src/passes/Pass.js";

class DummyPass extends Pass {
	constructor(name = "DummyPass") {
		super(name);
		this.renderCalled = false;
		this.lastDelta = 0;
	}
	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		this.renderCalled = true;
		this.lastDelta = deltaTime;
	}
}

describe("EffectComposer", () => {
	test("can be instantiated without a renderer", () => {
		const composer = new EffectComposer();
		expect(composer).toBeTruthy();
		expect(composer.renderer).toBeNull();
	});

	test("can be instantiated and disposed", () => {
		const composer = new EffectComposer();
		expect(() => composer.dispose()).not.toThrow();
	});

	test("creates input and output buffers", () => {
		const composer = new EffectComposer();
		expect(composer.inputBuffer).toBeTruthy();
		expect(composer.outputBuffer).toBeTruthy();
		expect(composer.inputBuffer).not.toBe(composer.outputBuffer);
		composer.dispose();
	});

	test("passes list starts empty", () => {
		const composer = new EffectComposer();
		expect(composer.passes).toHaveLength(0);
		composer.dispose();
	});

	test("addPass inserts a pass", () => {
		const composer = new EffectComposer();
		const pass = new DummyPass();
		composer.addPass(pass);
		expect(composer.passes).toHaveLength(1);
		expect(composer.passes[0]).toBe(pass);
		composer.dispose();
	});

	test("addPass at specific index", () => {
		const composer = new EffectComposer();
		const passA = new DummyPass("A");
		const passB = new DummyPass("B");
		const passC = new DummyPass("C");
		composer.addPass(passA);
		composer.addPass(passC);
		composer.addPass(passB, 1);
		expect(composer.passes[0].name).toBe("A");
		expect(composer.passes[1].name).toBe("B");
		expect(composer.passes[2].name).toBe("C");
		composer.dispose();
	});

	test("removePass removes a pass", () => {
		const composer = new EffectComposer();
		const pass = new DummyPass();
		composer.addPass(pass);
		composer.removePass(pass);
		expect(composer.passes).toHaveLength(0);
		composer.dispose();
	});

	test("removeAllPasses clears all passes", () => {
		const composer = new EffectComposer();
		composer.addPass(new DummyPass());
		composer.addPass(new DummyPass());
		composer.removeAllPasses();
		expect(composer.passes).toHaveLength(0);
		composer.dispose();
	});

	test("autoRenderToScreen sets last enabled pass to render to screen", () => {
		const composer = new EffectComposer();
		const passA = new DummyPass("A");
		const passB = new DummyPass("B");
		composer.addPass(passA);
		composer.addPass(passB);
		expect(passA.renderToScreen).toBe(false);
		expect(passB.renderToScreen).toBe(true);
		composer.dispose();
	});

	test("render calls each enabled pass", () => {
		const composer = new EffectComposer();
		const passA = new DummyPass("A");
		const passB = new DummyPass("B");
		passB.enabled = false;
		composer.addPass(passA);
		composer.addPass(passB);
		composer.render(0.016);
		expect(passA.renderCalled).toBe(true);
		expect(passB.renderCalled).toBe(false);
		composer.dispose();
	});

	test("render swaps buffers when pass needs swap", () => {
		const composer = new EffectComposer();
		const pass = new DummyPass();
		pass.needsSwap = true;
		composer.addPass(pass);
		const originalInput = composer.inputBuffer;
		const originalOutput = composer.outputBuffer;
		composer.render(0.016);
		expect(composer.inputBuffer).toBe(originalOutput);
		expect(composer.outputBuffer).toBe(originalInput);
		composer.dispose();
	});

	test("render does not swap buffers when needsSwap is false", () => {
		const composer = new EffectComposer();
		const pass = new DummyPass();
		pass.needsSwap = false;
		composer.addPass(pass);
		const originalInput = composer.inputBuffer;
		composer.render(0.016);
		expect(composer.inputBuffer).toBe(originalInput);
		composer.dispose();
	});

	test("setSize resizes buffers", () => {
		const composer = new EffectComposer();
		composer.setSize(800, 600);
		expect(composer.inputBuffer.width).toBe(800);
		expect(composer.inputBuffer.height).toBe(600);
		expect(composer.outputBuffer.width).toBe(800);
		expect(composer.outputBuffer.height).toBe(600);
		composer.dispose();
	});

	test("has a timer", () => {
		const composer = new EffectComposer();
		expect(composer.getTimer()).toBeTruthy();
		composer.dispose();
	});

	test("multisampling getter returns 0 by default", () => {
		const composer = new EffectComposer();
		expect(composer.multisampling).toBe(0);
		composer.dispose();
	});

	test("constructor options for depthBuffer and stencilBuffer", () => {
		const composer = new EffectComposer(null, {
			depthBuffer: false,
			stencilBuffer: true
		});
		expect(composer).toBeTruthy();
		composer.dispose();
	});
});
