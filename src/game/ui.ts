import { Component } from "../graphics/component";
import { hasTouch } from "../utils/browser";
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

	const weaponsButtons = [gunButton, rifleButton, shotgunButton];

	return {
		moveJoystick,
		attackJoystick,

		gunButton,
		rifleButton,
		shotgunButton,

		children: [
			moveJoystick,
			attackJoystick,

			gunButton,
			rifleButton,
			shotgunButton,
		],

		onUpdate() {
			const width = options.getWidth() / this.scale!;
			const height = options.getHeight() / this.scale!;

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