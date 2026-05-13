import {
	Vector2,
	WebGLRenderTarget,
	DepthTexture,
	UnsignedIntType,
	DepthStencilFormat,
	UnsignedInt248Type,
	LinearFilter,
	SRGBColorSpace,
	HalfFloatType,
	UnsignedByteType,
	NearestFilter
} from "three";

import { Timer } from "./Timer.js";
import { Pass } from "../passes/Pass.js";

export class EffectComposer {

	constructor(renderer = null, {
		depthBuffer = true,
		stencilBuffer = false,
		multisampling = 0,
		frameBufferType
	} = {}) {

		this.renderer = renderer;
		this.inputBuffer = this._createBuffer(depthBuffer, stencilBuffer, frameBufferType, multisampling);
		this.outputBuffer = this.inputBuffer.clone();
		this.outputBuffer.texture.name = "EffectComposer.OutputBuffer";
		this.inputBuffer.texture.name = "EffectComposer.InputBuffer";

		this._passes = [];
		this.timer = new Timer();
		this.autoRenderToScreen = true;

		this._depthTexture = null;
		this._depthRenderTarget = null;

		if (renderer !== null) {
			renderer.autoClear = false;
		}
	}

	get passes() {
		return this._passes;
	}

	get multisampling() {
		return this.inputBuffer.samples || 0;
	}

	set multisampling(value) {
		const inputBuffer = this.inputBuffer;
		const outputBuffer = this.outputBuffer;
		inputBuffer.samples = value;
		outputBuffer.samples = value;
		inputBuffer.dispose();
		outputBuffer.dispose();
	}

	getTimer() {
		return this.timer;
	}

	getRenderer() {
		return this.renderer;
	}

	setRenderer(renderer) {
		this.renderer = renderer;
		if (renderer !== null) {
			renderer.autoClear = false;

			const size = renderer.getSize(new Vector2());
			this.inputBuffer.setSize(size.x, size.y);
			this.outputBuffer.setSize(size.x, size.y);

			for (const pass of this._passes) {
				pass.initialize(renderer, renderer.getContext().getContextAttributes().alpha, this.inputBuffer.texture.type);
			}
		}
	}

	_createBuffer(depthBuffer, stencilBuffer, type, multisampling) {
		const target = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer,
			depthBuffer,
			type: type || UnsignedByteType
		});
		if (multisampling > 0) {
			target.samples = multisampling;
		}
		return target;
	}

	_createDepthTexture() {
		const depthTexture = new DepthTexture();
		depthTexture.format = DepthStencilFormat;
		depthTexture.type = UnsignedInt248Type;
		this.inputBuffer.depthTexture = depthTexture;
		this._depthTexture = depthTexture;

		this._depthRenderTarget = new WebGLRenderTarget(
			this.inputBuffer.width,
			this.inputBuffer.height,
			{
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				stencilBuffer: false
			}
		);
		this._depthRenderTarget.depthTexture = depthTexture.clone();
		this._depthRenderTarget.depthTexture.format = DepthStencilFormat;
		this._depthRenderTarget.depthTexture.type = UnsignedInt248Type;
	}

	_deleteDepthTexture() {
		if (this._depthTexture !== null) {
			this._depthTexture.dispose();
			this.inputBuffer.depthTexture = null;
			this._depthTexture = null;
		}
		if (this._depthRenderTarget !== null) {
			this._depthRenderTarget.dispose();
			this._depthRenderTarget = null;
		}
		for (const pass of this._passes) {
			pass.setDepthTexture(null);
		}
	}

	setMainScene(scene) {
		for (const pass of this._passes) {
			pass.mainScene = scene;
		}
	}

	setMainCamera(camera) {
		for (const pass of this._passes) {
			pass.mainCamera = camera;
		}
	}

	addPass(pass, index) {
		const passes = this._passes;
		const renderer = this.renderer;

		if (index !== undefined) {
			passes.splice(index, 0, pass);
		} else {
			passes.push(pass);
		}

		if (pass.needsDepthTexture) {
			if (this._depthTexture === null) {
				this._createDepthTexture();
			}
			pass.setDepthTexture(this._depthTexture);
		}

		if (renderer !== null) {
			const alpha = renderer.getContext().getContextAttributes()?.alpha || false;
			pass.initialize(renderer, alpha, this.inputBuffer.texture.type);
			pass.setSize(this.inputBuffer.width, this.inputBuffer.height);
		}

		if (this.autoRenderToScreen) {
			this._updateLastPassRenderToScreen();
		}
	}

	removePass(pass) {
		const passes = this._passes;
		const idx = passes.indexOf(pass);
		if (idx !== -1) {
			passes.splice(idx, 1);
		}

		if (pass.needsDepthTexture) {
			const needsDepth = passes.some(p => p.needsDepthTexture);
			if (!needsDepth) {
				this._deleteDepthTexture();
			}
		}

		if (this.autoRenderToScreen) {
			this._updateLastPassRenderToScreen();
		}
	}

	removeAllPasses() {
		for (const pass of this._passes) {
			pass.dispose();
		}
		this._passes.length = 0;
		this._deleteDepthTexture();
	}

	_updateLastPassRenderToScreen() {
		const passes = this._passes;
		for (let i = 0; i < passes.length; i++) {
			passes[i].renderToScreen = false;
		}
		for (let i = passes.length - 1; i >= 0; i--) {
			if (passes[i].enabled) {
				passes[i].renderToScreen = true;
				break;
			}
		}
	}

	render(deltaTime) {
		const passes = this._passes;
		const renderer = this.renderer;
		const timer = this.timer;

		if (deltaTime === undefined) {
			timer.update();
			deltaTime = timer.delta;
		}

		let inputBuffer = this.inputBuffer;
		let outputBuffer = this.outputBuffer;
		let stencilTest = false;

		for (const pass of passes) {
			if (!pass.enabled) continue;

			pass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);

			if (pass.needsSwap) {
				if (stencilTest) {
					// Copy stencil data
				}
				const tmp = inputBuffer;
				inputBuffer = tmp === this.inputBuffer ? this.outputBuffer : this.inputBuffer;
				outputBuffer = tmp;
				this.inputBuffer = inputBuffer;
				this.outputBuffer = outputBuffer;
			}

			if (pass.constructor.name === "MaskPass") {
				stencilTest = true;
			} else if (pass.constructor.name === "ClearMaskPass") {
				stencilTest = false;
			}
		}
	}

	setSize(width, height, updateStyle) {
		const renderer = this.renderer;
		if (renderer !== null) {
			renderer.setSize(width, height, updateStyle);
		}
		this.inputBuffer.setSize(width, height);
		this.outputBuffer.setSize(width, height);

		if (this._depthRenderTarget !== null) {
			this._depthRenderTarget.setSize(width, height);
		}

		for (const pass of this._passes) {
			pass.setSize(width, height);
		}
	}

	reset() {
		this.dispose();
		this.autoRenderToScreen = true;
	}

	dispose() {
		for (const pass of this._passes) {
			pass.dispose();
		}

		this._passes.length = 0;
		this.inputBuffer.dispose();
		this.outputBuffer.dispose();
		this._deleteDepthTexture();
		this.timer.dispose();
	}

}
