export class RawImageData {

	constructor(width = 0, height = 0, data = null) {
		this.width = width;
		this.height = height;
		this.data = data;
	}

	toCanvas() {
		if (typeof document === "undefined") {
			return null;
		}

		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		canvas.width = this.width;
		canvas.height = this.height;

		if (this.data instanceof Image) {
			context.drawImage(this.data, 0, 0);
		} else {
			const imageData = context.createImageData(this.width, this.height);
			imageData.data.set(this.data);
			context.putImageData(imageData, 0, 0);
		}

		return canvas;
	}

	static from(image) {
		const { width, height } = image;
		let data;

		if (typeof Image !== "undefined" && image instanceof Image) {
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");
			canvas.width = width;
			canvas.height = height;
			context.drawImage(image, 0, 0);
			data = context.getImageData(0, 0, width, height).data;
		} else {
			data = image.data;
		}

		return new RawImageData(width, height, data);
	}

}
