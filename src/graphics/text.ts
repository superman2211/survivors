import { ColorTransform } from '../geom/color';
import { Pattern } from './pattern';

export interface Text {
	value?: string;
	color?: number;
	font?: string;
	size?: number;
	align?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function renderText(text: Text, ct: ColorTransform, context: CanvasRenderingContext2D) {
	if (!text.value) {
		return;
	}

	context.fillStyle = Pattern.transformColor(text.color ?? 0xff000000, ct);
	context.font = `${text.size ?? 10}px ${text.font ?? 'arial'}`;
	context.textBaseline = 'top';

	let x = 0;

	if (text.align) {
		x = -context.measureText(text.value).width * text.align;
	}

	context.fillText(text.value, x, 0);
}
