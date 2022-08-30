import { ColorTransform } from '../geom/color';
import { transformColor } from './pattern';

export type Shape = Uint8Array | number[];

export const enum ShapeCommand {
	FILL = 0,
	STROKE = 1,
	MOVE = 2,
	LINE = 3,
	PATH = 4,
}

export function renderShape(shape: Shape, pallete: number[], ct: ColorTransform, context: CanvasRenderingContext2D) {
	for (let i = 0; i < shape.length; i++) {
		switch (shape[i]) {
			case ShapeCommand.FILL:
				context.fillStyle = transformColor(pallete[shape[++i]], ct);
				context.fill();
				break;

			case ShapeCommand.STROKE:
				context.strokeStyle = transformColor(pallete[shape[++i]], ct);
				context.lineWidth = shape[++i];
				context.stroke();
				break;

			case ShapeCommand.MOVE:
				context.beginPath();
				context.moveTo(shape[++i], shape[++i]);
				break;

			case ShapeCommand.LINE:
				context.lineTo(shape[++i], shape[++i]);
				break;

			case ShapeCommand.PATH:
				let count = shape[++i];
				count--;
				context.beginPath();
				context.moveTo(shape[++i], shape[++i]);
				while (count--) {
					context.lineTo(shape[++i], shape[++i]);
				}
				break;

			default:
				throw '';
		}
	}
}
