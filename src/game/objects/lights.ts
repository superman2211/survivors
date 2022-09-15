import { createM4, transformM4 } from "../../geom/matrix";
import { createCube } from "../../models/cube";
import { createSphere } from "../../models/sphere";
import { transformGeometry } from "../../render/geometry";
import { addLight } from "../../render/render";
import { generateMaterial } from "../../utils/material";
import { World, WorldObject } from "../world";

function createGeometry(height: number, width: number) {
	const cube = createCube(width, width, height);
	const sphere = createSphere(width * 3, 8);
	const data: number[] = [];

	const matrix = createM4();
	
	let p = 0;

	transformM4(matrix, 0, 0, height / 2);
	p = transformGeometry(cube, matrix, data, p);

	transformM4(matrix, 0, 0, height, 0, 0, 0, 1, 1, 0.1);
	p = transformGeometry(sphere, matrix, data, p);

	return new Float32Array(data);
}

export function generateLights(world: World) {
	const lights = [
		{ x: 300, y: 70 },
		{ x: -1000, y: 70 },
		{ x: 300, y: -600 },
		{ x: -1000, y: -600 },
	]

	const height = 300;
	const width = 10;
	const geometry = createGeometry(height, width);
	const image = generateMaterial(64, 64, 0xff333333, [
		0xff222222, 0.5, 2, 20,
		0xff111111, 0.5, 2, 10,
	]);

	for (const border of lights) {
		const { x, y } = border;
		const box: WorldObject = {
			geometry,
			image,
			x,
			y,
			body: {
				weight: 0,
				radius: width,
				static: true,
			}
		}
		addLight([x, y, height]);
		world.addObject(box);
	}
}