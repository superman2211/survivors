import { FILL, PATH } from '../graphics/shape';
import {
	math2PI,
	mathCos, mathPI, mathRandom, mathSin, randomInt,
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

	const angleStep = math2PI / count;
	if (angle === undefined) {
		angle = mathPI * mathRandom();
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
