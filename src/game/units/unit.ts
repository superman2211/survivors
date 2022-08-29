import { Component } from "../../graphics/component";
import { generateShape } from "../../utils/generate-shape";
import { FSM } from "../utils/fsm";
import { Body, IBody } from "../utils/physics";
import { Weapon } from "../weapons/weapon";



export interface UnitSettings {
	type: number,
	radius: number,
	weight: number,
	health: number,
	reaction: number,
	walkSpeed: number,
	weapons?: Weapon[],

	// view
	color: number,
}

export interface Unit extends Component, IBody {
	x: number;
	y: number;
	rotation: number;
	fsm: FSM;
	type: number;
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