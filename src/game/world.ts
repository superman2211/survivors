import { Component } from "../graphics/component";
import { Bullet } from "./weapons/bullet";
import { createGround } from "./objects/ground";
import { IBody, updatePhysics } from "./utils/physics";
import { isFriend, Unit, UnitType } from "./units/unit";
import { Impulse, updateImpulses } from "./weapons/impulse";
import { Point } from "../geom/point";

export interface World extends Component {
	readonly units: Unit[];

	addUnit(unit: Unit): void;
	removeUnit(unit: Unit): void;
	getUnitCount(type: UnitType): number;
	getNearOpponent(unit: Unit, distance: number): Unit | null;

	addBullet(bullet: Bullet): void;
	removeBullet(bullet: Bullet): void;

	addImpulse(impulse: Impulse): void;
}

export function createWorld(): World {
	const bodies: IBody[] = [];
	const units: Unit[] = [];
	const bullets: Bullet[] = [];
	const impulses: Impulse[] = [];

	return {
		units,

		children: [
			createGround(),
			{ children: units },
			{ children: bullets }
		],

		onUpdate(time) {
			updatePhysics(bodies, time);
			updateImpulses(impulses, time);
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
				if (unit.type === type) {
					count++;
				}
			}
			return count;
		},

		getNearOpponent(unit: Unit, distance: number): Unit | null {
			let target: Unit | null = null;
			let minDistance = distance * distance;
			for (const u of units) {
				if (!isFriend(u.type, unit.type) && u.health > 0) {
					const distanceSquared = Point.distanceSquared(u, unit);
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