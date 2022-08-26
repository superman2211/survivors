import { Point } from "../../geom/point";

export interface Impulse {
	target: Point,
	value: Point,
}

export function updateImpulses(impulses: Impulse[], time: number) {
	for (const impulse of impulses) {
		const { target, value } = impulse;
		const dx = value.x / 2;
		const dy = value.y / 2;
		target.x += dx;
		target.y += dy;
		value.x -= dx;
		value.y -= dy;
		if (Point.lengthSquared(value) < 1) {
			impulses.splice(impulses.indexOf(impulse));
		}
	}
}