import {
	Component,
	// getDrawCalls,
	// resetDrawCalls,
} from './component';
import { ColorTransform } from '../geom/color';
import { Matrix } from '../geom/matrix';

export const globalMatrix = Matrix.empty();
const colorTransform = ColorTransform.empty();

export const dpr = devicePixelRatio;

export namespace Graphics {
	let context: CanvasRenderingContext2D;
	let canvas: HTMLCanvasElement;

	export function render(component: Component) {
		updateSize();
		clean();
		// resetDrawCalls();
		Component.render(component, globalMatrix, colorTransform, context);
		// console.log(getDrawCalls());
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

	export function init(c: HTMLCanvasElement) {
		canvas = c;
		context = canvas.getContext('2d')!;
	}
}
