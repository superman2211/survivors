import { pointCreate } from "../../geom/point";
import { sound_explosion, sound_gun, sound_hit, sound_shotgun } from "../../resources/ids";
import { randomSelect } from "../../utils/math";
import { Weapon } from "./weapon";

export function hand(radius: number, damage: number): Weapon {
	return {
		damage,
		speed: 100,
		points: [pointCreate(radius, 0)],
		frequency: 1,
		distance: 20,
		color: 0xffff0000,
		length: 20,
		width: 20,
		impulse: 3,
		sound: sound_hit
	}
}

export function gun(radius: number): Weapon {
	return {
		damage: 20,
		points: [pointCreate(radius, 0)],
		frequency: 3,
		speed: 1000,
		distance: 1000,
		color: 0xffffffff,
		length: 30,
		width: 4,
		impulse: 5,
		sound: sound_gun,
	};
}

export function rifle(radius: number): Weapon {
	return {
		damage: 40,
		points: [pointCreate(radius, -5), pointCreate(radius, 5)],
		frequency: 10,
		speed: 1500,
		distance: 1000,
		color: 0xffffff00,
		length: 50,
		width: 3,
		impulse: 3,
		sound: sound_explosion,
	};
}

export function shotgun(radius: number): Weapon {
	return {
		damage: 150,
		points: new Array(10).fill(pointCreate(radius, 0)),
		frequency: 1,
		speed: 1000,
		distance: 300,
		color: 0xff00ffff,
		length: 10,
		width: 3,
		angle: 0.7,
		impulse: 5,
		sound: sound_shotgun
	};
}

export function randomWeapon(radius: number):Weapon {
	const method = randomSelect([gun, rifle, shotgun]);
	return method(radius);
}