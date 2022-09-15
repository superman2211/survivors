import { updateNormals, writeGeometry } from "../render/geometry";
import { createV3, crossV3, normalizeV3 } from "../geom/vector";

export const CUBE_POINTS = 6 * 2 * 3;

export function createCube(width: number, height: number, length: number): Float32Array {
	const w = width / 2;
	const h = height / 2;
	const l = length / 2;
	
	const vertecies = [
		// front
		w, h, l,
		-w, h, l,
		-w, -h, l,
		w, h, l,
		-w, -h, l,
		w, -h, l,

		// right
		w, h, -l,
		w, h, l,
		w, -h, l,
		w, h, -l,
		w, -h, l,
		w, -h, -l,

		// up
		w, h, -l,
		-w, h, -l,
		-w, h, l,
		w, h, -l,
		-w, h, l,
		w, h, l,

		// left
		-w, h, l,
		-w, h, -l,
		-w, -h, -l,
		-w, h, l,
		-w, -h, -l,
		-w, -h, l,

		// back
		-w, h, -l,
		w, h, -l,
		w, -h, -l,
		-w, h, -l,
		w, -h, -l,
		-w, -h, -l,

		// down
		w, -h, l,
		-w, -h, l,
		-w, -h, -l,
		w, -h, l,
		-w, -h, -l,
		w, -h, -l
	];

	const normals = vertecies;

	const uvs = [
		1, 1, 0, 1, 0, 0, // front
		1, 1, 0, 0, 1, 0,
		1, 1, 0, 1, 0, 0, // right
		1, 1, 0, 0, 1, 0,
		1, 1, 0, 1, 0, 0, // up
		1, 1, 0, 0, 1, 0,
		1, 1, 0, 1, 0, 0, // left
		1, 1, 0, 0, 1, 0,
		1, 1, 0, 1, 0, 0, // back
		1, 1, 0, 0, 1, 0,
		1, 1, 0, 1, 0, 0, // down
		1, 1, 0, 0, 1, 0
	]

	const data = writeGeometry({ vertecies, normals, uvs });
	updateNormals(data);
	return data;
}