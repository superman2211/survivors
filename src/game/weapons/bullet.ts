import { Point } from "../../geom/point";
import { Component } from "../../graphics/component";
import { FILL, PATH, Shape } from "../../graphics/shape";
import { mathCos, mathSin, mathSqrt } from "../../utils/math";
import { IBody, Body } from "../utils/physics";
import { isFriend, Unit, UnitType } from "../units/unit";
import { Weapon } from "./weapon";
import { World } from "../world";

export interface Bullet extends Component, IBody {
	x: number,
	y: number,
}

export function createBullet(x: number, y: number, rotation: number, weapon: Weapon, type: UnitType, world: World): Bullet {
	const speed: Point = {
		x: weapon.speed * mathCos(rotation),
		y: weapon.speed * mathSin(rotation),
	}

	let distance = 0;
	const step = Point.length(speed);

	const body: Body = {
		weight: 0,
		radius: 3,
		transparent: true,
	}

	const { length, width, color } = weapon;
	const width2 = width / 2;
	const pallete = [color];
	const shape: Shape = [
		PATH, 3,
		-length, 0,
		0, -width2,
		0, width2,
		FILL, 0,
	];

	const bullet: Bullet = {
		x, y, rotation,
		body,

		// view
		shape,
		pallete,

		onUpdate(time) {
			this.x += speed.x * time;
			this.y += speed.y * time;

			distance += step * time;
			if (distance > weapon.distance) {
				world.removeBullet(bullet);
			}
		},

		onCollision(o: IBody, p: Point) {
			if ('health' in o) {
				const target = o as Unit;
				if (!isFriend(target.type, type)) {
					target.health -= weapon.damage / weapon.points.length;
					world.removeBullet(bullet);

					if (weapon.impulse) {
						const value = Point.create(speed.x, speed.y);
						Point.normalize(value, weapon.impulse);
						world.addImpulse({ target, value });
					}
				}
			}
		}
	}

	return bullet;
}