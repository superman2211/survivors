import { Point } from "../../geom/point";
import { Component } from "../../graphics/component";
import { mathAtan2 } from "../../utils/math";
import { Unit } from "./unit";

export interface IPlayerControl {
	direction: Point;
	attack: boolean;
	rotation: number;
	weapon: number;
}

export class DesktopPlayerControl implements IPlayerControl {
	direction = Point.create();
	attack = false;
	rotation = 0;
	weapon = 0;

	player: Unit;

	up = false;
	down = false;
	right = false;
	left = false;

	constructor(player: Unit, world: Component) {
		this.player = player;
		this.keyProcess = this.keyProcess.bind(this);

		world.onTouchMove = (p: Point) => {
			this.rotation = mathAtan2(p.y - player.y!, p.x - player.x!);
		};

		world.onTouchDown = (p: Point) => {
			this.attack = true;
		};

		world.onTouchUp = (p: Point) => {
			this.attack = false;
		};

		world.onKeyDown = this.keyProcess;
		world.onKeyUp = this.keyProcess;
	}

	keyProcess(e: KeyboardEvent) {
		const value = e.type === 'keydown';

		switch (e.code) {
			case 'KeyW':
			case 'ArrowUp':
				this.up = value;
				break;
			case 'KeyS':
			case 'ArrowDown':
				this.down = value;
				break;
			case 'KeyA':
			case 'ArrowLeft':
				this.left = value;
				break;
			case 'KeyD':
			case 'ArrowRight':
				this.right = value;
				break;
			case 'Space':
				if (value && this.player.settings.weapons) {
					this.weapon++;
					if (this.weapon >= this.player.settings.weapons.length) {
						this.weapon = 0;
					}
				}
				break;
		};

		this.direction.x = 0;
		this.direction.y = 0;

		if (this.up) {
			this.direction.y -= 1;
		}
		if (this.down) {
			this.direction.y += 1;
		}
		if (this.left) {
			this.direction.x -= 1;
		}
		if (this.right) {
			this.direction.x += 1;
		}

		Point.normalize(this.direction, 1);
	}
}

export class MobilePlayerControl implements IPlayerControl {
	direction = Point.create();
	attack = false;
	rotation = 0;
	weapon = 0;
}

export function getPlayerControl(player: Unit, world: Component): IPlayerControl {
	if ('ontouchstart' in window) {
		return new MobilePlayerControl();
	} else {
		return new DesktopPlayerControl(player, world);
	}
}