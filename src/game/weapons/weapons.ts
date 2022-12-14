import { createM4, translationM4 } from "../../geom/matrix";
import { pointCreate } from "../../geom/point";
import { createCube } from "../../models/cube";
import { transformGeometry } from "../../render/geometry";
import { Resources } from "../../resources/ids";
import { CommandType, generateImage } from "../../utils/image";
import { randomSelect } from "../../utils/math";
import { Weapon } from "./weapon";

function generateGeometry(x: number, y: number, z: number, w: number, h: number, l: number): Float32Array {
	const cube = createCube(w, h, l);
	const data = new Float32Array(cube.length);
	const matrix = createM4();
	translationM4(x, y, z, matrix);
	transformGeometry(cube, matrix, data, 0);
	return data;
}

export const wheaponImage = generateImage([
	{ type: CommandType.FILL, color: 0xff000000 },
	{ type: CommandType.SIZE, width: 32, height: 32 }
]);

const gunGeometry = generateGeometry(1.3, -0.3, 3, 0.5, 0.15, 0.15);
const rifleGeometry = generateGeometry(1.3, -0.3, 3, 1, 0.1, 0.1);
const shotgunGeometry = generateGeometry(1.3, -0.3, 3, 1.3, 0.2, 0.2);

export function hand(radius: number, damage: number): Weapon {
	return {
		damage,
		speed: 100,
		points: [pointCreate(radius, 0)],
		frequency: 1,
		distance: 20,
		length: 20,
		width: 20,
		impulse: 3,
		sound: Resources.sound_hit,
	}
}

export function gun(radius: number): Weapon {
	return {
		damage: 20,
		points: [pointCreate(radius, -radius * 0.3)],
		frequency: 3,
		speed: 1000,
		distance: 1000,
		length: 30,
		width: 4,
		impulse: 7,
		sound: Resources.sound_gun,
		geometry: gunGeometry,
	};
}

export function rifle(radius: number): Weapon {
	return {
		damage: 40,
		points: [pointCreate(radius * 1.5, -9), pointCreate(radius * 1.5, -11)],
		frequency: 10,
		speed: 1500,
		distance: 1000,
		length: 50,
		width: 3,
		impulse: 5,
		sound: Resources.sound_explosion,
		geometry: rifleGeometry,
	};
}

export function shotgun(radius: number): Weapon {
	return {
		damage: 150,
		points: new Array(15).fill(pointCreate(radius * 1.5, -10)),
		frequency: 1,
		speed: 1000,
		distance: 300,
		length: 10,
		width: 3,
		angle: 0.7,
		impulse: 5,
		sound: Resources.sound_shotgun,
		geometry: shotgunGeometry,
	};
}

export function randomWeapon(radius: number): Weapon {
	const method = randomSelect([gun, rifle, shotgun]);
	return method(radius);
}