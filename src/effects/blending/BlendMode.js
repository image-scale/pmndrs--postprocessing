import { EventDispatcher, Uniform } from "three";
import { BlendFunction } from "../../enums/index.js";

const blendShaders = new Map([
	[BlendFunction.ADD, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = dst.rgb + src.rgb;
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.ALPHA, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	return mix(dst, src, src.a * opacity);
}`],
	[BlendFunction.AVERAGE, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = (dst.rgb + src.rgb) * 0.5;
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.COLOR, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 a = RGBToHSL(dst.rgb);
	vec3 b = RGBToHSL(src.rgb);
	vec3 c = HSLToRGB(vec3(b.xy, a.z));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.COLOR_BURN, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 a = dst.rgb, b = src.rgb;
	vec3 c = mix(step(0.0, b) * (1.0 - min(vec3(1.0), (1.0 - a) / max(b, 1e-9))), vec3(1.0), step(1.0, a));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.COLOR_DODGE, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 a = dst.rgb, b = src.rgb;
	vec3 c = step(0.0, a) * mix(min(vec3(1.0), a / max(1.0 - b, 1e-9)), vec3(1.0), step(1.0, b));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.DARKEN, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = min(dst.rgb, src.rgb);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.DIFFERENCE, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = abs(dst.rgb - src.rgb);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.DIVIDE, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = dst.rgb / max(src.rgb, 1e-9);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.DST, null],
	[BlendFunction.EXCLUSION, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = dst.rgb + src.rgb - 2.0 * dst.rgb * src.rgb;
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.HARD_LIGHT, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 a = min(dst.rgb, 1.0);
	vec3 b = min(src.rgb, 1.0);
	vec3 c = mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, b));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.HARD_MIX, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = step(1.0, dst.rgb + src.rgb);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.HUE, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 a = RGBToHSL(dst.rgb);
	vec3 b = RGBToHSL(src.rgb);
	vec3 c = HSLToRGB(vec3(b.x, a.yz));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.INVERT, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = max(1.0 - src.rgb, 0.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.INVERT_RGB, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = src.rgb * max(1.0 - dst.rgb, 0.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.LIGHTEN, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = max(dst.rgb, src.rgb);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.LINEAR_BURN, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = clamp(src.rgb + dst.rgb - 1.0, 0.0, 1.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.LINEAR_DODGE, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = min(dst.rgb + src.rgb, 1.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.LINEAR_LIGHT, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = clamp(2.0 * src.rgb + dst.rgb - 1.0, 0.0, 1.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.LUMINOSITY, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 a = RGBToHSL(dst.rgb);
	vec3 b = RGBToHSL(src.rgb);
	vec3 c = HSLToRGB(vec3(a.xy, b.z));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.MULTIPLY, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = dst.rgb * src.rgb;
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.NEGATION, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = max(1.0 - abs(1.0 - dst.rgb - src.rgb), 0.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.NORMAL, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	return mix(dst, src, opacity);
}`],
	[BlendFunction.OVERLAY, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 a = 2.0 * src.rgb * dst.rgb;
	vec3 b = 1.0 - 2.0 * (1.0 - src.rgb) * (1.0 - dst.rgb);
	vec3 c = mix(a, b, step(0.5, dst.rgb));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.PIN_LIGHT, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 src2 = 2.0 * src.rgb;
	vec3 c = mix(
		mix(src2, dst.rgb, step(0.5 * dst.rgb, src.rgb)),
		max(src2 - 1.0, vec3(0.0)),
		step(dst.rgb, src2 - 1.0)
	);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.REFLECT, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 a = min(dst.rgb * dst.rgb / max(1.0 - src.rgb, 1e-9), 1.0);
	vec3 c = mix(a, src.rgb, step(1.0, src.rgb));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.SATURATION, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 a = RGBToHSL(dst.rgb);
	vec3 b = RGBToHSL(src.rgb);
	vec3 c = HSLToRGB(vec3(a.x, b.y, a.z));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.SCREEN, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = dst.rgb + src.rgb - min(dst.rgb * src.rgb, 1.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.SOFT_LIGHT, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 src2 = 2.0 * src.rgb;
	vec3 d = dst.rgb + (src2 - 1.0);
	vec3 w = step(0.5, src.rgb);
	vec3 a = dst.rgb - (1.0 - src2) * dst.rgb * (1.0 - dst.rgb);
	vec3 b = mix(
		d * (sqrt(dst.rgb) - dst.rgb),
		d * dst.rgb * ((16.0 * dst.rgb - 12.0) * dst.rgb + 3.0),
		w * (1.0 - step(0.25, dst.rgb))
	);
	vec3 c = mix(a, b, w);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.SRC, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	return src;
}`],
	[BlendFunction.SUBTRACT, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = max(dst.rgb - src.rgb, 0.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`],
	[BlendFunction.VIVID_LIGHT, `vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {
	vec3 c = mix(
		max(1.0 - min((1.0 - dst.rgb) / (2.0 * src.rgb), 1.0), 0.0),
		min(dst.rgb / (2.0 * (1.0 - src.rgb)), 1.0),
		step(0.5, src.rgb)
	);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);
}`]
]);

export class BlendMode extends EventDispatcher {

	constructor(blendFunction, opacity = 1.0) {
		super();
		this._blendFunction = blendFunction;
		this.opacity = new Uniform(opacity);
	}

	get blendFunction() {
		return this._blendFunction;
	}

	set blendFunction(value) {
		if (this._blendFunction !== value) {
			this._blendFunction = value;
			this.dispatchEvent({ type: "change" });
		}
	}

	getOpacity() {
		return this.opacity.value;
	}

	setOpacity(value) {
		this.opacity.value = value;
	}

	getBlendFunction() {
		return this._blendFunction;
	}

	setBlendFunction(value) {
		this.blendFunction = value;
	}

	getShaderCode() {
		return blendShaders.get(this._blendFunction) || null;
	}

}
