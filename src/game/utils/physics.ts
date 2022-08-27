import { Point, pointLengthSquared } from "../../geom/point";
import { mathMax, mathSqrt } from "../../utils/math";

export interface IBody {
	x: number;
	y: number;
	body: Body;
	onCollision?: (o: IBody, p: Point) => void;
}

export interface Body {
	weight: number;
	radius: number;
	enabled?: boolean;
	static?: boolean;
	transparent?: boolean;
	points?: Point[];
}

const vector = Point.create();

export function updatePhysics(objects: IBody[], time: number) {
	for (let i = 0; i < objects.length; i++) {
		const object0 = objects[i];
		const body0 = object0.body;
		if (body0.enabled !== false) {
			for (let j = i + 1; j < objects.length; j++) {
				const object1 = objects[j];
				const body1 = object1.body;
				if (body1.enabled !== false) {
					const radiuses = body0.radius + body1.radius;
					const radiusesSquared = radiuses * radiuses;
					if (object0.x == object1.x && object0.y === object1.y) {
						object0.x += 0.001;
					}
					vector.x = object0.x - object1.x;
					vector.y = object0.y - object1.y;
					const distanceSquared = pointLengthSquared(vector);
					if (distanceSquared < radiusesSquared) {
						if (!body0.transparent && !body1.transparent) {
							let collisionPoint: Point | null = null;
							if (body0.points) {
								if (body1.points) {
									collisionPoint = polygoneAndPolygone(object0, object1);
								} else {
									collisionPoint = circleAndPolygone(object1, object0);
								}
							} else {
								if (body1.points) {
									collisionPoint = circleAndPolygone(object0, object1);
								} else {
									collisionPoint = circleAndCircle(object0, object1);
								}
							}

							const distance = mathSqrt(distanceSquared);
							const delta = radiuses - distance;
							const scale = delta / distance;// TODO check it
							const deltaX = vector.x * scale;
							const deltaY = vector.y * scale;

							let power0 = 0;
							let power1 = 0;

							if (body0.static) {
								power1 = 1;
							} else if (body1.static) {
								power0 = 1;
							} else {
								const mass0 = body0.weight;
								const mass1 = body1.weight;
								const massSumm = mass0 + mass1;
								power0 = mass1 / massSumm;
								power1 = mass0 / massSumm;
							}

							object0.x += deltaX * power0;
							object0.y += deltaY * power0;

							object1.x -= deltaX * power1;
							object1.y -= deltaY * power1;
						}

						if (object0.onCollision || object1.onCollision) {
							vector.x = object0.x - object1.x;
							vector.y = object0.y - object1.y;
							Point.normalize(vector, body1.radius);
							vector.x += object1.x;
							vector.y += object1.y;
						}

						if (object0.onCollision) {
							object0.onCollision(object1, vector);
						}

						if (object1.onCollision) {
							object1.onCollision(object0, vector);
						}
					}
				}
			}
		}
	}
}

function circleAndCircle(circle0: IBody, circle1: IBody): Point | null {
	return null;
}

function circleAndPolygone(circle: IBody, polygone: IBody): Point | null {
	return null;
}

function polygoneAndPolygone(polygone0: IBody, polygone1: IBody): Point | null {
	return null;
}