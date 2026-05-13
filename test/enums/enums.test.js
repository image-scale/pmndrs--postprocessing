import { jest } from "@jest/globals";
import {
	BlendFunction,
	ColorChannel,
	DepthCopyMode,
	DepthTestStrategy,
	EdgeDetectionMode,
	EffectAttribute,
	EffectShaderSection,
	GlitchMode,
	KernelSize,
	LUTOperation,
	MaskFunction,
	PredicationMode,
	SMAAPreset,
	ToneMappingMode,
	VignetteTechnique,
	WebGLExtension
} from "../../src/enums/index.js";

describe("BlendFunction", () => {
	test("has 33 unique numeric blend modes (0-32)", () => {
		expect(BlendFunction.ADD).toBe(0);
		expect(BlendFunction.VIVID_LIGHT).toBe(32);
		expect(BlendFunction.NORMAL).toBe(23);
		expect(BlendFunction.SCREEN).toBe(28);
		expect(BlendFunction.MULTIPLY).toBe(21);
		expect(BlendFunction.SRC).toBe(30);
		expect(BlendFunction.DST).toBe(9);
	});

	test("SKIP is an alias for DST", () => {
		expect(BlendFunction.SKIP).toBe(BlendFunction.DST);
	});

	test("SET is an alias for SRC", () => {
		expect(BlendFunction.SET).toBe(BlendFunction.SRC);
	});
});

describe("ColorChannel", () => {
	test("has four channels with values 0-3", () => {
		expect(ColorChannel.RED).toBe(0);
		expect(ColorChannel.GREEN).toBe(1);
		expect(ColorChannel.BLUE).toBe(2);
		expect(ColorChannel.ALPHA).toBe(3);
	});
});

describe("DepthCopyMode", () => {
	test("has FULL and SINGLE modes", () => {
		expect(DepthCopyMode.FULL).toBe(0);
		expect(DepthCopyMode.SINGLE).toBe(1);
	});
});

describe("DepthTestStrategy", () => {
	test("has three strategies", () => {
		expect(DepthTestStrategy.DEFAULT).toBe(0);
		expect(DepthTestStrategy.KEEP_MAX_DEPTH).toBe(1);
		expect(DepthTestStrategy.DISCARD_MAX_DEPTH).toBe(2);
	});
});

describe("EdgeDetectionMode", () => {
	test("has depth, luma, and color modes", () => {
		expect(EdgeDetectionMode.DEPTH).toBe(0);
		expect(EdgeDetectionMode.LUMA).toBe(1);
		expect(EdgeDetectionMode.COLOR).toBe(2);
	});
});

describe("EffectAttribute", () => {
	test("has bitfield values that can be OR'd together", () => {
		expect(EffectAttribute.NONE).toBe(0);
		expect(EffectAttribute.DEPTH).toBe(1);
		expect(EffectAttribute.CONVOLUTION).toBe(2);
		expect(EffectAttribute.DEPTH | EffectAttribute.CONVOLUTION).toBe(3);
	});
});

describe("EffectShaderSection", () => {
	test("has string values for shader template sections", () => {
		expect(EffectShaderSection.FRAGMENT_HEAD).toBe("FRAGMENT_HEAD");
		expect(EffectShaderSection.FRAGMENT_MAIN_UV).toBe("FRAGMENT_MAIN_UV");
		expect(EffectShaderSection.FRAGMENT_MAIN_IMAGE).toBe("FRAGMENT_MAIN_IMAGE");
		expect(EffectShaderSection.VERTEX_HEAD).toBe("VERTEX_HEAD");
		expect(EffectShaderSection.VERTEX_MAIN_SUPPORT).toBe("VERTEX_MAIN_SUPPORT");
	});
});

describe("GlitchMode", () => {
	test("has four modes from 0 to 3", () => {
		expect(GlitchMode.DISABLED).toBe(0);
		expect(GlitchMode.SPORADIC).toBe(1);
		expect(GlitchMode.CONSTANT_MILD).toBe(2);
		expect(GlitchMode.CONSTANT_WILD).toBe(3);
	});
});

describe("KernelSize", () => {
	test("has six sizes from 0 to 5", () => {
		expect(KernelSize.VERY_SMALL).toBe(0);
		expect(KernelSize.SMALL).toBe(1);
		expect(KernelSize.MEDIUM).toBe(2);
		expect(KernelSize.LARGE).toBe(3);
		expect(KernelSize.VERY_LARGE).toBe(4);
		expect(KernelSize.HUGE).toBe(5);
	});
});

describe("LUTOperation", () => {
	test("has SCALE_UP string value", () => {
		expect(LUTOperation.SCALE_UP).toBe("lut.scaleup");
	});
});

describe("MaskFunction", () => {
	test("has four mask functions", () => {
		expect(MaskFunction.DISCARD).toBe(0);
		expect(MaskFunction.MULTIPLY).toBe(1);
		expect(MaskFunction.MULTIPLY_RGB_SET_ALPHA).toBe(2);
		expect(MaskFunction.MULTIPLY_RGB).toBe(3);
	});
});

describe("PredicationMode", () => {
	test("has three modes", () => {
		expect(PredicationMode.DISABLED).toBe(0);
		expect(PredicationMode.DEPTH).toBe(1);
		expect(PredicationMode.CUSTOM).toBe(2);
	});
});

describe("SMAAPreset", () => {
	test("has four presets from 0 to 3", () => {
		expect(SMAAPreset.LOW).toBe(0);
		expect(SMAAPreset.MEDIUM).toBe(1);
		expect(SMAAPreset.HIGH).toBe(2);
		expect(SMAAPreset.ULTRA).toBe(3);
	});
});

describe("ToneMappingMode", () => {
	test("has nine tone mapping modes", () => {
		expect(ToneMappingMode.LINEAR).toBe(0);
		expect(ToneMappingMode.REINHARD).toBe(1);
		expect(ToneMappingMode.REINHARD2).toBe(2);
		expect(ToneMappingMode.REINHARD2_ADAPTIVE).toBe(3);
		expect(ToneMappingMode.UNCHARTED2).toBe(4);
		expect(ToneMappingMode.CINEON).toBe(5);
		expect(ToneMappingMode.ACES_FILMIC).toBe(6);
		expect(ToneMappingMode.AGX).toBe(7);
		expect(ToneMappingMode.NEUTRAL).toBe(8);
	});

	test("OPTIMIZED_CINEON is an alias for CINEON", () => {
		expect(ToneMappingMode.OPTIMIZED_CINEON).toBe(ToneMappingMode.CINEON);
	});
});

describe("VignetteTechnique", () => {
	test("has two techniques", () => {
		expect(VignetteTechnique.DEFAULT).toBe(0);
		expect(VignetteTechnique.ESKIL).toBe(1);
	});
});

describe("WebGLExtension", () => {
	test("has four extension string constants", () => {
		expect(WebGLExtension.DERIVATIVES).toBe("derivatives");
		expect(WebGLExtension.FRAG_DEPTH).toBe("fragDepth");
		expect(WebGLExtension.DRAW_BUFFERS).toBe("drawBuffers");
		expect(WebGLExtension.SHADER_TEXTURE_LOD).toBe("shaderTextureLOD");
	});
});
