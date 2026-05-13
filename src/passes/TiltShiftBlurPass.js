import { KawaseBlurPass } from "./KawaseBlurPass.js";
import { TiltShiftBlurMaterial } from "../materials/TiltShiftBlurMaterial.js";
import { KernelSize } from "../enums/index.js";

export class TiltShiftBlurPass extends KawaseBlurPass {

	constructor({
		offset = 0.0,
		rotation = 0.0,
		focusArea = 0.4,
		feather = 0.3,
		kernelSize = KernelSize.MEDIUM,
		resolutionScale = 0.5,
		resolutionX,
		resolutionY
	} = {}) {
		super({ kernelSize, resolutionScale, resolutionX, resolutionY });

		this.name = "TiltShiftBlurPass";

		this.blurMaterial = new TiltShiftBlurMaterial({
			kernelSize,
			offset,
			rotation,
			focusArea,
			feather
		});
	}

	get tiltShiftMaterial() {
		return this.blurMaterial;
	}

	get offset() {
		return this.blurMaterial.offset;
	}

	set offset(value) {
		this.blurMaterial.offset = value;
	}

	get rotation() {
		return this.blurMaterial.rotation;
	}

	set rotation(value) {
		this.blurMaterial.rotation = value;
	}

	get focusArea() {
		return this.blurMaterial.focusArea;
	}

	set focusArea(value) {
		this.blurMaterial.focusArea = value;
	}

	get feather() {
		return this.blurMaterial.feather;
	}

	set feather(value) {
		this.blurMaterial.feather = value;
	}

}
