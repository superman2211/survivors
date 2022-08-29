import { Point, pointCopy, pointCreate, pointNormalize } from "../../geom/point";
import { Component } from "../../graphics/component";
import { playAudio } from "../../media/sfx";
import { hasTouch } from "../../utils/browser";
import { mathAtan2 } from "../../utils/math";
import { UI } from "../ui";
import { Unit } from "../units/unit";

export interface IPlayerControl {
	direction: Point;
	attack: boolean;
	rotation: number;
	weapon: number;
	player?: Unit;
}

export abstract class BasePlayerControl implements IPlayerControl {
	direction = pointCreate();
	attack = false;
	rotation = 0;
	weapon = 0;
	player?: Unit;

	constructor(ui: UI) {
		ui.setActiveWeapon(this.weapon);

		ui.gunButton.onClick = () => {
			this.weapon = 0;
			ui.setActiveWeapon(ui.gunButton);
		};

		ui.rifleButton.onClick = () => {
			this.weapon = 1;
			ui.setActiveWeapon(ui.rifleButton);
		};

		ui.shotgunButton.onClick = () => {
			this.weapon = 2;
			ui.setActiveWeapon(ui.shotgunButton);
		};
	}
}

export class DesktopPlayerControl extends BasePlayerControl {
	constructor(ui: UI, world: Component) {
		super(ui);

		world.onTouchMove = (p: Point) => {
			this.rotation = mathAtan2(p.y - this.player!.y!, p.x - this.player!.x!);
		};

		world.onTouchDown = (p: Point) => {
			this.attack = true;
			playAudio(this.player!.settings.weapons![this.weapon].sound);
		};

		world.onTouchUp = (p: Point) => {
			this.attack = false;
		};

		let up = false;
		let down = false;
		let right = false;
		let left = false;

		const keyHandler = (e: KeyboardEvent) => {
			const value = e.type === 'keydown';

			switch (e.code) {
				case 'KeyW':
				case 'ArrowUp':
					up = value;
					break;
				case 'KeyS':
				case 'ArrowDown':
					down = value;
					break;
				case 'KeyA':
				case 'ArrowLeft':
					left = value;
					break;
				case 'KeyD':
				case 'ArrowRight':
					right = value;
					break;
				case 'Space':
					if (value && this.player!.settings.weapons) {
						this.weapon++;
						if (this.weapon >= this.player!.settings.weapons.length) {
							this.weapon = 0;
						}
						ui.setActiveWeapon(this.weapon);
					}
					break;
			};

			this.direction.x = 0;
			this.direction.y = 0;

			if (up) {
				this.direction.y -= 1;
			}
			if (down) {
				this.direction.y += 1;
			}
			if (left) {
				this.direction.x -= 1;
			}
			if (right) {
				this.direction.x += 1;
			}

			pointNormalize(this.direction, 1);
		}

		world.onKeyDown = keyHandler;
		world.onKeyUp = keyHandler;
	}
}

export class MobilePlayerControl extends BasePlayerControl {
	constructor(ui: UI) {
		super(ui);

		ui.moveJoystick.onChange = () => {
			pointCopy(ui.moveJoystick.value, this.direction);
			pointNormalize(this.direction, 1);
		};

		ui.attackJoystick.onChange = () => {
			const { value } = ui.attackJoystick;
			this.attack = ui.attackJoystick.isActive();
			if (this.attack) {
				this.rotation = mathAtan2(value.y, value.x);

				playAudio(this.player!.settings.weapons![this.weapon].sound);
			}
		};
	}
}

export function getPlayerControl(world: Component, ui: UI): IPlayerControl {
	if (hasTouch) {
		return new MobilePlayerControl(ui);
	} else {
		return new DesktopPlayerControl(ui, world);
	}
}