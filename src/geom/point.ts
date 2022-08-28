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
	return Math.hypot(p0.x - p1.x, p0.y - p1.y);
}

export function pointLength(point: Point): number {
	return Math.hypot(point.x, point.y);
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
