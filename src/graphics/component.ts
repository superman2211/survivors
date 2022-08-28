import { ColorTransform } from '../geom/color';
import { Matrix } from '../geom/matrix';
import { renderImage, Image } from './image';
import { renderShape, Shape } from './shape';
import { renderText, Text } from './text';
import { Transform } from './transform';
import { Keyboard, Pointer, Update } from './extensions';
import { Point } from '../geom/point';
import { KeyboardEventType, TouchEventType } from './events';

export interface Component extends Transform, Update, Keyboard, Pointer {
	shape?: Shape;
	pallete?: number[];
	text?: Text;
	children?: Component[];
	image?: Image;
	visible?: boolean;
	radius?: number;
	onScreen?: boolean;
}

let drawCalls = 0;

export function resetDrawCalls() {
	drawCalls = 0;
}

export function getDrawCalls() {
	return drawCalls;
}

const local = Point.create();

export namespace Component {
	export function render(component: Component, parentMatrix: Matrix, parentColorTranform: ColorTransform, context: CanvasRenderingContext2D) {
		component.onScreen = false;

		const visible = component.visible ?? true;
		if (!visible) {
			return;
		}

		const matrix = Matrix.empty();
		Transform.getMatrix(component, matrix);
		Matrix.concat(parentMatrix, matrix, matrix);

		if (component.radius) {
			const radius = Matrix.getScale(matrix) * component.radius;
			if (
				matrix.x + radius < 0
				|| matrix.y + radius < 0
				|| matrix.x - radius > context.canvas.width - 0
				|| matrix.y - radius > context.canvas.height - 0
			) {
				return;
			}
		}

		const colorTransform = ColorTransform.empty();
		Transform.getColorTransform(component, colorTransform);
		ColorTransform.concat(parentColorTranform, colorTransform, colorTransform);

		if (colorTransform.am <= 0) {
			return;
		}

		component.onScreen = true;

		context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.x, matrix.y);

		const {
			shape, image, pallete, text, children,
		} = component;

		if (shape && pallete) {
			renderShape(shape, pallete, colorTransform, context);
			drawCalls++;
		}

		if (text) {
			renderText(text, colorTransform, context);
			drawCalls++;
		}

		if (image) {
			renderImage(image, colorTransform, context);
			drawCalls++;
		}

		if (children) {
			children.forEach((child) => render(child, matrix, colorTransform, context));
		}
	}

	export function update(component: Component, time: number) {
		if (component.enabled === false) {
			return;
		}

		if (component.onUpdate) {
			component.onUpdate(time);
		}

		const { children } = component;

		if (!children) {
			return;
		}

		children.forEach((child) => update(child, time));
	}

	export function keyProcess(component: Component, e: KeyboardEvent, type: KeyboardEventType) {
		switch (type) {
			case KeyboardEventType.DOWN:
				if (component.onKeyDown) {
					component.onKeyDown(e);
				}
				break;
			case KeyboardEventType.UP:
				if (component.onKeyUp) {
					component.onKeyUp(e);
				}
				break;
		}

		const { children } = component;

		if (!children) {
			return;
		}

		children.forEach((child) => keyProcess(child, e, type));
	}

	export function touchProcess(component: Component, global: Point, parentMatrix: Matrix, type: TouchEventType, id: number) {
		if (component.touchable === false) {
			return;
		}

		const matrix = Matrix.empty();
		Transform.getMatrix(component, matrix);
		Matrix.concat(parentMatrix, matrix, matrix);

		switch (type) {
			case TouchEventType.DOWN:
				if (component.onTouchDown) {
					Matrix.transformInversePoint(matrix, global, local);
					component.onTouchDown(local, global, id);
				}
				break;

			case TouchEventType.UP:
				if (component.onTouchUp) {
					Matrix.transformInversePoint(matrix, global, local);
					component.onTouchUp(local, global, id);
				}
				break;

			case TouchEventType.MOVE:
				if (component.onTouchMove) {
					Matrix.transformInversePoint(matrix, global, local);
					component.onTouchMove(local, global, id);
				}
				break;
		}

		const { children } = component;

		if (!children) {
			return;
		}

		children.forEach((child) => touchProcess(child, global, matrix, type, id));
	}
}
