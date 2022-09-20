import { FSM } from "../utils/fsm";
import { Body } from "../../physics/body";
import { Weapon } from "../weapons/weapon";
import { UnitType } from "./types";
import { WorldObject } from "../world";
import { animationDuration, animationSpeed, getAnimation } from "../../resources/animation";
import { Resources } from "../../resources/ids";
import { getUnitImage } from "./image";
import { Component } from "../../graphics/component";
import { wheaponImage } from "../weapons/weapons";

export const direction = {
	x: 0,
	y: 0,
}

export interface UnitSettings {
	type: UnitType,
	radius: number,
	weight: number,
	health: number,
	reaction: number,
	walkSpeed: number,
	weapons?: Weapon[],
	animationWalk: Resources,
}

export interface Unit extends WorldObject {
	rotationZ: number;
	scaleX: number,
	scaleY: number,
	scaleZ: number,
	fsm: FSM;
	body: Body;
	settings: UnitSettings;
	health: number;
	weapon: number;
	animationPaused: boolean;
	playAnimation(type: Resources, loop: boolean): void;
}

export function createUnit(settings: UnitSettings): Unit {
	const { radius, weight, health } = settings;
	const fsm = new FSM(settings.reaction);
	const body: Body = { radius, weight };
	const weapon = 0;

	let animationFrame = 0;
	let animationType = Resources.walk_zombie;
	let animationLoop = true;

	const image = getUnitImage(settings.type);

	let children: Component[] | undefined = undefined;

	let weaponComponent: Component | null = null;
	if (settings.type != UnitType.ENEMY) {
		weaponComponent = { image: wheaponImage };
		children = [weaponComponent];
	}

	return {
		image,
		rotationZ: 0,
		rotationX: 0,
		rotationY: 0,
		x: 0,
		y: 0,
		z: 0,
		scaleX: radius,
		scaleY: radius,
		scaleZ: radius,
		fsm,
		body,
		health,
		settings,
		weapon,
		animationPaused: false,
		children,

		playAnimation(type: Resources, loop: boolean) {
			animationType = type;
			animationFrame = 0;
			animationLoop = loop;
			this.animationPaused = false;
		},

		onUpdate(time) {
			this.fsm.update(time);

			// this.rotationX! = direction.y / 100;
			// this.rotationY! = direction.x / 100;

			const animation = getAnimation(animationType);
			this.geometry = animation[animationFrame | 0];

			if (!this.animationPaused) {
				animationFrame += time * animationSpeed[animationType];
				const duration = animationDuration[animationType] * animation.length;
				while (animationFrame >= duration) {
					if (animationLoop) {
						animationFrame -= duration;
					} else {
						animationFrame = duration - 1;
						this.animationPaused = true;
					}
				}
			}
			
			if (weaponComponent) {
				const weapon = settings.weapons![this.weapon];
				if (weapon && weapon.geometry) {
					weaponComponent.geometry = weapon.geometry;
				}
			}
		}
	}
}