import { Component } from "../../graphics/component";
import { createPlane } from "../../models/plane";
import { createBox } from "../../physics/body";
import { mathPI2 } from "../../utils/math";
import { World } from "../world";
import { generateRoofImage, generateWallImage } from "./textures/wall";

const SIZE = 256;

const geometry = createPlane(SIZE, SIZE);

const wall1 = generateWallImage(
	SIZE, SIZE,
	[0xff666666, 0xff777777, 0xff555555],
	[0, 0x99aaaaaa, 0x99bbbbbb],
	10, 20, 100
);

const wall2 = generateWallImage(
	SIZE, SIZE,
	[0xff222222, 0xff111111, 0xff333333],
	[0, 0xaa964300, 0xaa804030],
	10, 20, 100
);

const wall3 = generateWallImage(
	SIZE, SIZE,
	[0xff777799, 0xff666699, 0xff665577],
	[0, 0, 0],
	10, 20, 0
);

const wall4 = generateWallImage(
	SIZE, SIZE,
	[0xff666666, 0xff777777, 0xff555555],
	[0, 0x99aaaaaa, 0x99bbbbbb],
	7, 7, 500
);

const roofImage = generateRoofImage(SIZE);

export function generateHouses(world: World) {
	const houses = [
		{ stages: 3, x: 200, y: 200, px: 4, py: 4, image: wall1 },
		{ stages: 2, x: -1500, y: 200, px: 3, py: 4, image: wall2 },
		{ stages: 4, x: -1500, y: -1800, px: 3, py: 4, image: wall3 },
		{ stages: 2, x: 300, y: -1800, px: 4, py: 3, image: wall4 },
	];

	for (const house of houses) {
		const { x, y, px, py, stages, image } = house;

		const children: Component[] = [];

		const base = {
			geometry,
			image,
		}

		for (let j = 0; j < stages; j++) {
			for (let i = 0; i < px; i++) {
				const coords = {
					x: x + i * SIZE + SIZE / 2,
					z: j * SIZE + SIZE / 2,
				};

				children.push({
					...base,
					...coords,
					y,
					rotationX: mathPI2,
				});

				children.push({
					...base,
					...coords,
					y: y + py * SIZE,
					rotationX: -mathPI2,
				});
			}

			for (let i = 0; i < py; i++) {
				const coords = {
					y: y + i * SIZE + SIZE / 2,
					z: j * SIZE + SIZE / 2,
				};

				children.push({
					...base,
					...coords,
					x,
					rotationX: -mathPI2,
					rotationZ: mathPI2,
				});

				children.push({
					...base,
					...coords,
					x: x + px * SIZE,
					rotationX: mathPI2,
					rotationZ: mathPI2,
				});
			}
		}

		children.push({
			geometry,
			image: roofImage,
			x: x + px * SIZE / 2,
			y: y + py * SIZE / 2,
			z: SIZE * stages,
			scaleX: px,
			scaleY: py,
		});

		const body = {
			...createBox(x, y, px * SIZE, py * SIZE, 0),
			static: true,
		};
		world.addObject({ x: 0, y: 0, children, body });
	}
}