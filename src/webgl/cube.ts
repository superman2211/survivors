import { Geometry } from "./geometry";
import { createV3, crossV3, normalizeV3 } from "./m4";

export function createCube(w: number, h: number, l: number): Geometry {
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

	const normals = [];

	const u = createV3();
	const v = createV3();
	const n = createV3();

	for (let i = 0; i < vertecies.length; i += 3 * 6) {
		u[0] = vertecies[i + 3 + 0] - vertecies[i + 0];
		u[1] = vertecies[i + 3 + 1] - vertecies[i + 1];
		u[2] = vertecies[i + 3 + 2] - vertecies[i + 2];

		v[0] = vertecies[i + 6 + 0] - vertecies[i + 0];
		v[1] = vertecies[i + 6 + 1] - vertecies[i + 1];
		v[2] = vertecies[i + 6 + 2] - vertecies[i + 2];

		crossV3(u, v, n);
		normalizeV3(n, n);

		normals.push(...n);
		normals.push(...n);
		normals.push(...n);

		normals.push(...n);
		normals.push(...n);
		normals.push(...n);
	}

	return { vertecies, normals };
}