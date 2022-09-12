export function createV3(): Float32Array {
	return new Float32Array(3);
}

export function normalizeV3(v: Float32Array, dst: Float32Array) {
	const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

export function subtractV3(a: Float32Array, b: Float32Array, dst: Float32Array) {
	dst[0] = a[0] - b[0];
	dst[1] = a[1] - b[1];
	dst[2] = a[2] - b[2];
	return dst;
}

export function crossV3(a: Float32Array, b: Float32Array, dst: Float32Array) {
	dst[0] = a[1] * b[2] - a[2] * b[1];
	dst[1] = a[2] * b[0] - a[0] * b[2];
	dst[2] = a[0] * b[1] - a[1] * b[0];
	return dst;
}
