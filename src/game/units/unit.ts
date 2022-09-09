import { generateShape } from "../../utils/generate-shape";
import { mathPI } from "../../utils/math";
import { FSM } from "../utils/fsm";
import { Body, IBody } from "../../physics/body";
import { Weapon } from "../weapons/weapon";
import { UnitType } from "./types";
import { WorldObject } from "../world";
import { createCube } from "../../webgl/cube";
import { Command, CommandType, generateImage } from "../../utils/generate-image";
import { createFrame, getAnimation, readAnimation } from "../../resources/animation";
import { resources } from "../../resources/resources-loader";
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

	// view
	color: number,
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
}

function createUnitImage(color: number) {
	const texture: Command[] = [
		{ type: CommandType.FILL, color },// 5
		{ type: CommandType.SIZE, width: 128, height: 128 },
		{ type: CommandType.NOISE, colorOffset: 20 }, // 2
	];

	return generateImage(texture);
}

const images: { [key: number]: HTMLCanvasElement} = {
	[UnitType.PLAYER]: createUnitImage(0xff009999),
	[UnitType.ALLY]: createUnitImage(0xff999900),
	[UnitType.ENEMY]: createUnitImage(0xff990000),
}

export function createUnit(settings: UnitSettings): Unit {
	const { radius, weight, color, health } = settings;
	// const pallete = [color, 0xff000000];
	const fsm = new FSM(settings.reaction);
	const body: Body = { radius, weight };
	const weapon = 0;

	// const shape: number[] = [];
	// generateShape(shape, 0, 0, 0, 5, 5, radius, radius, mathPI / 10);
	// generateShape(shape, 1, radius / 2, 0, 3, 3, radius / 3, radius / 3, mathPI / 2);

	let animationTime = 0;
	let animationType = Resources.walk_forward;
	let animationSpeed = 30;

	const image = images[settings.type];

	return {
		image,
		rotationZ: 0,
		rotationX: 0,
		rotationY: 0,
		x: 0,
		y: 0,
		z: radius,
		scaleX: radius,
		scaleY: radius,
		scaleZ: radius,
		fsm,
		body,
		health,
		settings,
		weapon,

		onUpdate(time) {
			this.fsm.update(time);
			
			// this.rotationX! = direction.y / 200;
			// this.rotationY! = direction.x / 200;
			
			animationTime += time * animationSpeed;
			const animation = getAnimation(animationType);
			while(animationTime >= animation.length) {
				animationTime -= animation.length;
			}
			this.geometry = animation[animationTime | 0];
		}
	}
}