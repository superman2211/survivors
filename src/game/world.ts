import { Component } from "../graphics/component";
import { Bullet } from "./weapons/bullet";
import { createGround } from "./objects/ground";
import { updatePhysics } from "../physics/update-physics";
import { Unit } from "./units/unit";
import { Impulse, updateImpulses } from "./weapons/impulse";
import { pointDistanceSquared } from "../geom/point";
import { isFriend, UnitType } from "./units/types";
import { IBody } from "../physics/body";

export interface WorldObject extends Component, IBody {
	x: number,
	y: number,
}

export interface World extends Component {
	readonly units: Unit[];

	addUnit(unit: Unit): void;
	removeUnit(unit: Unit): void;
	getUnitCount(type: UnitType): number;
	getNearOpponent(unit: Unit, distance: number): Unit | null;

	addObject(obj: WorldObject): void;
	removeObject(obj: WorldObject): void;

	addBullet(bullet: Bullet): void;
	removeBullet(bullet: Bullet): void;

	addImpulse(impulse: Impulse): void;
}

export function createWorld(): World {
	const bodies: IBody[] = [];
	const units: Unit[] = [];
	const bullets: Bullet[] = [];
	const impulses: Impulse[] = [];
	const objects: Component[] = [];

	return {
		units,

		children: [
			createGround(),
			{ children: objects, touchable: false },
			{ children: units, touchable: false },
			{ children: bullets, touchable: false },
		],

		onUpdate(time) {
			updatePhysics(bodies, time);
			updateImpulses(impulses, time);
		},

		addObject(obj: Component & IBody) {
			objects.push(obj);
			bodies.push(obj);
		},

		removeObject(obj: Component & IBody) {
			objects.splice(objects.indexOf(obj), 1);
			bodies.splice(bodies.indexOf(obj), 1);
		},

		addUnit(unit: Unit) {
			units.push(unit);
			bodies.push(unit);
		},

		removeUnit(unit: Unit) {
			units.splice(units.indexOf(unit), 1);
			bodies.splice(bodies.indexOf(unit), 1);
		},

		getUnitCount(type: UnitType): number {
			let count = 0;
			for (const unit of this.units) {
				if (unit.settings.type === type) {
					count++;
				}
			}
			return count;
		},

		getNearOpponent(unit: Unit, distance: number): Unit | null {
			let target: Unit | null = null;
			let minDistance = distance * distance;
			for (const u of units) {
				if (!isFriend(u.settings.type, unit.settings.type) && u.health > 0) {
					const distanceSquared = pointDistanceSquared(u, unit);
					if (distanceSquared < minDistance) {
						minDistance = distanceSquared;
						target = u;
					}
				}
			}
			return target;
		},

		addBullet(bullet: Bullet) {
			bullets.push(bullet);
			bodies.push(bullet);
		},

		removeBullet(bullet: Bullet) {
			bullets.splice(bullets.indexOf(bullet), 1);
			bodies.splice(bodies.indexOf(bullet), 1);
		},

		addImpulse(impulse: Impulse) {
			impulses.push(impulse);
		}
	}
}