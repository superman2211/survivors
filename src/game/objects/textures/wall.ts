import { generateMaterial } from "../../../utils/material";

export function generateWallImage(width: number, height: number, wallColors: number[], brickColors: number[], brickW: number, brickH: number, brickParticles: number) {
	const image = generateMaterial(width, height, wallColors[0], [
		wallColors[1], 0.1, 2, 10000,
		wallColors[2], 0.1, 2, 10000,
	]);
	const context = image.getContext('2d')!;

	const border = 2;
	const brickSizeW = width / brickW - border;
	const brickSizeH = height / brickH - border;

	for (let x = 0; x < brickW + 1; x++) {
		for (let y = 0; y < brickH; y++) {
			const offset = brickW == brickH ? 0 : y % 2;

			const brick = generateMaterial(brickSizeW, brickSizeH, brickColors[0], [
				brickColors[1], 0.1, 2, brickParticles,
				brickColors[2], 0.1, 2, brickParticles,
			]);

			context.drawImage(
				brick,
				x * (brickSizeW + border) - brickSizeW / 2 * offset,
				y * (brickSizeH + border)
			);
		}
	}

	const window = generateMaterial(width / 2, height / 2, 0xff222222, [
		0x99292929, 3, 5, 100
	]);
	context.drawImage(window, width / 4, height / 4);
	return image;
}

export function generateRoofImage(size: number) {
	return generateMaterial(size, size, 0xff000000, [
		0xff333333, 1, 3, 100,
	]);
}