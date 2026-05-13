import { Uniform, UnsignedByteType } from "three";
import { ColorChannel } from "../enums/index.js";
import { Effect } from "./Effect.js";

const textureFragmentShader = `
#ifdef TEXTURE_PRECISION_HIGH
uniform mediump sampler2D map;
#else
uniform lowp sampler2D map;
#endif

varying vec2 vUv2;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	#ifdef UV_TRANSFORM
		vec4 texel = texture2D(map, vUv2);
	#else
		vec4 texel = texture2D(map, uv);
	#endif

	outputColor = TEXEL;
	outputColor.a = max(inputColor.a, outputColor.a);
}`;

const textureVertexShader = `
#ifdef ASPECT_CORRECTION
uniform float scale;
#else
uniform mat3 uvTransform;
#endif

varying vec2 vUv2;

void mainSupport(const in vec2 uv) {
	#ifdef ASPECT_CORRECTION
		vUv2 = uv * vec2(aspect, 1.0) * scale;
	#else
		vUv2 = (uvTransform * vec3(uv, 1.0)).xy;
	#endif
}`;

export class TextureEffect extends Effect {

	constructor({ blendFunction, texture = null, aspectCorrection = false } = {}) {
		super("TextureEffect", textureFragmentShader, {
			blendFunction,
			defines: new Map([
				["TEXEL", "texel"]
			]),
			uniforms: new Map([
				["map", new Uniform(null)],
				["scale", new Uniform(1.0)],
				["uvTransform", new Uniform(null)]
			])
		});

		this.texture = texture;
		this.aspectCorrection = aspectCorrection;
	}

	get texture() {
		return this.uniforms.get("map").value;
	}

	set texture(value) {
		const prevTexture = this.texture;
		const uniforms = this.uniforms;
		const defines = this.defines;

		if (prevTexture !== value) {
			uniforms.get("map").value = value;

			if (value !== null) {
				uniforms.get("uvTransform").value = value.matrix;

				if (value.matrixAutoUpdate) {
					defines.set("UV_TRANSFORM", "1");
					this.setVertexShader(textureVertexShader);
				} else {
					defines.delete("UV_TRANSFORM");
					this.setVertexShader(null);
				}

				defines.delete("TEXTURE_PRECISION_HIGH");
				if (value.type !== UnsignedByteType) {
					defines.set("TEXTURE_PRECISION_HIGH", "1");
				}

				if (prevTexture === null || prevTexture.type !== value.type) {
					this.setChanged();
				}
			}
		}
	}

	get aspectCorrection() {
		return this.defines.has("ASPECT_CORRECTION");
	}

	set aspectCorrection(value) {
		if (this.aspectCorrection !== value) {
			if (value) {
				this.defines.set("ASPECT_CORRECTION", "1");
			} else {
				this.defines.delete("ASPECT_CORRECTION");
			}
			this.setChanged();
		}
	}

	get uvTransform() {
		const texture = this.texture;
		return (texture !== null && texture.matrixAutoUpdate);
	}

	set uvTransform(value) {
		const texture = this.texture;
		if (texture !== null) {
			texture.matrixAutoUpdate = value;
		}
	}

	setTextureSwizzleRGBA(r, g = r, b = r, a = r) {
		const rgba = "rgba";
		let swizzle = "";

		if (r !== ColorChannel.RED || g !== ColorChannel.GREEN ||
			b !== ColorChannel.BLUE || a !== ColorChannel.ALPHA) {
			swizzle = [".", rgba[r], rgba[g], rgba[b], rgba[a]].join("");
		}

		this.defines.set("TEXEL", "texel" + swizzle);
		this.setChanged();
	}

	update(renderer, inputBuffer, deltaTime) {
		if (this.texture !== null && this.texture.matrixAutoUpdate) {
			this.texture.updateMatrix();
		}
	}

}
