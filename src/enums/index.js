export const BlendFunction = {
	ADD: 0,
	ALPHA: 1,
	AVERAGE: 2,
	COLOR: 3,
	COLOR_BURN: 4,
	COLOR_DODGE: 5,
	DARKEN: 6,
	DIFFERENCE: 7,
	DIVIDE: 8,
	DST: 9,
	EXCLUSION: 10,
	HARD_LIGHT: 11,
	HARD_MIX: 12,
	HUE: 13,
	INVERT: 14,
	INVERT_RGB: 15,
	LIGHTEN: 16,
	LINEAR_BURN: 17,
	LINEAR_DODGE: 18,
	LINEAR_LIGHT: 19,
	LUMINOSITY: 20,
	MULTIPLY: 21,
	NEGATION: 22,
	NORMAL: 23,
	OVERLAY: 24,
	PIN_LIGHT: 25,
	REFLECT: 26,
	SATURATION: 27,
	SCREEN: 28,
	SOFT_LIGHT: 29,
	SRC: 30,
	SUBTRACT: 31,
	VIVID_LIGHT: 32,
	SKIP: 9,
	SET: 30
};

export const ColorChannel = {
	RED: 0,
	GREEN: 1,
	BLUE: 2,
	ALPHA: 3
};

export const DepthCopyMode = {
	FULL: 0,
	SINGLE: 1
};

export const DepthTestStrategy = {
	DEFAULT: 0,
	KEEP_MAX_DEPTH: 1,
	DISCARD_MAX_DEPTH: 2
};

export const EdgeDetectionMode = {
	DEPTH: 0,
	LUMA: 1,
	COLOR: 2
};

export const EffectAttribute = {
	NONE: 0,
	DEPTH: 1,
	CONVOLUTION: 2
};

export const EffectShaderSection = {
	FRAGMENT_HEAD: "FRAGMENT_HEAD",
	FRAGMENT_MAIN_UV: "FRAGMENT_MAIN_UV",
	FRAGMENT_MAIN_IMAGE: "FRAGMENT_MAIN_IMAGE",
	VERTEX_HEAD: "VERTEX_HEAD",
	VERTEX_MAIN_SUPPORT: "VERTEX_MAIN_SUPPORT"
};

export const GlitchMode = {
	DISABLED: 0,
	SPORADIC: 1,
	CONSTANT_MILD: 2,
	CONSTANT_WILD: 3
};

export const KernelSize = {
	VERY_SMALL: 0,
	SMALL: 1,
	MEDIUM: 2,
	LARGE: 3,
	VERY_LARGE: 4,
	HUGE: 5
};

export const LUTOperation = {
	SCALE_UP: "lut.scaleup"
};

export const MaskFunction = {
	DISCARD: 0,
	MULTIPLY: 1,
	MULTIPLY_RGB_SET_ALPHA: 2,
	MULTIPLY_RGB: 3
};

export const PredicationMode = {
	DISABLED: 0,
	DEPTH: 1,
	CUSTOM: 2
};

export const SMAAPreset = {
	LOW: 0,
	MEDIUM: 1,
	HIGH: 2,
	ULTRA: 3
};

export const ToneMappingMode = {
	LINEAR: 0,
	REINHARD: 1,
	REINHARD2: 2,
	REINHARD2_ADAPTIVE: 3,
	UNCHARTED2: 4,
	CINEON: 5,
	OPTIMIZED_CINEON: 5,
	ACES_FILMIC: 6,
	AGX: 7,
	NEUTRAL: 8
};

export const VignetteTechnique = {
	DEFAULT: 0,
	ESKIL: 1
};

export const WebGLExtension = {
	DERIVATIVES: "derivatives",
	FRAG_DEPTH: "fragDepth",
	DRAW_BUFFERS: "drawBuffers",
	SHADER_TEXTURE_LOD: "shaderTextureLOD"
};
