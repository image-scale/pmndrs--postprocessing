import { Color, Uniform, Vector4 } from "three";
import { Effect } from "./Effect.js";

const asciiFragment = `
uniform sampler2D asciiTexture;
uniform vec4 cellCount;

#ifdef USE_COLOR
uniform vec3 color;
#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec2 pixelizedUv = cellCount.zw * (0.5 + floor(uv * cellCount.xy));
	vec4 texel = texture2D(inputBuffer, pixelizedUv);

	float lum = min(luminance(texel.rgb), 1.0);

	#ifdef INVERTED
		lum = 1.0 - lum;
	#endif

	float characterIndex = floor(CHAR_COUNT_MINUS_ONE * lum);
	vec2 characterPosition = vec2(mod(characterIndex, TEX_CELL_COUNT), floor(characterIndex * INV_TEX_CELL_COUNT));
	vec2 offset = vec2(characterPosition.x, -characterPosition.y) * INV_TEX_CELL_COUNT;
	vec2 characterUv = mod(uv * (cellCount.xy * INV_TEX_CELL_COUNT), INV_TEX_CELL_COUNT);
	characterUv = characterUv - vec2(0.0, INV_TEX_CELL_COUNT) + offset;
	float asciiCharacter = texture2D(asciiTexture, characterUv).r;

	#ifdef USE_COLOR
		outputColor = vec4(color * asciiCharacter, inputColor.a);
	#else
		outputColor = vec4(texel.rgb * asciiCharacter, inputColor.a);
	#endif
}`;

export class ASCIIEffect extends Effect {

	constructor({
		asciiTexture = null,
		cellSize = 16,
		color = null,
		inverted = false,
		characterCount = 64,
		textureCellCount = 8
	} = {}) {
		super("ASCIIEffect", asciiFragment, {
			uniforms: new Map([
				["asciiTexture", new Uniform(null)],
				["cellCount", new Uniform(new Vector4())],
				["color", new Uniform(new Color())]
			]),
			defines: new Map([
				["CHAR_COUNT_MINUS_ONE", (characterCount - 1).toFixed(1)],
				["TEX_CELL_COUNT", textureCellCount.toFixed(1)],
				["INV_TEX_CELL_COUNT", (1.0 / textureCellCount).toFixed(9)]
			])
		});

		this._cellSize = -1;
		this.resolution = { x: 0, y: 0 };

		if (asciiTexture !== null) {
			this.uniforms.get("asciiTexture").value = asciiTexture;
		}

		this.cellSize = cellSize;
		this.color = color;
		this.inverted = inverted;
	}

	get cellSize() {
		return this._cellSize;
	}

	set cellSize(value) {
		this._cellSize = value;
		this._updateCellCount();
	}

	get color() {
		return this.uniforms.get("color").value;
	}

	set color(value) {
		if (value !== null) {
			this.uniforms.get("color").value.set(value);
			if (!this.defines.has("USE_COLOR")) {
				this.defines.set("USE_COLOR", "1");
				this.setChanged();
			}
		} else {
			if (this.defines.has("USE_COLOR")) {
				this.defines.delete("USE_COLOR");
				this.setChanged();
			}
		}
	}

	get inverted() {
		return this.defines.has("INVERTED");
	}

	set inverted(value) {
		if (this.inverted !== value) {
			if (value) {
				this.defines.set("INVERTED", "1");
			} else {
				this.defines.delete("INVERTED");
			}
			this.setChanged();
		}
	}

	setSize(width, height) {
		this.resolution.x = width;
		this.resolution.y = height;
		this._updateCellCount();
	}

	_updateCellCount() {
		const cellCount = this.uniforms.get("cellCount").value;
		const w = this.resolution.x;
		const h = this.resolution.y;

		if (w > 0 && h > 0 && this._cellSize > 0) {
			const cx = Math.ceil(w / this._cellSize);
			const cy = Math.ceil(h / this._cellSize);
			cellCount.set(cx, cy, 1.0 / cx, 1.0 / cy);
		}
	}

}
