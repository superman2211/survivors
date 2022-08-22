import { Point } from "../geom/point";
import { Component } from "../graphics/component";
import { generateShape } from "../utils/generate-shape";
import { FSM } from "./fsm";
import { Body, IBody } from "./physics";

export const enum UnitType {
	PLAYER,
	NPC,
	ENEMY
}

export const friends = new Map<UnitType, UnitType>();
friends.set(UnitType.NPC, UnitType.PLAYER);
friends.set(UnitType.PLAYER, UnitType.NPC);

export interface Unit extends Component, IBody {
	x: number;
	y: number;
	rotation: number;
	direction: Direction;
	speed: Point;
	targetSpeed: Point;
	walkSpeed: number;
	fsm: FSM;
	type: UnitType;
	body: Body;
	health: number;
}

export interface Direction {
	up: boolean;
	down: boolean;
	left: boolean;
	right: boolean;
}

export function isFriend(unit1: Unit, unit2: Unit): boolean {
	if (unit1.type === unit2.type) {
		return true;
	}
	return friends.get(unit1.type) === friends.get(unit2.type);
}

export function createUnit(type: UnitType, radius: number, weight: number, health: number,  color: number, walkSpeed: number): Unit {
	const shape: number[] = [];
	const pallete = [color, 0xff000000];
	const speed = Point.create();
	const targetSpeed = Point.create();
	const fsm = new FSM();
	const body: Body = { radius, weight };
	const direction: Direction = { up: false, down: false, left: false, right: false }
	generateShape(shape, 0, 0, 0, 5, 5, radius, radius, Math.PI / 10);
	generateShape(shape, 1, radius / 2, 0, 3, 3, radius / 3, radius / 3, Math.PI / 2);
	return {
		type,
		shape,
		pallete,
		rotation: 0,
		x: 0, y: 0,
		speed,
		targetSpeed,
		direction,
		walkSpeed,
		fsm,
		body,
		health,

		onUpdate(time) {
			this.fsm.update(time);

			this.targetSpeed.x = 0;
			this.targetSpeed.y = 0;

			if (this.direction.up) {
				this.targetSpeed.y -= 1;
			}
			if (this.direction.down) {
				this.targetSpeed.y += 1;
			}
			if (this.direction.left) {
				this.targetSpeed.x -= 1;
			}
			if (this.direction.right) {
				this.targetSpeed.x += 1;
			}

			Point.normalize(this.targetSpeed, this.walkSpeed);

			this.speed.x += (this.targetSpeed.x - this.speed.x) / 3;
			this.speed.y += (this.targetSpeed.y - this.speed.y) / 3;

			this.x! += this.speed.x * time;
			this.y! += this.speed.y * time;
		}
	}
}