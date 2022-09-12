import { generateMaterial } from "../../../utils/material";
import { generateBorder } from "./road";

export function generateGrass(size: number) {
	return generateMaterial(size, size, 0xff5b8224, [
		0xff86ab48, 0.5, 1, 10000,
		0xff4e730c, 0.5, 2, 5000,
	]);
}

export function generateGrassSidewalk(size: number) {
	const image = generateGrass(size);
	const context = image.getContext('2d')!;

	const borderD = size * 0.005;
	const borderW = size * 0.1 - borderD;
	const borderH = size * 0.1;
	let y = borderD;
	for (let x = borderD; x < image.width; x += borderW + borderD) {
		const border = generateBorder(borderW, borderH);
		context.drawImage(border, x, y);
	}

	return image;
}