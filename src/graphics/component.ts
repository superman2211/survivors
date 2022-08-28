import { ColorTransform, colorTransformConcat, colorTransformCreate } from '../geom/color';
import { Matrix, matrixConcat, matrixCreate, matrixGetScale, matrixTransformInversePoint } from '../geom/matrix';
import { renderImage, Image } from './image';
import { renderShape, Shape } from './shape';
import { renderText, Text } from './text';
import { getColorTransform, getMatrix, Transform } from './transform';
import { Keyboard, Pointer, Update } from './extensions';
import { Point, pointCreate } from '../geom/point';
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

const local = pointCreate();

export function componentRender(component: Component, parentMatrix: Matrix, parentColorTranform: ColorTransform, context: CanvasRenderingContext2D) {
	component.onScreen = false;

	const visible = component.visible ?? true;
	if (!visible) {
		return;
	}

	const matrix = matrixCreate();
	getMatrix(component, matrix);
	matrixConcat(parentMatrix, matrix, matrix);

	if (component.radius) {
		const radius = matrixGetScale(matrix) * component.radius;
		if (
			matrix.x + radius < 0
			|| matrix.y + radius < 0
			|| matrix.x - radius > context.canvas.width - 0
			|| matrix.y - radius > context.canvas.height - 0
		) {
			return;
		}
	}

	const colorTransform = colorTransformCreate();
	getColorTransform(component, colorTransform);
	colorTransformConcat(parentColorTranform, colorTransform, colorTransform);

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
	}

	if (text) {
		renderText(text, colorTransform, context);
	}

	if (image) {
		renderImage(image, colorTransform, context);
	}

	if (children) {
		children.forEach((child) => componentRender(child, matrix, colorTransform, context));
	}
}

export function componentUpdate(component: Component, time: number) {
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

	children.forEach((child) => componentUpdate(child, time));
}

export function componentKeyProcess(component: Component, e: KeyboardEvent, type: KeyboardEventType) {
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

	children.forEach((child) => componentKeyProcess(child, e, type));
}

export function componentTouchProcess(component: Component, global: Point, parentMatrix: Matrix, type: TouchEventType, id: number) {
	if (component.touchable === false) {
		return;
	}

	const matrix = matrixCreate();
	getMatrix(component, matrix);
	matrixConcat(parentMatrix, matrix, matrix);

	switch (type) {
		case TouchEventType.DOWN:
			if (component.onTouchDown) {
				matrixTransformInversePoint(matrix, global, local);
				component.onTouchDown(local, global, id);
			}
			break;

		case TouchEventType.UP:
			if (component.onTouchUp) {
				matrixTransformInversePoint(matrix, global, local);
				component.onTouchUp(local, global, id);
			}
			break;

		case TouchEventType.MOVE:
			if (component.onTouchMove) {
				matrixTransformInversePoint(matrix, global, local);
				component.onTouchMove(local, global, id);
			}
			break;
	}

	const { children } = component;

	if (!children) {
		return;
	}

	children.forEach((child) => componentTouchProcess(child, global, matrix, type, id));
}
