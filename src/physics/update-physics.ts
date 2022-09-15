import { Point, pointCreate, pointLength, pointLengthSquared, pointNormalize } from "../geom/point";
import { IBody } from "./body";

interface CollisionResult {
	point: Point;
	vector: Point;
	has: boolean;
}

const result: CollisionResult = {
	point: pointCreate(),
	vector: pointCreate(),
	has: false,
};

export function updatePhysics(objects: IBody[], time: number) {
	for (let i = 0; i < objects.length; i++) {
		const object0 = objects[i];
		const body0 = object0.body;
		if (body0.enabled !== false) {
			for (let j = i + 1; j < objects.length; j++) {
				const object1 = objects[j];
				const body1 = object1.body;
				if (body1.enabled !== false) {
					result.has = false;
					// result.point.x = 0;
					// result.point.y = 0;
					// result.vector.x = 0;
					// result.vector.y = 0;
					if (body0.points) {
						if (body1.points) {
							polygoneAndPolygone(object0, object1);
						} else {
							circleAndPolygone(object1, object0, -1);
						}
					} else {
						if (body1.points) {
							circleAndPolygone(object0, object1, 1);
						} else {
							circleAndCircle(object0, object1);
						}
					}

					if (result.has) {
						if (!body0.transparent && !body1.transparent) {
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

							const { vector } = result;

							object0.x -= vector.x * power0;
							object0.y -= vector.y * power0;

							object1.x += vector.x * power1;
							object1.y += vector.y * power1;
						}

						if (object0.onCollision) {
							object0.onCollision(object1, result.point);
						}

						if (object1.onCollision) {
							object1.onCollision(object0, result.point);
						}
					}
				}
			}
		}
	}
}

function circleAndCircle(circle0: IBody, circle1: IBody) {
	const { vector, point } = result;
	
	// TODO pointSub pointCopy
	point.x = vector.x = circle1.x - circle0.x;
	point.y = vector.y = circle1.y - circle0.y;

	const distance = pointLength(vector);
	const radiuses = circle0.body.radius + circle1.body.radius;
	const delta = radiuses - distance;

	if (delta > 0) {
		result.has = true;
		pointNormalize(vector, delta);
		pointNormalize(point, circle1.body.radius);
		// TODO pointAdd
		point.x += circle0.x;
		point.y += circle0.y;
	}
}

function circleAndPolygone(circle: IBody, polygone: IBody, scale: number) {
	const { vector, point } = result;

	// TODO pointSub pointCopy
	point.x = vector.x = circle.x - polygone.x;
	point.y = vector.y = circle.y - polygone.y;

	const distance = pointLength(vector);
	const radiuses = circle.body.radius + polygone.body.radius;
	
	if (distance < radiuses) {
		let n = 0;

		let D = - Number.MAX_VALUE;
		let A = 0;
		let B = 0;
		let array: number[] = []

		for (const edge of polygone.body.edges!)
		{
			const c = - edge.a * (edge.p0.x + polygone.x) - edge.b * (edge.p0.y + polygone.y);

			const d = edge.a * circle.x + edge.b * circle.y + c - circle.body.radius;

			array.push(d);

			if (d < 0) {
				n++;
				if (D < d) {
					D = d;
					A = edge.a;
					B = edge.b;
				}
			}
		}

		if (n == polygone.body.edges!.length) {
			result.has = true;
			result.vector.x = A * D * scale;
			result.vector.y = B * D * scale;
		}
	}
}

function polygoneAndPolygone(polygone0: IBody, polygone1: IBody) {
	
}