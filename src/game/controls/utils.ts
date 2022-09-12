import { createContext2d } from "../../utils/browser";
import { math2PI } from "../../utils/math";

export function createCircleImage(radius: number, color: string, width: number): HTMLCanvasElement {
	const context = createContext2d();
	const { canvas } = context;
	canvas.width = canvas.height = radius * 2;

	context.strokeStyle = color;
	context.globalAlpha = 0.5;
	context.lineWidth = width;
	context.beginPath();
	context.arc(radius, radius, radius - width, 0, math2PI);
	context.stroke();

	return canvas;
}