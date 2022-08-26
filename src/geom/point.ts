export interface Point {
	x: number,
	y: number,
}

export function pointLengthSquared(p: Point): number {
	const { x, y } = p;
	return x * x + y * y;
}

export namespace Point {
	export function create(x: number = 0, y: number = 0): Point {
		return { x, y };
	}

	export function distanceSquared(p0: Point, p1: Point): number {
		const dx = p0.x - p1.x;
		const dy = p0.y - p1.y;
		return dx * dx + dy * dy;
	}

	export function distance(p0: Point, p1: Point): number {
		return Math.hypot(p0.x - p1.x, p0.y - p1.y);
	}

	export const lengthSquared = pointLengthSquared;

	export function length(point: Point): number {
		return Math.hypot(point.x, point.y);
	}

	export function normalize(point: Point, thickness: number) {
		let value = length(point);
		if (value > 0) {
			value = thickness / value;
			point.x *= value;
			point.y *= value;
		}
	}
}
