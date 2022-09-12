import { writeGeometry } from "../render/geometry";

export function createSphere(radius: number, precision = 8) {
	const widthSegments = precision, heightSegments = precision, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI
	const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

	let index = 0;
	const grid = [];

	const indices = [];
	const verticesArray: number[][] = [];
	const normalsArray: number[][] = [];
	const uvsArray: number[][] = [];

	for (let iy = 0; iy <= heightSegments; iy++) {
		const verticesRow = [];
		const v = iy / heightSegments;
		let uOffset = 0;

		if (iy == 0 && thetaStart == 0) {
			uOffset = 0.5 / widthSegments;
		} else if (iy == heightSegments && thetaEnd == Math.PI) {
			uOffset = - 0.5 / widthSegments;
		}

		for (let ix = 0; ix <= widthSegments; ix++) {
			const u = ix / widthSegments;
			const x = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
			const y = radius * Math.cos(thetaStart + v * thetaLength);
			const z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
			verticesArray.push([x, y, z]);
			normalsArray.push([x, y, z]);
			uvsArray.push([u + uOffset, 1 - v]);
			verticesRow.push(index++);
		}

		grid.push(verticesRow);
	}

	for (let iy = 0; iy < heightSegments; iy++) {
		for (let ix = 0; ix < widthSegments; ix++) {
			const a = grid[iy][ix + 1];
			const b = grid[iy][ix];
			const c = grid[iy + 1][ix];
			const d = grid[iy + 1][ix + 1];

			if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
			if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
		}
	}

	const vertecies: number[] = [];
	const normals: number[] = [];
	const uvs: number[] = [];

	let i = 0;
	while (i < indices.length) {
		const a = indices[i++];
		const b = indices[i++];
		const c = indices[i++];
		vertecies.push(...verticesArray[a], ...verticesArray[b], ...verticesArray[c]);
		normals.push(...normalsArray[a], ...normalsArray[b], ...normalsArray[c]);
		uvs.push(...uvsArray[a], ...uvsArray[b], ...uvsArray[c]);
	}

	return writeGeometry({ vertecies, normals, uvs });
}