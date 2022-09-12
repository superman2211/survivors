import { writeGeometry } from "../render/geometry";

export function createPlane(width: number, height: number): Float32Array {
	const w = width / 2;
	const h = height / 2;

	const vertecies = [
		w, h, 0,
		-w, h, 0,
		-w, -h, 0,

		w, h, 0,
		-w, -h, 0,
		w, -h, 0,
	];

	const normals = [
		0, 0, 1, 
		0, 0, 1, 
		0, 0, 1,

		0, 0, 1, 
		0, 0, 1, 
		0, 0, 1, 
	];

	const uvs = [
		1, 1, 0, 1, 0, 0,
		1, 1, 0, 0, 1, 0,
	];

	return writeGeometry({ vertecies, normals, uvs });
}