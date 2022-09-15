import { createM4, transformV3 } from "../geom/matrix";
import { createV3, crossV3, normalizeV3 } from "../geom/vector";

export interface Geometry {
	vertecies: number[];
	normals: number[];
	uvs: number[];
}

const vector = createV3();
const normalsMatrix = createM4();

export const ELEMENT_SIZE = 3 + 3 + 2;

export function writeGeometry(geometry: Geometry): Float32Array {
	const { vertecies, normals, uvs } = geometry;

	const data = new Float32Array(vertecies.length / 3 * ELEMENT_SIZE);

	let p = 0; // stream
	let v = 0; // postition
	let n = 0; // normal
	let t = 0; // texture coordinate

	while (v < vertecies.length) {
		data[p++] = vertecies[v++];
		data[p++] = vertecies[v++];
		data[p++] = vertecies[v++];
		data[p++] = normals[n++];
		data[p++] = normals[n++];
		data[p++] = normals[n++];
		data[p++] = uvs[t++];
		data[p++] = uvs[t++];
	}

	return data;
}

export function transformGeometry(data: Float32Array | number[], matrix: Float32Array, stream: Float32Array | number[], p: number): number {
	normalsMatrix.set(matrix);
	normalsMatrix[12] = 0;
	normalsMatrix[13] = 0;
	normalsMatrix[14] = 0;
	normalsMatrix[15] = 1;

	let i = 0;
	while (i < data.length) {
		vector[0] = data[i++];
		vector[1] = data[i++];
		vector[2] = data[i++];
		transformV3(matrix, vector, vector);
		stream[p++] = vector[0];
		stream[p++] = vector[1];
		stream[p++] = vector[2];

		vector[0] = data[i++];
		vector[1] = data[i++];
		vector[2] = data[i++];
		transformV3(normalsMatrix, vector, vector);
		stream[p++] = vector[0];
		stream[p++] = vector[1];
		stream[p++] = vector[2];

		stream[p++] = data[i++];
		stream[p++] = data[i++];
	}

	return p;
}

export function updateNormals(data: Float32Array | number[]) {
	const u = createV3();
	const v = createV3();
	const n = createV3();

	for (let i = 0; i < data.length; i += ELEMENT_SIZE * 3) {
		let i0 = i + 0 * ELEMENT_SIZE;
		let i1 = i + 1 * ELEMENT_SIZE;
		let i2 = i + 2 * ELEMENT_SIZE;

		u[0] = data[i1 + 0] - data[i0 + 0];
		u[1] = data[i1 + 1] - data[i0 + 1];
		u[2] = data[i1 + 2] - data[i0 + 2];

		v[0] = data[i2 + 0] - data[i0 + 0];
		v[1] = data[i2 + 1] - data[i0 + 1];
		v[2] = data[i2 + 2] - data[i0 + 2];

		crossV3(u, v, n);
		normalizeV3(n, n);

		i0 += 3;
		i1 += 3;
		i2 += 3;

		data[i0 + 0] = n[0];
		data[i0 + 1] = n[1];
		data[i0 + 2] = n[2];

		data[i1 + 0] = n[0];
		data[i1 + 1] = n[1];
		data[i1 + 2] = n[2];

		data[i2 + 0] = n[0];
		data[i2 + 1] = n[1];
		data[i2 + 2] = n[2];
	}
}

export function smoothNormals(data: Float32Array | number[]) {
	const n = createV3();

	const map = new Map<number, number[]>();

	for (let i = 0; i < data.length; i += ELEMENT_SIZE) {
		const hash = data[i + 0] + data[i + 1] * 1000 + data[i + 2] * 1000000;
		if (!map.has(hash)) {
			map.set(hash, []);
		}
		map.get(hash)!.push(i);
	}

	for (const [hash, verts] of map) {
		n[0] = 0;
		n[1] = 0;
		n[2] = 0;
		for (const v of verts) {
			n[0] += data[v + 3 + 0];
			n[1] += data[v + 3 + 1];
			n[2] += data[v + 3 + 2];
		}
		const vertsLength = verts.length;
		n[0] /= vertsLength;
		n[1] /= vertsLength;
		n[2] /= vertsLength;
		for (const v of verts) {
			data[v + 3 + 0] = n[0];
			data[v + 3 + 1] = n[1];
			data[v + 3 + 2] = n[2];
		}
	};
}

export function transformUV(data: Float32Array, uvTransform: number[]) {
	const [du, dv, su, sv] = uvTransform;
	for (let i = 0; i < data.length; i += ELEMENT_SIZE) {
		data[i + 6 + 0] = du + data[i + 6 + 0] * su;
		data[i + 6 + 1] = dv + data[i + 6 + 1] * sv;
	}
}