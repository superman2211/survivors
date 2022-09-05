import {
	Component, componentRender,
} from './component';
import { colorTransformCreate } from '../geom/color';
import { matrixCreate } from '../geom/matrix';
import { dpr } from '../utils/browser';
import { renderBegin, renderEnd, updateSize } from '../webgl/render';
import { createM4, identityM4 } from '../webgl/m4';

export const globalMatrix = matrixCreate();
const colorTransform = colorTransformCreate();
const globalM4 = createM4();
identityM4(globalM4);

declare global {
	const c:HTMLCanvasElement;
}

export const canvas = c as HTMLCanvasElement;
// const context = canvas.getContext('2d')!;

export function graphicsRender(component: Component) {
	updateSize();
	renderBegin();
	componentRender(component, globalM4, colorTransform);
	renderEnd();
}

// function updateSize() {
// 	const w = (innerWidth * dpr) | 0;
// 	const h = (innerHeight * dpr) | 0;

	// if (w !== canvas.width) {
	// 	canvas.width = w;
	// }

	// if (h !== canvas.height) {
	// 	canvas.height = h;
	// }

// 	globalMatrix.a = globalMatrix.d = dpr;
// }

// function clean() {
	// context.setTransform();
	// context.fillStyle = '#bbbbbb';
	// context.fillRect(0, 0, canvas.width, canvas.height);
// }
