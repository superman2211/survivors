import { ColorTransform, colorTransformConcat, colorTransformCreate } from '../geom/color';
import { Matrix, matrixConcat, matrixCreate, matrixGetScale, matrixTransformInversePoint } from '../geom/matrix';
import { renderImage, Image } from './image';
import { renderShape, Shape } from './shape';
import { renderText, Text } from './text';
import { getColorTransform, Transform } from './transform';
import { Keyboard, Pointer, Update } from './extensions';
import { Point, pointCreate } from '../geom/point';
import { KEY_DOWN, KEY_UP, TOUCH_DOWN, TOUCH_MOVE, TOUCH_UP } from './events';
import { createM4, multiplyM4, transformM4 } from '../webgl/m4';
import { renderObject } from '../webgl/render';
import { createCube } from '../webgl/cube';
import { Geometry } from '../webgl/geometry';

const cube = createCube(1, 1, 1);

export interface Component extends Transform, Update, Keyboard, Pointer {
	// shape?: Shape;
	// pallete?: number[];
	// text?: Text;
	geometry?: Geometry;
	children?: Component[];
	image?: HTMLCanvasElement;
	visible?: boolean;
	radius?: number;
	onScreen?: boolean;
}

const local = pointCreate();

export function componentRender(component: Component, parentMatrix: Float32Array, parentColorTranform: ColorTransform) {
	component.onScreen = false;

	const visible = component.visible ?? true;
	if (!visible) {
		return;
	}

	const matrix = createM4();
	transformM4(
		matrix,
		component.x ?? 0,
		component.y ?? 0,
		component.z ?? 0,
		component.rotationX ?? 0,
		component.rotationY ?? 0,
		component.rotationZ ?? 0,
		component.scaleX ?? component.scale ?? 1,
		component.scaleY ?? component.scale ?? 1,
		component.scaleZ ?? component.scale ?? 1,
	);
	multiplyM4(parentMatrix, matrix, matrix);

	// if (component.radius) {
	// 	const radius = matrixGetScale(matrix) * component.radius;
	// 	if (
	// 		matrix.x + radius < 0
	// 		|| matrix.y + radius < 0
	// 		|| matrix.x - radius > context.canvas.width - 0
	// 		|| matrix.y - radius > context.canvas.height - 0
	// 	) {
	// 		return;
	// 	}
	// }

	const colorTransform = colorTransformCreate();
	getColorTransform(component, colorTransform);
	colorTransformConcat(parentColorTranform, colorTransform, colorTransform);

	if (colorTransform.am <= 0) {
		return;
	}

	component.onScreen = true;

	// context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.x, matrix.y);

	const {
		children,
		geometry,
		image,
	} = component;

	// if (shape && pallete) {
	// 	renderShape(shape, pallete, colorTransform, context);
	// }

	// if (text) {
	// 	renderText(text, colorTransform, context);
	// }

	// if (image) {
	// 	renderImage(image, colorTransform, context);
	// }

	if (geometry) {
		if (!image) {
			throw 'image is null'
		}
		renderObject(geometry, image, matrix);
	}

	if (children) {
		children.forEach((child) => componentRender(child, matrix, colorTransform));
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

export function componentKeyProcess(component: Component, e: KeyboardEvent, type: number) {
	switch (type) {
		case KEY_DOWN:
			if (component.onKeyDown) {
				component.onKeyDown(e);
			}
			break;
		case KEY_UP:
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

export function componentTouchProcess(component: Component, global: Point, type: number, id: number) {
	if (component.touchable === false) {
		return;
	}

	switch (type) {
		case TOUCH_DOWN:
			if (component.onTouchDown) {
				component.onTouchDown(global, id);
			}
			break;

		case TOUCH_UP:
			if (component.onTouchUp) {
				component.onTouchUp(global, id);
			}
			break;

		case TOUCH_MOVE:
			if (component.onTouchMove) {
				component.onTouchMove(global, id);
			}
			break;
	}

	const { children } = component;

	if (!children) {
		return;
	}

	children.forEach((child) => componentTouchProcess(child, global, type, id));
}
