import { createM4, multiplyM4, transformM4 } from "../geom/matrix";
import { Component } from "../graphics/component";
import { formatColor } from "../graphics/pattern";
import { dpr, hasTouch } from "../utils/browser";
import { ApplicationOptions } from "./application";
import { Button, createRoundButton } from "./controls/button";
import { createJoystick, Joystick } from "./controls/joystick";

const BORDER = 30;

export interface UI extends Component {
	moveJoystick: Joystick;
	attackJoystick: Joystick;

	gunButton: Button,
	rifleButton: Button,
	shotgunButton: Button,
	healthLabel: Component,
	scoreLabel: Component,

	setActiveWeapon(current: Button | number): void;
}

export function createUI(options: ApplicationOptions): UI {
	const moveJoystick = createJoystick();
	const attackJoystick = createJoystick();

	const gunButton = createRoundButton('gun');
	const rifleButton = createRoundButton('rifle');
	const shotgunButton = createRoundButton('shot');

	moveJoystick.visible = hasTouch;
	attackJoystick.visible = hasTouch;

	const healthLabel: Component = {
		text: {
			value: '',
			font: 'arial',
			size: 40,
			align: 0,
			color: 0xffffffff,
		},
	}

	const scoreLabel: Component = {
		text: {
			value: '',
			font: 'arial',
			size: 40,
			align: 1,
			color: 0xffffffff,
		},
	}

	const weaponsButtons = [gunButton, rifleButton, shotgunButton];

	return {
		moveJoystick,
		attackJoystick,

		gunButton,
		rifleButton,
		shotgunButton,

		healthLabel,
		scoreLabel,

		children: [
			moveJoystick,
			attackJoystick,

			gunButton,
			rifleButton,
			shotgunButton,

			healthLabel,
			scoreLabel,
		],

		onUpdate() {
			const width = options.getWidth() / this.scaleX!;
			const height = options.getHeight() / this.scaleY!;

			healthLabel.x = BORDER / 2;
			healthLabel.y = BORDER / 2;
			scoreLabel.x = width - BORDER / 2;
			scoreLabel.y = BORDER / 2;

			moveJoystick.x = BORDER + moveJoystick.radius;
			moveJoystick.y = height - BORDER - moveJoystick.radius;

			attackJoystick.x = width - BORDER - attackJoystick.radius;
			attackJoystick.y = height - BORDER - attackJoystick.radius;

			if (hasTouch) {
				shotgunButton.x = width - BORDER - 150;
				shotgunButton.y = height - BORDER - attackJoystick.radius * 2 - 150;

				rifleButton.x = shotgunButton.x - 150;
				rifleButton.y = shotgunButton.y + 20;

				gunButton.x = rifleButton.x - 120;
				gunButton.y = rifleButton.y + 100;
			} else {
				shotgunButton.x = width - BORDER - 100;
				shotgunButton.y = height - BORDER - 100;

				rifleButton.x = shotgunButton.x - 100 - BORDER;
				rifleButton.y = shotgunButton.y;

				gunButton.x = rifleButton.x - 100 - BORDER;
				gunButton.y = rifleButton.y;
			}
		},

		setActiveWeapon(current: Button | number) {
			if (typeof current === 'number') {
				current = weaponsButtons[current];
			}
			weaponsButtons.forEach(b => {
				b.setActive(b === current);
			});
		}
	}
}

declare global {
	const ui: HTMLCanvasElement;
}

export const canvas: HTMLCanvasElement = ui;
const context = canvas.getContext('2d')!;

export function clearUI() {
	const w = (innerWidth * dpr) | 0;
	const h = (innerHeight * dpr) | 0;

	if (w !== canvas.width) {
		canvas.width = w;
	}

	if (h !== canvas.height) {
		canvas.height = h;
	}

	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, canvas.width, canvas.height);
}

export function renderUI(component: Component, parentMatrix: Float32Array) {
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

	component.transformedMatrix = matrix;

	context.setTransform(
		matrix[0],
		matrix[1],

		matrix[4],
		matrix[5],

		matrix[12],
		matrix[13],
	);

	const { children, image, text } = component;

	if (image) {
		context.drawImage(image, 0, 0);
	}

	if (text && text.value) {
		context.fillStyle = formatColor(text.color ?? 0xff000000);
		context.font = `${text.size ?? 10}px ${text.font ?? 'arial'}`;
		context.textBaseline = 'top';

		let x = 0;

		if (text.align) {
			x = -context.measureText(text.value).width * text.align;
		}

		context.fillText(text.value, x, 0);
	}

	if (children) {
		children.forEach((child) => renderUI(child, matrix));
	}
}