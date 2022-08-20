import { FILL, PATH } from '../graphics/shape';
import {
	cos, random, sin, randomInt,
} from './math';

export function generateShape(
	array: number[],
	color: number,
	x: number, y: number,
	countMin: number, countMax: number,
	radiusMin: number, radiusMax: number,
	angle?: number,
) {
	let count = randomInt(countMin, countMax);

	array.push(PATH, count);

	const angleStep = Math.PI * 2 / count;
	if (angle === undefined) {
		angle = Math.PI * random();
	}

	while (count--) {
		array.push(
			x + sin(angle) * randomInt(radiusMin, radiusMax),
			y + cos(angle) * randomInt(radiusMin, radiusMax),
		);
		angle += angleStep;
	}

	array.push(FILL, color);
}
