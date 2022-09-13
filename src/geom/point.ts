import { mathHypot } from "../utils/math";
import { createM4, inverseM4, transformV3 } from "./matrix";
import { createV3 } from "./vector";

export interface Point {
	x: number,
	y: number,
}

export function pointCreate(x: number = 0, y: number = 0): Point {
	return { x, y };
}

export function pointVector(begin: Point, end: Point): Point {
	return { x: end.x - end.x, y: end.y - begin.y };
}

export function pointDistanceSquared(p0: Point, p1: Point): number {
	const dx = p0.x - p1.x;
	const dy = p0.y - p1.y;
	return dx * dx + dy * dy;
}

export function pointDistance(p0: Point, p1: Point): number {
	return mathHypot(p0.x - p1.x, p0.y - p1.y);
}

export function pointLength(point: Point): number {
	return mathHypot(point.x, point.y);
}

export function pointLengthSquared(p: Point): number {
	const { x, y } = p;
	return x * x + y * y;
}

export function pointNormalize(point: Point, thickness: number) {
	let value = pointLength(point);
	if (value > 0) {
		value = thickness / value;
		point.x *= value;
		point.y *= value;
	}
}

export function pointCopy(source: Point, target: Point) {
	target.x = source.x;
	target.y = source.y;
}

const inversedMatrix = createM4();
const global = createV3();
const local = createV3();

export function transformInverse(matrix: Float32Array, point: Point):Point {
	inverseM4(matrix, inversedMatrix);
	global[0] = point.x;
	global[1] = point.y;
	transformV3(inversedMatrix, global, local);
	return { x: local[0], y: local[1] };
}
