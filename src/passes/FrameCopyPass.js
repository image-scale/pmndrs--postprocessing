import {
	WebGLRenderTarget,
	LinearFilter,
	UnsignedByteType,
	SRGBColorSpace
} from "three";

import { Pass } from "./Pass.js";
import { FrameCopyMaterial } from "../materials/FrameCopyMaterial.js";

export class FrameCopyPass extends Pass {

	constructor(renderTarget, autoResize = true) {
		super("FrameCopyPass");
		this.fullscreenMaterial = new FrameCopyMaterial();
		this.needsSwap = false;

		if (renderTarget === undefined) {
			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				stencilBuffer: false,
				depthBuffer: false
			});
			this.renderTarget.texture.name = "FrameCopyPass.Target";
		} else {
			this.renderTarget = renderTarget;
		}

		this.autoResize = autoResize;
	}

	get texture() {
		return this.renderTarget.texture;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		this.fullscreenMaterial.inputBuffer = inputBuffer.texture;
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);
	}

	setSize(width, height) {
		if (this.autoResize) {
			this.renderTarget.setSize(width, height);
		}
	}

	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== undefined) {
			this.renderTarget.texture.type = frameBufferType;
			if (frameBufferType !== UnsignedByteType) {
				this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			}
			if (renderer && renderer.outputColorSpace === SRGBColorSpace) {
				this.renderTarget.texture.colorSpace = SRGBColorSpace;
			}
		}
	}

}
