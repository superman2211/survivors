import { FILL, PATH } from '../graphics/shape';
import {
	mathCos, mathRandom, mathSin, randomInt,
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
		angle = Math.PI * mathRandom();
	}

	while (count--) {
		array.push(
			x + mathSin(angle) * randomInt(radiusMin, radiusMax),
			y + mathCos(angle) * randomInt(radiusMin, radiusMax),
		);
		angle += angleStep;
	}

	array.push(FILL, color);
}
