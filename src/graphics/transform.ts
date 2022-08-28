import { ColorTransform } from '../geom/color';
import { Matrix, matrixCreate } from '../geom/matrix';
import { Point } from '../geom/point';

const tempMatrix = matrixCreate();

export interface TintColor {
	color?: number;
	value?: number;
}

export interface Transform {
	x?: number;
	y?: number;
	rotation?: number;
	scale?: number;
	scaleX?: number;
	scaleY?: number;
	alpha?: number;
	tint?: TintColor;
	brightness?: number;
}

export function getMatrix(transform: Transform, result: Matrix) {
	const { rotation } = transform;

	const sx = transform.scaleX ?? transform.scale ?? 1;
	const sy = transform.scaleY ?? transform.scale ?? 1;

	result.x = transform.x ?? 0;
	result.y = transform.y ?? 0;

	if (rotation) {
		const cos = Math.cos(rotation);
		const sin = Math.sin(rotation);

		result.a = cos * sx;
		result.b = sin * sx;
		result.c = -sin * sy;
		result.d = cos * sy;
		return;
	}

	result.a = sx;
	result.b = 0;
	result.c = 0;
	result.d = sy;
}

export function getColorTransform(transform: Transform, result: ColorTransform) {
	const alpha = transform.alpha ?? 1;

	const { tint } = transform;
	if (tint) {
		const { color = 0, value = 1 } = tint;

		const valueInverted = 1 - value;

		const r = (color >> 16) & 0xff;
		const g = (color >> 8) & 0xff;
		const b = color & 0xff;

		result.am = alpha;
		result.rm = valueInverted;
		result.gm = valueInverted;
		result.bm = valueInverted;

		result.ao = 0;
		result.ro = r * value;
		result.go = g * value;
		result.bo = b * value;
		return;
	}

	let { brightness } = transform;
	if (brightness !== undefined) {
		if (brightness > 1) {
			brightness = 1;
		} else if (brightness < -1) {
			brightness = -1;
		}

		const percent: number = 1 - Math.abs(brightness);
		let offset: number = 0;
		if (brightness > 0) {
			offset = brightness * 255;
		}

		result.am = alpha;
		result.rm = percent;
		result.gm = percent;
		result.bm = percent;

		result.ao = 0;
		result.ro = offset;
		result.go = offset;
		result.bo = offset;
		return;
	}

	result.am = alpha;
	result.rm = 1;
	result.gm = 1;
	result.bm = 1;

	result.ao = 0;
	result.ro = 0;
	result.go = 0;
	result.bo = 0;
}

// export function transformPoint(transform: Transform, point: Point, result: Point) {
// 	const { x, y } = point;
// 	getMatrix(transform, tempMatrix);
// 	result.x = x * tempMatrix.a + y * tempMatrix.c + tempMatrix.x;
// 	result.y = x * tempMatrix.b + y * tempMatrix.d + tempMatrix.y;
// }

