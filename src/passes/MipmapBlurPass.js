import {
	WebGLRenderTarget,
	LinearFilter,
	Vector2,
	UnsignedByteType,
	SRGBColorSpace
} from "three";

import { Pass } from "./Pass.js";
import { DownsamplingMaterial } from "../materials/DownsamplingMaterial.js";
import { UpsamplingMaterial } from "../materials/UpsamplingMaterial.js";

export class MipmapBlurPass extends Pass {

	constructor() {
		super("MipmapBlurPass");

		this.needsSwap = false;

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});
		this.renderTarget.texture.name = "MipmapBlurPass.Target";

		this.downsamplingMaterial = new DownsamplingMaterial();
		this.upsamplingMaterial = new UpsamplingMaterial();

		this.downsamplingMipmaps = [];
		this.upsamplingMipmaps = [];
		this._resolution = new Vector2();
		this._levels = 0;
		this.levels = 8;
	}

	get texture() {
		return this.renderTarget.texture;
	}

	get levels() {
		return this._levels;
	}

	set levels(value) {
		for (const rt of this.downsamplingMipmaps) {
			rt.dispose();
		}
		for (let i = 1; i < this.upsamplingMipmaps.length; i++) {
			this.upsamplingMipmaps[i].dispose();
		}

		this._levels = value;
		this.downsamplingMipmaps = [];
		this.upsamplingMipmaps = [this.renderTarget];

		for (let i = 0; i < value; i++) {
			this.downsamplingMipmaps.push(this.renderTarget.clone());
		}

		for (let i = 0; i < value - 2; i++) {
			this.upsamplingMipmaps.push(this.renderTarget.clone());
		}

		if (this._resolution.x > 0 && this._resolution.y > 0) {
			this.setSize(this._resolution.x, this._resolution.y);
		}
	}

	get radius() {
		return this.upsamplingMaterial.radius;
	}

	set radius(value) {
		this.upsamplingMaterial.radius = value;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const downMat = this.downsamplingMaterial;
		const upMat = this.upsamplingMaterial;
		let previousBuffer = inputBuffer;

		this.fullscreenMaterial = downMat;
		for (let i = 0; i < this.downsamplingMipmaps.length; i++) {
			const mipmap = this.downsamplingMipmaps[i];
			downMat.setSize(previousBuffer.width, previousBuffer.height);
			downMat.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(mipmap);
			renderer.render(this.scene, this.camera);
			previousBuffer = mipmap;
		}

		this.fullscreenMaterial = upMat;
		for (let i = this.upsamplingMipmaps.length - 1; i >= 0; i--) {
			const mipmap = this.upsamplingMipmaps[i];
			upMat.setSize(previousBuffer.width, previousBuffer.height);
			upMat.inputBuffer = previousBuffer.texture;
			upMat.supportBuffer = this.downsamplingMipmaps[i].texture;
			renderer.setRenderTarget(mipmap);
			renderer.render(this.scene, this.camera);
			previousBuffer = mipmap;
		}
	}

	setSize(width, height) {
		this._resolution.set(width, height);
		let w = width;
		let h = height;

		for (let i = 0; i < this.downsamplingMipmaps.length; i++) {
			w = Math.round(w * 0.5);
			h = Math.round(h * 0.5);
			this.downsamplingMipmaps[i].setSize(Math.max(w, 1), Math.max(h, 1));

			if (i < this.upsamplingMipmaps.length) {
				this.upsamplingMipmaps[i].setSize(Math.max(w, 1), Math.max(h, 1));
			}
		}
	}

	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== undefined) {
			const setType = (rt) => {
				rt.texture.type = frameBufferType;
			};
			setType(this.renderTarget);
			this.downsamplingMipmaps.forEach(setType);
			this.upsamplingMipmaps.forEach(setType);

			if (frameBufferType !== UnsignedByteType) {
				this.downsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
				this.upsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			}
			if (renderer && renderer.outputColorSpace === SRGBColorSpace) {
				const setCS = (rt) => {
					rt.texture.colorSpace = SRGBColorSpace;
				};
				setCS(this.renderTarget);
				this.downsamplingMipmaps.forEach(setCS);
				this.upsamplingMipmaps.forEach(setCS);
			}
		}
	}

}
