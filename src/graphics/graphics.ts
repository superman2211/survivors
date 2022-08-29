import {
	Component, componentRender,
} from './component';
import { colorTransformCreate } from '../geom/color';
import { matrixCreate } from '../geom/matrix';
import { dpr } from '../utils/browser';

export const globalMatrix = matrixCreate();
const colorTransform = colorTransformCreate();

declare global {
	const c:HTMLCanvasElement;
}

export const canvas = c as HTMLCanvasElement;
const context = canvas.getContext('2d')!;

export function graphicsRender(component: Component) {
	updateSize();
	clean();
	componentRender(component, globalMatrix, colorTransform, context);
}

function updateSize() {
	const w = (innerWidth * dpr) | 0;
	const h = (innerHeight * dpr) | 0;

	if (w !== canvas.width) {
		canvas.width = w;
	}

	if (h !== canvas.height) {
		canvas.height = h;
	}

	globalMatrix.a = globalMatrix.d = dpr;
}

function clean() {
	context.setTransform();
	context.fillStyle = '#bbbbbb';
	context.fillRect(0, 0, canvas.width, canvas.height);
}
