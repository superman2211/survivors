import { matrixCreate } from "../geom/matrix";
import { Point, pointLength } from "../geom/point";
import { mathCos, mathHypot, mathMax, mathSin } from "../utils/math";

export interface IBody {
	x: number;
	y: number;
	body: Body;
	onCollision?: (o: IBody, p: Point) => void;
}

export interface Edge {
	p0: Point;
	p1: Point;
	a: number;
	b: number;
}

export interface Body {
	weight: number;
	radius: number;
	enabled?: boolean;
	static?: boolean;
	transparent?: boolean;
	points?: Point[];
	edges?: Edge[];
}

export function updateBody(body: Body, rotation: number) {
	if (body.points) {
		body.radius = 0;

		const { points } = body;

		body.edges = [];

		const cos = mathCos(rotation);
		const sin = mathSin(rotation);
		points.forEach(p => {
			const {x, y} = p;
			p.x = x * cos - y * sin;
			p.y = x * sin + y * cos;
		})

		for (let i = 0; i < points.length; i++) {
			let j = i == points.length - 1 ? 0 : i + 1;
			const p0 = points[i];
			const p1 = points[j];
			let a = p0.y - p1.y;
			let b = p1.x - p0.x;
			const length = mathHypot(a, b);
			a /= length;
			b /= length;
			body.edges.push({ p0, p1, a, b });

			body.radius = mathMax(body.radius, pointLength(p0));
		}
	}
}

export function createBox(x: number, y: number, width: number, height: number, rotation: number): Body {
	const left = x;
	const right = x + width;
	const top = y;
	const bottom = y + height;

	const points: Point[] = [
		{ x: left, y: top },
		{ x: left, y: bottom },
		{ x: right, y: bottom },
		{ x: right, y: top },
	];

	const body: Body = {
		points,
		radius: 0,
		weight: 0
	}

	updateBody(body, rotation);

	return body;
}