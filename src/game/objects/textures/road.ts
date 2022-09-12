import { CommandType, generateImage } from "../../../utils/image"
import { generateMaterial } from "../../../utils/material";

export function generateAsphalt(size: number) {
	return generateMaterial(size, size, 0xff666666, [
		0xff999999, 0.5, 1, 10000,
		0xff777777, 0.5, 2, 5000,
	]);
}

function generateLine(width: number, height: number) {
	return generateMaterial(width, height, 0, [
		0x99aaaaaa, 0.5, 2, 100,
	]);
}

export function generateBorder(width: number, height: number) {
	return generateMaterial(width, height, 0xff999999, [
		0xffdddddd, 1, 2, 100,
		0xffaaaaaa, 0.5, 1, 100,
	]);
}

export function generateRoad(size: number) {
	const image = generateAsphalt(size);
	const context = image.getContext('2d')!;

	// lines
	const lineW = size * 0.10;
	const lineH = size * 0.01;
	let y = size / 2 - lineH / 2;
	for (let x = 0; x < image.width; x += lineW * 2) {
		const line = generateLine(lineW, lineH);
		context.drawImage(line, x, y);
	}
	
	// borders
	const borderW = size * 0.15;
	const borderH = size * 0.02;
	const borderD = size * 0.01;
	y = 0;
	for (let x = 0; x < image.width; x += borderW + borderD) {
		const border = generateBorder(borderW, borderH);
		context.drawImage(border, x, y);
	}
	y = size - borderH;
	for (let x = 0; x < image.width; x += borderW + borderD) {
		const border = generateBorder(borderW, borderH);
		context.drawImage(border, x, y);
	}
	
	return image;
}
