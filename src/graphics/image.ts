import { ColorTransform } from '../geom/color';

export type Image = HTMLCanvasElement;

export function renderImage(image: Image, ct: ColorTransform, context: CanvasRenderingContext2D) {
	context.fillStyle = context.createPattern(image, 'no-repeat')!;
	context.fillRect(0, 0, image.width, image.height);
}
