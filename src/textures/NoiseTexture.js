import {
	DataTexture,
	RedFormat,
	RGFormat,
	RGBAFormat,
	UnsignedByteType
} from "three";

function generateNoise(size, format, type) {
	const channelCount = new Map([
		[RedFormat, 1],
		[RGFormat, 2],
		[RGBAFormat, 4]
	]);

	const channels = channelCount.get(format) || 4;

	if (type === UnsignedByteType) {
		const data = new Uint8Array(size * channels);
		for (let i = 0, l = data.length; i < l; ++i) {
			data[i] = Math.random() * 255 + 0.5;
		}
		return data;
	}

	const data = new Float32Array(size * channels);
	for (let i = 0, l = data.length; i < l; ++i) {
		data[i] = Math.random();
	}
	return data;
}

export class NoiseTexture extends DataTexture {

	constructor(width, height, format = RedFormat, type = UnsignedByteType) {
		super(generateNoise(width * height, format, type), width, height, format, type);
		this.needsUpdate = true;
	}

}
