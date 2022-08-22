import { Point } from "../geom/point";
import { Component } from "../graphics/component";
import { mathSqrt } from "../utils/math";

export interface IBody {
	x: number;
	y: number;
	body: Body;
}

export interface Body {
	weight: number;
	radius: number;
	static?: boolean;
}

const vector = Point.create();

export function updatePhysics(objects: IBody[], time: number) {
	for (let i = 0; i < objects.length; i++) {
		const object0 = objects[i];
		for (let j = i + 1; j < objects.length; j++) {
			const object1 = objects[j];
			const radiuses = object0.body.radius + object1.body.radius;
			const radiusesSquared = radiuses * radiuses;
			vector.x = object0.x - object1.x;
			vector.y = object0.y - object1.y;
			const distanceSquared = Point.lengthSquared(vector);
			if (distanceSquared < radiusesSquared) {
				const distance = mathSqrt(distanceSquared);
				const delta = radiuses - distance;
				const scale = delta / distance;
				vector.x *= scale;
				vector.y *= scale;

				const mass0 = object0.body.weight;
				const mass1 = object1.body.weight;
				const massSumm = mass0 + mass1;
				const power0 = mass1 / massSumm;
				const power1 = mass0 / massSumm;

				object0.x += vector.x * power0;
				object0.y += vector.y * power0;

				object1.x -= vector.x * power1;
				object1.y -= vector.y * power1;
			}
		}
	}
}