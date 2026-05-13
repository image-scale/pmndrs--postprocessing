import { jest } from "@jest/globals";
import { EffectPass } from "../../src/passes/EffectPass.js";
import { Effect } from "../../src/effects/Effect.js";
import { CompoundMaterial } from "../../src/materials/CompoundMaterial.js";
import { BlendFunction, EffectAttribute } from "../../src/enums/index.js";
import { PerspectiveCamera, Uniform } from "three";

function makeEffect(name, fragmentShader, options = {}) {
	return new Effect(name, fragmentShader, options);
}

const simpleFragment = `
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = inputColor;
}
`;

const depthFragment = `
void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
	outputColor = vec4(vec3(depth), 1.0);
}
`;

const uvFragment = `
void mainUv(inout vec2 uv) {
	uv *= 2.0;
}
`;

const uniformFragment = `
uniform float intensity;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = inputColor * intensity;
}
`;

describe("EffectPass", () => {
	let camera;

	beforeEach(() => {
		camera = new PerspectiveCamera(75, 1, 0.1, 1000);
	});

	test("can be instantiated with camera and no effects", () => {
		const pass = new EffectPass(camera);
		expect(pass).toBeTruthy();
		expect(pass.name).toBe("EffectPass");
	});

	test("has a CompoundMaterial as fullscreen material", () => {
		const pass = new EffectPass(camera);
		expect(pass.fullscreenMaterial).toBeInstanceOf(CompoundMaterial);
	});

	test("copies camera settings to material", () => {
		const pass = new EffectPass(camera);
		expect(pass.fullscreenMaterial.uniforms.cameraNear.value).toBe(0.1);
		expect(pass.fullscreenMaterial.uniforms.cameraFar.value).toBe(1000);
		expect(pass.fullscreenMaterial.defines.PERSPECTIVE_CAMERA).toBe("1");
	});

	test("can be instantiated with effects", () => {
		const effect = makeEffect("Test", simpleFragment);
		const pass = new EffectPass(camera, effect);
		expect(pass.effects).toContain(effect);
		expect(pass.effects.length).toBe(1);
	});

	test("sorts effects by attributes descending", () => {
		const plain = makeEffect("Plain", simpleFragment);
		const depth = makeEffect("Depth", depthFragment, { attributes: EffectAttribute.DEPTH });
		const pass = new EffectPass(camera, plain, depth);
		expect(pass.effects[0]).toBe(depth);
		expect(pass.effects[1]).toBe(plain);
	});

	test("updateMaterial builds compound shader with effect code", () => {
		const effect = makeEffect("Test", simpleFragment);
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.fullscreenMaterial.fragmentShader).toContain("e0MainImage");
	});

	test("updateMaterial prefixes uniforms from effects", () => {
		const effect = makeEffect("Test", uniformFragment, {
			uniforms: new Map([["intensity", new Uniform(1.0)]])
		});
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.fullscreenMaterial.uniforms.e0Intensity).toBeTruthy();
		expect(pass.fullscreenMaterial.uniforms.e0Intensity.value).toBe(1.0);
	});

	test("updateMaterial prefixes defines from effects", () => {
		const effect = makeEffect("Test", simpleFragment, {
			defines: new Map([["MY_FLAG", "1"]])
		});
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.fullscreenMaterial.defines.e0MY_FLAG).toBe("1");
	});

	test("multiple effects get distinct prefixes", () => {
		const e1 = makeEffect("A", simpleFragment);
		const e2 = makeEffect("B", simpleFragment);
		const pass = new EffectPass(camera, e1, e2);
		pass.updateMaterial();
		const frag = pass.fullscreenMaterial.fragmentShader;
		expect(frag).toContain("e0MainImage");
		expect(frag).toContain("e1MainImage");
	});

	test("DST blend effects are skipped in shader but still in effects list", () => {
		const effect = makeEffect("Skipped", simpleFragment, {
			blendFunction: BlendFunction.DST
		});
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.skipRendering).toBe(true);
		expect(pass.effects).toContain(effect);
	});

	test("needsSwap is false when skipRendering is true", () => {
		const effect = makeEffect("Skipped", simpleFragment, {
			blendFunction: BlendFunction.DST
		});
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.needsSwap).toBe(false);
	});

	test("needsSwap is true when there are active effects", () => {
		const effect = makeEffect("Active", simpleFragment);
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.needsSwap).toBe(true);
	});

	test("UV transform effects add transformedUv variable", () => {
		const effect = makeEffect("UV", uvFragment);
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		const frag = pass.fullscreenMaterial.fragmentShader;
		expect(frag).toContain("transformedUv");
		expect(pass.fullscreenMaterial.defines.UV).toBe("transformedUv");
	});

	test("non-UV effects use vUv as UV define", () => {
		const effect = makeEffect("Test", simpleFragment);
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.fullscreenMaterial.defines.UV).toBe("vUv");
	});

	test("depth effects with depth parameter set readDepth", () => {
		const effect = makeEffect("DepthTest", depthFragment, {
			attributes: EffectAttribute.DEPTH
		});
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		const frag = pass.fullscreenMaterial.fragmentShader;
		expect(frag).toContain("float depth = readDepth(UV)");
	});

	test("needsDepthTexture is set when depth effects are present", () => {
		const effect = makeEffect("DepthTest", depthFragment, {
			attributes: EffectAttribute.DEPTH
		});
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.needsDepthTexture).toBe(true);
	});

	test("blend function shader code is included and renamed", () => {
		const effect = makeEffect("Test", simpleFragment, {
			blendFunction: BlendFunction.ADD
		});
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		const frag = pass.fullscreenMaterial.fragmentShader;
		expect(frag).toContain(`blend${BlendFunction.ADD}`);
	});

	test("blend opacity uniform is created for each effect", () => {
		const effect = makeEffect("Test", simpleFragment);
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.fullscreenMaterial.uniforms.e0BlendOpacity).toBeTruthy();
	});

	test("two effects sharing a blend function emit only one copy of blend code", () => {
		const e1 = makeEffect("A", simpleFragment, { blendFunction: BlendFunction.ADD });
		const e2 = makeEffect("B", simpleFragment, { blendFunction: BlendFunction.ADD });
		const pass = new EffectPass(camera, e1, e2);
		pass.updateMaterial();
		const frag = pass.fullscreenMaterial.fragmentShader;
		const defMatches = frag.match(new RegExp(`vec4 blend${BlendFunction.ADD}`, "g"));
		expect(defMatches.length).toBe(1);
	});

	test("recompile calls updateMaterial", () => {
		const effect = makeEffect("Test", simpleFragment);
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		const fragBefore = pass.fullscreenMaterial.fragmentShader;
		pass.recompile();
		expect(pass.fullscreenMaterial.fragmentShader).toBeTruthy();
	});

	test("effect change event triggers recompile", () => {
		const effect = makeEffect("Test", simpleFragment);
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		const spy = jest.spyOn(pass, "recompile");
		effect.setChanged();
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});

	test("setEffects removes old listeners and adds new ones", () => {
		const e1 = makeEffect("A", simpleFragment);
		const e2 = makeEffect("B", simpleFragment);
		const pass = new EffectPass(camera, e1);
		pass.updateMaterial();

		const spy = jest.spyOn(pass, "recompile");
		pass.setEffects([e2]);
		pass.updateMaterial();

		e1.setChanged();
		expect(spy).not.toHaveBeenCalled();

		e2.setChanged();
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});

	test("render calls effect.update for all effects including DST", () => {
		const active = makeEffect("Active", simpleFragment);
		const dst = makeEffect("DST", simpleFragment, { blendFunction: BlendFunction.DST });
		const pass = new EffectPass(camera, active, dst);
		pass.updateMaterial();

		const activeUpdate = jest.spyOn(active, "update");
		const dstUpdate = jest.spyOn(dst, "update");

		const mockRenderer = {
			setRenderTarget: jest.fn(),
			render: jest.fn()
		};
		const mockBuffer = { texture: {} };

		pass.render(mockRenderer, mockBuffer, mockBuffer, 0.016);

		expect(activeUpdate).toHaveBeenCalled();
		expect(dstUpdate).toHaveBeenCalled();

		activeUpdate.mockRestore();
		dstUpdate.mockRestore();
	});

	test("render advances time by deltaTime * timeScale", () => {
		const effect = makeEffect("Test", simpleFragment);
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		pass.timeScale = 2.0;

		const mockRenderer = {
			setRenderTarget: jest.fn(),
			render: jest.fn()
		};
		const mockBuffer = { texture: {} };

		pass.render(mockRenderer, mockBuffer, mockBuffer, 0.1);
		expect(pass.fullscreenMaterial.time).toBeCloseTo(0.2);
	});

	test("setSize propagates to material and effects", () => {
		const effect = makeEffect("Test", simpleFragment);
		const setSizeSpy = jest.spyOn(effect, "setSize");
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();

		pass.setSize(1024, 768);
		expect(pass.fullscreenMaterial.uniforms.resolution.value.x).toBe(1024);
		expect(setSizeSpy).toHaveBeenCalledWith(1024, 768);
		setSizeSpy.mockRestore();
	});

	test("setDepthTexture propagates to material and effects", () => {
		const effect = makeEffect("Test", depthFragment, { attributes: EffectAttribute.DEPTH });
		const depthSpy = jest.spyOn(effect, "setDepthTexture");
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();

		const depthTex = { isTexture: true };
		pass.setDepthTexture(depthTex, 3201);
		expect(pass.fullscreenMaterial.depthBuffer).toBe(depthTex);
		expect(pass.fullscreenMaterial.depthPacking).toBe(3201);
		expect(depthSpy).toHaveBeenCalledWith(depthTex, 3201);
		depthSpy.mockRestore();
	});

	test("getDepthTexture returns material depthBuffer", () => {
		const pass = new EffectPass(camera);
		expect(pass.getDepthTexture()).toBeNull();
		const depthTex = { isTexture: true };
		pass.fullscreenMaterial.depthBuffer = depthTex;
		expect(pass.getDepthTexture()).toBe(depthTex);
	});

	test("encodeOutput delegates to material", () => {
		const pass = new EffectPass(camera);
		expect(pass.encodeOutput).toBe(true);
		pass.encodeOutput = false;
		expect(pass.fullscreenMaterial.encodeOutput).toBe(false);
	});

	test("dispose removes listeners and disposes effects", () => {
		const effect = makeEffect("Test", simpleFragment);
		const disposeSpy = jest.spyOn(effect, "dispose");
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();

		pass.dispose();
		expect(disposeSpy).toHaveBeenCalled();

		const recompileSpy = jest.spyOn(pass, "recompile");
		effect.setChanged();
		expect(recompileSpy).not.toHaveBeenCalled();
		recompileSpy.mockRestore();
		disposeSpy.mockRestore();
	});

	test("throws when merging two convolution effects", () => {
		const c1 = makeEffect("Conv1", simpleFragment, { attributes: EffectAttribute.CONVOLUTION });
		const c2 = makeEffect("Conv2", simpleFragment, { attributes: EffectAttribute.CONVOLUTION });
		const pass = new EffectPass(camera, c1, c2);
		expect(() => pass.updateMaterial()).toThrow(/[Cc]onvolution/);
	});

	test("throws when effect has no mainImage or mainUv", () => {
		const badFrag = `
void someOtherFunction() { }
`;
		const effect = makeEffect("Bad", badFrag);
		const pass = new EffectPass(camera, effect);
		expect(() => pass.updateMaterial()).toThrow(/mainImage|mainUv/);
	});

	test("mainCamera setter propagates to material and effects", () => {
		const effect = makeEffect("Test", simpleFragment);
		const camSpy = jest.spyOn(effect, "mainCamera", "set");
		const pass = new EffectPass(camera, effect);

		const newCam = new PerspectiveCamera(90, 1, 1, 500);
		pass.mainCamera = newCam;
		expect(pass.fullscreenMaterial.uniforms.cameraNear.value).toBe(1);
		expect(pass.fullscreenMaterial.uniforms.cameraFar.value).toBe(500);
		expect(camSpy).toHaveBeenCalled();
		camSpy.mockRestore();
	});

	test("vertex shader support integration", () => {
		const vertShader = `
varying float vBrightness;
void mainSupport(const in vec2 uv) {
	vBrightness = uv.x;
}
`;
		const fragShader = `
varying float vBrightness;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = inputColor * vBrightness;
}
`;
		const effect = makeEffect("VertexTest", fragShader, { vertexShader: vertShader });
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		const vert = pass.fullscreenMaterial.vertexShader;
		const frag = pass.fullscreenMaterial.fragmentShader;
		expect(vert).toContain("e0MainSupport");
		expect(vert).toContain("e0VBrightness");
		expect(frag).toContain("e0VBrightness");
	});

	test("extensions are merged from effects", () => {
		const effect = makeEffect("Test", simpleFragment, {
			extensions: new Set(["OES_texture_float"])
		});
		const pass = new EffectPass(camera, effect);
		pass.updateMaterial();
		expect(pass.fullscreenMaterial.extensions.OES_texture_float).toBe(true);
	});
});
