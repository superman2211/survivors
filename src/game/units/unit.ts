import { generateShape } from "../../utils/generate-shape";
import { mathPI } from "../../utils/math";
import { FSM } from "../utils/fsm";
import { Body, IBody } from "../../physics/body";
import { Weapon } from "../weapons/weapon";
import { UnitType } from "./types";
import { WorldObject } from "../world";

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
	rotation: number;
	fsm: FSM;
	body: Body;
	settings: UnitSettings;
	health: number;
	weapon: number;
}

export function createUnit(settings: UnitSettings): Unit {
	const { radius, weight, color, health } = settings;
	const pallete = [color, 0xff000000];
	const fsm = new FSM(settings.reaction);
	const body: Body = { radius, weight };
	const weapon = 0;

	const shape: number[] = [];
	generateShape(shape, 0, 0, 0, 5, 5, radius, radius, mathPI / 10);
	generateShape(shape, 1, radius / 2, 0, 3, 3, radius / 3, radius / 3, mathPI / 2);

	return {
		shape,
		pallete,
		rotation: 0,
		x: 0, y: 0,
		fsm,
		body,
		health,
		settings,
		weapon,

		onUpdate(time) {
			this.fsm.update(time);
		}
	}
}