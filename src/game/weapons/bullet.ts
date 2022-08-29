import { Point, pointCreate, pointLength, pointNormalize } from "../../geom/point";
import { Component } from "../../graphics/component";
import { FILL, PATH, Shape } from "../../graphics/shape";
import { mathCos, mathSin } from "../../utils/math";
import { IBody, Body } from "../utils/physics";
import { Unit } from "../units/unit";
import { Weapon } from "./weapon";
import { World } from "../world";
import { isFriend } from "../units/types";

export interface Bullet extends Component, IBody {
	x: number,
	y: number,
}

export function createBullet(x: number, y: number, rotation: number, weapon: Weapon, type: number, world: World): Bullet {
	const speed: Point = {
		x: weapon.speed * mathCos(rotation),
		y: weapon.speed * mathSin(rotation),
	}

	let distance = 0;
	const step = pointLength(speed);

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
						const value = pointCreate(speed.x, speed.y);
						pointNormalize(value, weapon.impulse);
						world.addImpulse({ target, value });
					}
				}
			}
		}
	}

	return bullet;
}