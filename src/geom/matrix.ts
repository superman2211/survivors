import { abs, max } from '../utils/math';
import { Point } from './point';

export interface Matrix {
	a: number;
	b: number;
	c: number;
	d: number;
	x: number;
	y: number;
}

export namespace Matrix {
	export function empty(): Matrix {
		return {
			a: 1,
			b: 0,
			c: 0,
			d: 1,
			x: 0,
			y: 0,
		};
	}

	export function concat(matrix0: Matrix, matrix1: Matrix, result: Matrix) {
		const a = matrix1.a * matrix0.a + matrix1.b * matrix0.c;
		const b = matrix1.a * matrix0.b + matrix1.b * matrix0.d;
		const c = matrix1.c * matrix0.a + matrix1.d * matrix0.c;
		const d = matrix1.c * matrix0.b + matrix1.d * matrix0.d;
		const x = matrix1.x * matrix0.a + matrix1.y * matrix0.c + matrix0.x;
		const y = matrix1.x * matrix0.b + matrix1.y * matrix0.d + matrix0.y;

		result.a = a;
		result.b = b;
		result.c = c;
		result.d = d;
		result.x = x;
		result.y = y;
	}

	export function getScale(matrix: Matrix): number {
		return max(
			abs(matrix.a),
			abs(matrix.b),
			abs(matrix.c),
			abs(matrix.d),
		);
	}

	export function transformPoint(matrix: Matrix, point: Point, result: Point) {
		const { x, y } = point;
		result.x = x * matrix.a + y * matrix.c;
		result.y = x * matrix.b + y * matrix.d;
	}

	export function getDeterminant(matrix: Matrix): number {
		return matrix.a * matrix.d - matrix.b * matrix.c;
	}

	// export function invert(matrix: Matrix, result: Matrix) {
	// 	let determinant = getDeterminant(matrix);

	// 	if (determinant === 0) {
	// 		result.a = 0;
	// 		result.b = 0;
	// 		result.c = 0;
	// 		result.d = 0;
	// 		result.x = -matrix.x;
	// 		result.y = -matrix.y;
	// 	} else {
	// 		determinant = 1.0 / determinant;

	// 		result.a = matrix.a * determinant;
	// 		result.b = -matrix.b * determinant;
	// 		result.c = -matrix.c * determinant;
	// 		result.d = matrix.d * determinant;
	// 		result.x = -result.a * matrix.x - result.c * matrix.y;
	// 		result.y = -result.b * matrix.x - result.d * matrix.y;
	// 	}
	// }

	export function transformInversePoint(matrix: Matrix, point: Point, result: Point) {
		let determinant = getDeterminant(matrix);

		if (determinant === 0) {
			result.x = -matrix.x;
			result.y = -matrix.y;
		} else {
			determinant = 1 / determinant;

			const { x, y } = point;

			result.x = determinant * (matrix.c * (matrix.y - y) + matrix.d * (x - matrix.x));
			result.y = determinant * (matrix.a * (y - matrix.y) + matrix.b * (matrix.x - x));
		}
	}
}
