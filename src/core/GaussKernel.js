function computePascalRow(n) {
	if (n === 0) return new Float64Array(0);
	if (n === 1) return new Float64Array([1]);

	let prev = new Float64Array(n);
	let curr = new Float64Array(n);

	for (let row = 1; row <= n; row++) {
		for (let col = 0; col < row; col++) {
			curr[col] = (col === 0 || col === row - 1) ? 1 : prev[col - 1] + prev[col];
		}
		const tmp = prev;
		prev = curr;
		curr = tmp;
	}

	return prev;
}

export class GaussKernel {

	constructor(kernelSize, edgeBias = 2) {
		this.weights = null;
		this.offsets = null;
		this.linearWeights = null;
		this.linearOffsets = null;
		this._generate(kernelSize, edgeBias);
	}

	get steps() {
		return this.offsets === null ? 0 : this.offsets.length;
	}

	get linearSteps() {
		return this.linearOffsets === null ? 0 : this.linearOffsets.length;
	}

	_generate(kernelSize, edgeBias) {
		if (kernelSize < 3 || kernelSize > 1020) {
			throw new Error("Kernel size must be in range [3, 1020]");
		}

		const totalSize = kernelSize + edgeBias * 2;
		let coeffs = computePascalRow(totalSize);
		if (edgeBias > 0) {
			coeffs = coeffs.slice(edgeBias, -edgeBias);
		}

		const center = Math.floor((coeffs.length - 1) / 2);
		const total = coeffs.reduce((a, b) => a + b, 0);

		const halfWeights = coeffs.slice(center);
		const halfOffsets = [...Array(center + 1).keys()];

		const linCount = Math.floor(halfOffsets.length / 2);
		const linWeights = new Float64Array(linCount);
		const linOffsets = new Float64Array(linCount);
		linWeights[0] = halfWeights[0] / total;

		for (let i = 1, j = 1; i < halfOffsets.length - 1; i += 2, j++) {
			const w0 = halfWeights[i];
			const w1 = halfWeights[i + 1];
			const o0 = halfOffsets[i];
			const o1 = halfOffsets[i + 1];
			const combined = w0 + w1;
			linWeights[j] = combined / total;
			linOffsets[j] = (o0 * w0 + o1 * w1) / combined;
		}

		const invTotal = 1.0 / total;
		for (let i = 0; i < halfWeights.length; i++) {
			halfWeights[i] *= invTotal;
		}

		const linSum = (linWeights.reduce((a, b) => a + b, 0) - linWeights[0] * 0.5) * 2.0;
		if (linSum !== 0) {
			const inv = 1.0 / linSum;
			for (let i = 0; i < linWeights.length; i++) {
				linWeights[i] *= inv;
			}
		}

		this.weights = halfWeights;
		this.offsets = halfOffsets;
		this.linearWeights = linWeights;
		this.linearOffsets = linOffsets;
	}

}
