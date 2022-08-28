import { math2PI } from "../../utils/math";

export function createCircleImage(radius: number, color: string, width: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = radius * 2;

	const context = canvas.getContext('2d')!;
	context.strokeStyle = color;
	context.globalAlpha = 0.5;
	context.lineWidth = width;
	context.beginPath();
	context.arc(radius, radius, radius - width, 0, math2PI);
	context.stroke();

	return canvas;
}