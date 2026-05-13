import { Loader, FileLoader } from "three";
import { LookupTexture } from "../textures/lut/LookupTexture.js";

export class LUT3dlLoader extends Loader {

	load(url, onLoad, onProgress, onError) {
		const loader = new FileLoader(this.manager);
		loader.setPath(this.path);
		loader.setResponseType("text");

		loader.load(url, (data) => {
			try {
				const lut = this.parse(data);
				if (onLoad) onLoad(lut);
			} catch (e) {
				if (onError) onError(e);
				else console.error(e);
			}
		}, onProgress, onError);
	}

	loadAsync(url, onProgress) {
		return new Promise((resolve, reject) => {
			this.load(url, resolve, onProgress, reject);
		});
	}

	parse(input) {
		const regExpGridInfo = /^[\d ]+$/m;
		const regExpDataPoints = /^([\d.e+-]+) +([\d.e+-]+) +([\d.e+-]+) *$/gm;

		const gridMatch = regExpGridInfo.exec(input);
		if (gridMatch === null) {
			throw new Error("Missing grid info in .3dl file");
		}

		const gridLines = gridMatch[0].trim().split(/\s+/).map(Number);
		const size = gridLines.length;
		const sizeSq = size * size;
		const data = new Float32Array(size * sizeSq * 4);

		let maxValue = 0;
		let index = 0;
		let match;

		while ((match = regExpDataPoints.exec(input)) !== null) {
			const r = Number(match[1]);
			const g = Number(match[2]);
			const b = Number(match[3]);

			const bLayer = index % size;
			const gLayer = Math.floor(index / size) % size;
			const rLayer = Math.floor(index / sizeSq) % size;
			const d4 = (bLayer * sizeSq + gLayer * size + rLayer) * 4;

			data[d4] = r;
			data[d4 + 1] = g;
			data[d4 + 2] = b;
			data[d4 + 3] = 1.0;

			maxValue = Math.max(maxValue, r, g, b);
			index++;
		}

		const bits = Math.ceil(Math.log2(maxValue));
		const divisor = Math.pow(2, bits);

		for (let i = 0; i < data.length; i += 4) {
			data[i] /= divisor;
			data[i + 1] /= divisor;
			data[i + 2] /= divisor;
		}

		return new LookupTexture(data, size);
	}

}
