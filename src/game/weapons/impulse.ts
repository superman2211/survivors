import { Point } from "../../geom/point";
import { IBody } from "../utils/physics";

export interface Impulse {
	target: IBody,
	value: Point,
}

export function updateImpulses(impulses: Impulse[], time: number) {
	for (const impulse of impulses) {
		const { target, value } = impulse;
		target.x += value.x;
		target.y += value.y;

		const { weight } = target.body;

		let length = Point.length(value);
		length -= length * weight / 4 * time;
		if (length < 0.5) {
			impulses.splice(impulses.indexOf(impulse));
		} else {
			Point.normalize(value, length);
		}
	}
}