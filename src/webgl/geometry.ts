import { createM4, createV3, inverseM4, transformV3, transposeM4 } from "./m4";

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