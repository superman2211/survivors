export function createPlane(width: number, height: number): Float32Array {
	const w = width / 2;
	const h = height / 2;

	return new Float32Array([
		w, h, 0,
		0, 0, 1,
		1, 1,

		-w, h, 0,
		0, 0, 1,
		0, 1,

		-w, -h, 0,
		0, 0, 1,
		0, 0,

		w, h, 0,
		0, 0, 1,
		1, 1,

		-w, -h, 0,
		0, 0, 1,
		0, 0,

		w, -h, 0,
		0, 0, 1,
		1, 0,
	]);

}