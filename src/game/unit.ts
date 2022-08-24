import { Component } from "../graphics/component";
import { generateShape } from "../utils/generate-shape";
import { FSM } from "./fsm";
import { Body, IBody } from "./physics";
import { Weapon } from "./weapon";

export const enum UnitType {
	PLAYER,
	NPC,
	ENEMY
}

export interface UnitSettings {
	type: UnitType,
	radius: number,
	weight: number,
	health: number,
	reaction: number,
	walkSpeed: number,
	enemyDistance?: number,
	weapons?: Weapon[],

	// view
	color: number,
}

const friends = new Map<UnitType, UnitType>();
friends.set(UnitType.NPC, UnitType.PLAYER);
friends.set(UnitType.PLAYER, UnitType.NPC);

export function isFriend(type1: UnitType, type2: UnitType): boolean {
	if (type1 === type2) {
		return true;
	}
	return friends.get(type1) === friends.get(type2);
}

export interface Unit extends Component, IBody {
	x: number;
	y: number;
	rotation: number;
	fsm: FSM;
	type: UnitType;
	body: Body;
	settings: UnitSettings;
	health: number;
	weapon: number;
}

export function createUnit(settings: UnitSettings): Unit {
	const { radius, weight, color, type, health } = settings;
	const pallete = [color, 0xff000000];
	const fsm = new FSM(settings.reaction);
	const body: Body = { radius, weight };
	const wheapon = 0;

	const shape: number[] = [];
	generateShape(shape, 0, 0, 0, 5, 5, radius, radius, Math.PI / 10);
	generateShape(shape, 1, radius / 2, 0, 3, 3, radius / 3, radius / 3, Math.PI / 2);

	return {
		type,
		shape,
		pallete,
		rotation: 0,
		x: 0, y: 0,
		fsm,
		body,
		health,
		settings,
		weapon: wheapon,

		onUpdate(time) {
			this.fsm.update(time);
		}
	}
}