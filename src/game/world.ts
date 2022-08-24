import { Component } from "../graphics/component";
import { Bullet } from "./bullet";
import { createGround } from "./ground";
import { IBody, updatePhysics } from "./physics";
import { Unit } from "./unit";

export interface World extends Component {
	readonly units: Unit[];

	addUnit(unit: Unit): void;
	removeUnit(unit: Unit): void;

	addBullet(bullet: Bullet): void;
	removeBullet(bullet: Bullet): void;
}

export function createWorld(): World {
	const bodies: IBody[] = [];
	const units: Unit[] = [];
	const bullets: Bullet[] = [];

	return {
		units,

		children: [
			createGround(),
			{ children: units },
			{ children: bullets }
		],

		onUpdate(time) {
			updatePhysics(bodies, time);
		},

		addUnit(unit: Unit) {
			units.push(unit);
			bodies.push(unit);
		},

		removeUnit(unit: Unit) {
			units.splice(units.indexOf(unit), 1);
			bodies.splice(bodies.indexOf(unit), 1);
		},

		addBullet(bullet: Bullet) {
			bullets.push(bullet);
			bodies.push(bullet);
		},

		removeBullet(bullet: Bullet) {
			bullets.splice(bullets.indexOf(bullet), 1);
			bodies.splice(bodies.indexOf(bullet), 1);
		},
	}
}