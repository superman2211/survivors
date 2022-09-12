import { Component } from "../../graphics/component";
import { mathHypot, mathPI } from "../../utils/math";
import { createPlane } from "../../models/plane";
import { generateGrass, generateGrassSidewalk } from "./textures/grass";
import { generateAsphalt, generateRoad } from "./textures/road";

const SIZE = 512;
const COLS = 7;

const geometry = createPlane(SIZE, SIZE);

const tilesMap = [
	0, 0, 7, 2, 6, 0, 0,
	0, 0, 7, 2, 6, 0, 0,
	5, 5, 5, 2, 5, 5, 5,
	1, 1, 1, 3, 1, 1, 1,
	4, 4, 4, 2, 4, 4, 4,
	0, 0, 7, 2, 6, 0, 0,
	0, 0, 7, 2, 6, 0, 0,
]

const grassImage = generateGrass(SIZE);
const grassSidewalkImage = generateGrassSidewalk(SIZE);
const roadImage = generateRoad(SIZE);
const asphaltImage = generateAsphalt(SIZE);

export function createGrass(): Component {
	return {
		geometry,
		image: grassImage,
	}
}

export function createGrassH(): Component {
	return {
		geometry,
		image: grassSidewalkImage,
	}
}

export function createGrassHI(): Component {
	return {
		...createGrassH(),
		rotationZ: mathPI
	}
}

export function createGrassV(): Component {
	return {
		...createGrassH(),
		rotationZ: mathPI / 2
	}
}

export function createGrassVI(): Component {
	return {
		...createGrassH(),
		rotationZ: -mathPI / 2
	}
}

export function createRoadH(): Component {
	return {
		geometry,
		image: roadImage
	}
}

export function createRoadV(): Component {
	return {
		...createRoadH(),
		rotationZ: mathPI / 2
	}
}

export function createRoadX(): Component {
	return {
		geometry,
		image: asphaltImage
	}
}

const tilesObjects = [
	createGrass(),
	createRoadH(),
	createRoadV(),
	createRoadX(),
	createGrassH(),
	createGrassHI(),
	createGrassVI(),
	createGrassV(),
]

export function createGround(): Component[] {
	const radius = mathHypot(SIZE) / 2;
	const children: Component[] = [];

	const start = -7 / 2 * SIZE;
	let x = start;
	let y = start;
	let cols = 0;

	for (const t of tilesMap) {
		const tile = {
			...tilesObjects[t],
			radius,
			x, y,
		} as Component;
		children.push(tile);

		x += SIZE;
		cols++;
		if (cols >= COLS) {
			cols = 0;
			x = start;
			y += SIZE;
		}
	}

	return children;
}