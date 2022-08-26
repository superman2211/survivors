import { Point } from "../../geom/point";

export interface Impulse {
	target: Point,
	value: Point,
}

export function updateImpulses(impulses: Impulse[], time: number) {
	for (const impulse of impulses) {
		const { target, value } = impulse;
		target.x += value.x;
		target.y += value.y;

		let length = Point.length(value);
		length -= length * 20 * time;
		if (length < 0.5) {
			impulses.splice(impulses.indexOf(impulse));
		} else {
			Point.normalize(value, length);
		}
	}
}