import {
	ClampToEdgeWrapping,
	Data3DTexture,
	FloatType,
	LinearFilter,
	LinearSRGBColorSpace,
	RGBAFormat,
	UnsignedByteType,
	Vector3,
	Color
} from "three";

export class LookupTexture extends Data3DTexture {

	constructor(data, size) {
		super(data, size, size, size);

		this.type = FloatType;
		this.format = RGBAFormat;
		this.minFilter = LinearFilter;
		this.magFilter = LinearFilter;
		this.wrapS = ClampToEdgeWrapping;
		this.wrapT = ClampToEdgeWrapping;
		this.wrapR = ClampToEdgeWrapping;
		this.unpackAlignment = 1;
		this.needsUpdate = true;
		this.colorSpace = LinearSRGBColorSpace;

		this.domainMin = new Vector3(0, 0, 0);
		this.domainMax = new Vector3(1, 1, 1);
	}

	static createNeutral(size) {
		const data = new Float32Array(size * size * size * 4);
		const s = 1.0 / (size - 1.0);
		const sizeSq = size * size;

		for (let b = 0; b < size; b++) {
			for (let g = 0; g < size; g++) {
				for (let r = 0; r < size; r++) {
					const i = (r + g * size + b * sizeSq) * 4;
					data[i] = r * s;
					data[i + 1] = g * s;
					data[i + 2] = b * s;
					data[i + 3] = 1.0;
				}
			}
		}

		const lut = new LookupTexture(data, size);
		lut.name = "neutral";
		return lut;
	}

	convertToUint8() {
		if (this.type === FloatType) {
			const src = this.image.data;
			const dst = new Uint8Array(src.length);

			for (let i = 0; i < src.length; i++) {
				dst[i] = Math.min(255, Math.max(0, Math.round(src[i] * 255)));
			}

			this.image.data = dst;
			this.type = UnsignedByteType;
			this.needsUpdate = true;
		}

		return this;
	}

	convertToFloat() {
		if (this.type === UnsignedByteType) {
			const src = this.image.data;
			const dst = new Float32Array(src.length);

			for (let i = 0; i < src.length; i++) {
				dst[i] = src[i] / 255;
			}

			this.image.data = dst;
			this.type = FloatType;
			this.needsUpdate = true;
		}

		return this;
	}

	convertLinearToSRGB() {
		const data = this.image.data;
		const c = new Color();
		const isFloat = (this.type === FloatType);
		const scale = isFloat ? 1.0 : 1.0 / 255.0;
		const invScale = isFloat ? 1.0 : 255.0;

		for (let i = 0; i < data.length; i += 4) {
			c.setRGB(data[i] * scale, data[i + 1] * scale, data[i + 2] * scale);
			c.convertLinearToSRGB();
			data[i] = c.r * invScale;
			data[i + 1] = c.g * invScale;
			data[i + 2] = c.b * invScale;
		}

		this.colorSpace = "srgb";
		this.needsUpdate = true;
		return this;
	}

	convertSRGBToLinear() {
		const data = this.image.data;
		const c = new Color();
		const isFloat = (this.type === FloatType);
		const scale = isFloat ? 1.0 : 1.0 / 255.0;
		const invScale = isFloat ? 1.0 : 255.0;

		for (let i = 0; i < data.length; i += 4) {
			c.setRGB(data[i] * scale, data[i + 1] * scale, data[i + 2] * scale);
			c.convertSRGBToLinear();
			data[i] = c.r * invScale;
			data[i + 1] = c.g * invScale;
			data[i + 2] = c.b * invScale;
		}

		this.colorSpace = LinearSRGBColorSpace;
		this.needsUpdate = true;
		return this;
	}

}
