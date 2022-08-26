import { Point } from "../../geom/point";
import { randomFloat, randomSelect } from "../../utils/math";
import { Weapon } from "./weapon";

export function hand(radius: number, damage: number): Weapon {
	return {
		damage,
		speed: 100,
		points: [Point.create(radius, 0)],
		frequency: 1,
		distance: 20,
		color: 0xffff0000,
		length: 20,
		width: 20,
		impulse: 3,
	}
}

export function gun(radius: number): Weapon {
	return {
		damage: 20,
		points: [Point.create(radius, 0)],
		frequency: 3,
		speed: 1000,
		distance: 1000,
		color: 0xffffffff,
		length: 30,
		width: 4,
		impulse: 5,
	};
}

export function rifle(radius: number): Weapon {
	return {
		damage: 40,
		points: [Point.create(radius, -5), Point.create(radius, 5)],
		frequency: 10,
		speed: 1500,
		distance: 1000,
		color: 0xffffff00,
		length: 50,
		width: 3,
		impulse: 3,
	};
}

export function shotgun(radius: number): Weapon {
	return {
		damage: 150,
		points: new Array(10).fill(Point.create(radius, 0)),
		frequency: 1,
		speed: 1000,
		distance: 300,
		color: 0xff00ffff,
		length: 10,
		width: 3,
		angle: 0.7,
		impulse: 5
	};
}

export function randomWeapon(radius: number):Weapon {
	const method = randomSelect([gun, rifle, shotgun]);
	return method(radius);
}