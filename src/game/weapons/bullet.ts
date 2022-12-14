import { Point, pointCreate, pointLength, pointNormalize } from "../../geom/point";
import { mathCos, mathSin } from "../../utils/math";
import { IBody, Body } from "../../physics/body";
import { Unit } from "../units/unit";
import { Weapon } from "./weapon";
import { World, WorldObject } from "../world";
import { isFriend, UnitType } from "../units/types";
import { createCube } from "../../models/cube";
import { Command, CommandType, generateImage } from "../../utils/image";

export interface Bullet extends WorldObject {
}

const geometry = createCube(1, 1, 1);

const texture: Command[] = [
	{ type: CommandType.FILL, color: 0xffffffff },// 5
	{ type: CommandType.SIZE, width: 64, height: 64 },
	{ type: CommandType.NOISE, colorOffset: 20 }, // 2
];

const image = generateImage(texture);

export function createBullet(x: number, y: number, rotationZ: number, weapon: Weapon, speed: number, type: UnitType, world: World): Bullet {
	const speedVector: Point = {
		x: speed * mathCos(rotationZ),
		y: speed * mathSin(rotationZ),
	}

	let distance = 0;
	const step = pointLength(speedVector);

	const body: Body = {
		weight: 0,
		radius: 3,
		transparent: true,
	}

	const { length, width } = weapon;
	const width2 = width / 2;

	const bullet: Bullet = {
		x,
		y,
		scaleX: length,
		scaleY: width2,
		scaleZ: width2,
		rotationZ,
		body,
		geometry,
		image,
		color: [10, 10, 10, 1],

		onUpdate(time) {
			this.x += speedVector.x * time;
			this.y += speedVector.y * time;

			distance += step * time;
			if (distance > weapon.distance) {
				world.removeBullet(bullet);
			}
		},

		onCollision(o: IBody, p: Point) {
			if ('health' in o) {
				const target = o as Unit;
				if (!isFriend(target.settings.type, type)) {
					target.health -= weapon.damage / weapon.points.length;
					world.removeBullet(bullet);

					if (weapon.impulse) {
						const value = pointCreate(speedVector.x, speedVector.y);
						pointNormalize(value, weapon.impulse);
						world.addImpulse({ target, value });
					}
				}
			} else if (o.body.static) {
				world.removeBullet(bullet);
			}
		}
	}

	return bullet;
}