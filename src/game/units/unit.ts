import { FSM } from "../utils/fsm";
import { Body } from "../../physics/body";
import { Weapon } from "../weapons/weapon";
import { UnitType } from "./types";
import { WorldObject } from "../world";
import { Command, CommandType, generateImage } from "../../utils/image";
import { animationDuration, animationSpeed, getAnimation } from "../../resources/animation";
import { Resources } from "../../resources/ids";

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

function createUnitImage(skin: number, shirt: number, pants: number, boots: number) {
	const texture: Command[] = [
		{ type: CommandType.FILL, color: skin },
		{ type: CommandType.SIZE, width: 128, height: 128 },
		{ type: CommandType.FILL, color: shirt },
		{ type: CommandType.RECTANGLE, x: 64, y: 0, width: 64, height: 64 },
		{ type: CommandType.FILL, color: pants },
		{ type: CommandType.RECTANGLE, x: 0, y: 64, width: 64, height: 64 },
		{ type: CommandType.FILL, color: boots },
		{ type: CommandType.RECTANGLE, x: 64, y: 64, width: 64, height: 64 },
		{ type: CommandType.NOISE, colorOffset: 20 },
	];

	return generateImage(texture);
}

const images: { [key: number]: HTMLCanvasElement } = {
	[UnitType.PLAYER]: createUnitImage(0xffd9cb59, 0xff1b9100, 0xff423c09, 0xff1f1a01),
	[UnitType.ALLY]: createUnitImage(0xff594b04, 0xff40083b, 0xff0f5e63, 0xffbabfbf),
	[UnitType.ENEMY]: createUnitImage(0xffc46f4b, 0xff05a3a1, 0xff0581a3, 0xff2b2f30),
}

export function createUnit(settings: UnitSettings): Unit {
	const { radius, weight, health } = settings;
	const fsm = new FSM(settings.reaction);
	const body: Body = { radius, weight };
	const weapon = 0;

	let animationFrame = 0;
	let animationType = Resources.walk_zombie;
	let animationLoop = true;

	const image = images[settings.type];

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
				while (animationFrame >= duration ) {
					if (animationLoop) {
						animationFrame -= duration;
					} else {
						animationFrame = duration - 1;
						this.animationPaused = true;
					}
				}
			}
		}
	}
}