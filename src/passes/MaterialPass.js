import { Pass } from "./Pass.js";

export class MaterialPass extends Pass {

	constructor(material, inputUniform = "inputBuffer") {
		super("MaterialPass");
		this.fullscreenMaterial = material;
		this.inputUniform = inputUniform;
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const uniforms = this.fullscreenMaterial.uniforms;
		if (inputBuffer !== null && uniforms && uniforms[this.inputUniform]) {
			uniforms[this.inputUniform].value = inputBuffer.texture;
		}
		renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
		renderer.render(this.scene, this.camera);
	}

	initialize(renderer, alpha, frameBufferType) {
		if (frameBufferType !== undefined && frameBufferType !== 1009) {
			if (this.fullscreenMaterial.defines) {
				this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
			}
		}
	}

}
