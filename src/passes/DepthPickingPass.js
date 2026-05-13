import { BasicDepthPacking, FloatType, REVISION, RGBADepthPacking } from "three";
import { DepthCopyMode } from "../enums/index.js";
import { DepthCopyPass } from "./DepthCopyPass.js";

const threeRevision = Number(REVISION.replace(/\D+/g, ""));
const unpackDownscale = 255 / 256;

const unpackFactorsLegacy = new Float32Array([
	unpackDownscale / (256 ** 3),
	unpackDownscale / (256 ** 2),
	unpackDownscale / 256,
	unpackDownscale
]);

const unpackFactors = new Float32Array([
	unpackDownscale,
	unpackDownscale / 256,
	unpackDownscale / (256 ** 2),
	1 / (256 ** 3)
]);

function unpackRGBAToDepth(packedDepth) {
	const f = (threeRevision >= 167) ? unpackFactors : unpackFactorsLegacy;
	return (
		packedDepth[0] * f[0] +
		packedDepth[1] * f[1] +
		packedDepth[2] * f[2] +
		packedDepth[3] * f[3]
	) / 255;
}

export class DepthPickingPass extends DepthCopyPass {

	constructor({ depthPacking = RGBADepthPacking, mode = DepthCopyMode.SINGLE } = {}) {
		super({ depthPacking });

		this.name = "DepthPickingPass";
		this.fullscreenMaterial.mode = mode;

		this.pixelBuffer = (depthPacking === RGBADepthPacking)
			? new Uint8Array(4)
			: new Float32Array(4);

		this.callback = null;
	}

	readDepth(ndc) {
		this.fullscreenMaterial.texelPosition.set(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);
		return new Promise((resolve) => {
			this.callback = resolve;
		});
	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
		const material = this.fullscreenMaterial;
		const mode = material.mode;

		if (mode === DepthCopyMode.FULL) {
			super.render(renderer);
		}

		if (this.callback !== null) {
			const renderTarget = this.renderTarget;
			const pixelBuffer = this.pixelBuffer;
			const packed = (renderTarget.texture.type !== FloatType);

			let x = 0, y = 0;

			if (mode === DepthCopyMode.SINGLE) {
				super.render(renderer);
			} else {
				const texelPosition = material.texelPosition;
				x = Math.round(texelPosition.x * renderTarget.width);
				y = Math.round(texelPosition.y * renderTarget.height);
			}

			renderer.readRenderTargetPixels(renderTarget, x, y, 1, 1, pixelBuffer);
			this.callback(packed ? unpackRGBAToDepth(pixelBuffer) : pixelBuffer[0]);
			this.callback = null;
		}
	}

	setSize(width, height) {
		if (this.fullscreenMaterial.mode === DepthCopyMode.FULL) {
			super.setSize(width, height);
		}
	}

}
