import { Loader, FileLoader } from "three";
import { LookupTexture } from "../textures/lut/LookupTexture.js";

export class LUTCubeLoader extends Loader {

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
		const regExpTitle = /TITLE +"([^"]*)"/;
		const regExpSize = /LUT_3D_SIZE +(\d+)/;
		const regExpDomainMin = /DOMAIN_MIN +([\d.]+) +([\d.]+) +([\d.]+)/;
		const regExpDomainMax = /DOMAIN_MAX +([\d.]+) +([\d.]+) +([\d.]+)/;
		const regExpDataPoints = /^([\d.e+-]+) +([\d.e+-]+) +([\d.e+-]+) *$/gm;

		const sizeMatch = regExpSize.exec(input);
		if (sizeMatch === null) {
			throw new Error("Missing LUT_3D_SIZE in .cube file");
		}

		const size = Number(sizeMatch[1]);
		const data = new Float32Array(size * size * size * 4);

		const titleMatch = regExpTitle.exec(input);
		const domainMinMatch = regExpDomainMin.exec(input);
		const domainMaxMatch = regExpDomainMax.exec(input);

		let i = 0;
		let match;

		while ((match = regExpDataPoints.exec(input)) !== null) {
			data[i++] = Number(match[1]);
			data[i++] = Number(match[2]);
			data[i++] = Number(match[3]);
			data[i++] = 1.0;
		}

		const lut = new LookupTexture(data, size);

		if (titleMatch !== null) {
			lut.name = titleMatch[1];
		}

		if (domainMinMatch !== null) {
			lut.domainMin.set(
				Number(domainMinMatch[1]),
				Number(domainMinMatch[2]),
				Number(domainMinMatch[3])
			);
		}

		if (domainMaxMatch !== null) {
			lut.domainMax.set(
				Number(domainMaxMatch[1]),
				Number(domainMaxMatch[2]),
				Number(domainMaxMatch[3])
			);
		}

		return lut;
	}

}
