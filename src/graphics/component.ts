import { Transform } from './transform';
import { Keyboard, Pointer, Update } from './extensions';
import { Point } from '../geom/point';
import { KEY_DOWN, KEY_UP, TOUCH_DOWN, TOUCH_MOVE, TOUCH_UP } from './events';
import { createM4, multiplyM4, transformM4 } from '../geom/matrix';
import { renderObject } from '../render/render';

export interface Text {
	value: string,
	font: string,
	size: number,
	align: number,
	color: number,
}

export interface Component extends Transform, Update, Keyboard, Pointer {
	geometry?: Float32Array;
	children?: Component[];
	image?: HTMLCanvasElement;
	visible?: boolean;
	radius?: number;
	onScreen?: boolean;
	text?: Text;
	transformedMatrix?: Float32Array,
}

export function componentRender(component: Component, parentMatrix: Float32Array) {
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
		component.scaleX ?? 1,
		component.scaleY ?? 1,
		component.scaleZ ?? 1,
	);
	multiplyM4(parentMatrix, matrix, matrix);

	component.onScreen = true;

	const {
		children,
		geometry,
		image,
	} = component;

	if (geometry) {
		if (!image) {
			throw 'image is null'
		}
		renderObject(geometry, image, matrix);
	}

	if (children) {
		children.forEach((child) => componentRender(child, matrix));
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
