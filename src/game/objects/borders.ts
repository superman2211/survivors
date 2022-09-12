import { createCube } from "../../models/cube";
import { createBox } from "../../physics/body";
import { generateMaterial } from "../../utils/material";
import { mathPI, randomFloat } from "../../utils/math";
import { World, WorldObject } from "../world";

export function generateBorders(world: World) {
	const borders = [
		{ x0: 1300, y0: 400, x1: 1450, y1: -1200, count: 10 },
		{ x0: -1600, y0: 400, x1: -1600, y1: -1100, count: 10 },
		{ x0: 400, y0: 1300, x1: -800, y1: 1300, count: 7 },
		{ x0: 500, y0: -1870, x1: -800, y1: -1870, count: 8 },
	]

	const size = 128;
	const geometry = createCube(size, size, size);
	const image = generateMaterial(size, size, 0xffffffff, [
		0xffaaaaaa, 0.5, 2, 200,
		0xffbbbbbb, 0.5, 2, 100,
	]);

	for (const border of borders) {
		const { x0, y0, x1, y1, count } = border;
		let i = 0;
		while (i++ < count) {
			const rotation = randomFloat(-0.25, 0.25);
			const xx = x0 + (x1 - x0) * i / count;
			const yy = y0 + (y1 - y0) * i / count;
			const box: WorldObject = {
				geometry,
				image,
				x: xx,
				y: yy,
				z: size / 2,
				rotationZ: rotation,
				body: {
					...createBox(- size / 2, - size / 2, size, size, rotation),
					static: true,
				}
			}
			world.addObject(box);
		}
	}
}