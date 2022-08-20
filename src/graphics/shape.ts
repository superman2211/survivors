import { ColorTransform } from '../geom/color';
import { Pattern } from './pattern';

export type Shape = Uint8Array | number[];

export const FILL = 0;
export const STROKE = 1;
export const MOVE = 2;
export const LINE = 3;
export const PATH = 4;

export function renderShape(shape: Shape, pallete: number[], ct: ColorTransform, context: CanvasRenderingContext2D) {
	for (let i = 0; i < shape.length; i++) {
		switch (shape[i]) {
			case FILL:
				context.fillStyle = Pattern.transformColor(pallete[shape[++i]], ct);
				context.fill();
				break;

			case STROKE:
				context.strokeStyle = Pattern.transformColor(pallete[shape[++i]], ct);
				context.lineWidth = shape[++i];
				context.stroke();
				break;

			case MOVE:
				context.beginPath();
				context.moveTo(shape[++i], shape[++i]);
				break;

			case LINE:
				context.lineTo(shape[++i], shape[++i]);
				break;

			case PATH:
				let count = shape[++i];
				count--;
				context.beginPath();
				context.moveTo(shape[++i], shape[++i]);
				while (count--) {
					context.lineTo(shape[++i], shape[++i]);
				}
				break;

			default:
				throw `unknown command: ${shape[i]}`;
		}
	}
}
