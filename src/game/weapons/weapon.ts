import { Point } from "../../geom/point";
import { mathCos, mathSin, randomFloat } from "../../utils/math";
import { createBullet } from "./bullet";
import { Unit } from "../units/unit";
import { World } from "../world";
import { UnitType } from "../units/types";
import { playAudio } from "../../media/sfx";

export interface Weapon {
	speed: number,
	damage: number, 
	length: number,
	width: number,
	points: Point[],
	frequency: number,
	distance: number,
	impulse?: number,
	angle?: number,
	sound: number,
	geometry?: Float32Array,
}

export function getWeaponControl(unit: Unit, world: World) {
	let weaponTime = 0;
	let pointIndex = 0;
	const { settings } = unit;
	const { type, weapons } = settings;
	return (time: number, active: boolean) => {
		if (active && weapons) {
			const weapon = weapons[unit.weapon];
			weaponTime -= time;
			if (weaponTime <= 0) {

				if (unit.settings.type == UnitType.PLAYER) {
					playAudio(weapon.sound);
				}

				weaponTime = 1 / weapon.frequency;

				const { rotationZ } = unit;

				if (weapon.angle) {
					let angle = rotationZ - weapon.angle / 2;
					const angleStep = weapon.angle / weapon.points.length;
					for (const point of weapon.points) {
						const cos = mathCos(angle);
						const sin = mathSin(angle);
						const { x, y } = point;
						const targetX = x + randomFloat(0, 10);
						const resultX = unit.x + targetX * cos - y * sin;
						const resultY = unit.y + targetX * sin + y * cos;
						const bullet = createBullet(
							resultX,
							resultY,
							angle,
							weapon,
							weapon.speed * randomFloat(0.7, 1.3),
							type,
							world,
						);
						bullet.z = 90;
						world.addBullet(bullet);
						angle += angleStep;
					}
				} else {
					pointIndex++;
					if (pointIndex >= weapon.points.length) {
						pointIndex = 0;
					}

					const cos = mathCos(rotationZ);
					const sin = mathSin(rotationZ);

					const { x, y } = weapon.points[pointIndex];
					const resultX = unit.x + x * cos - y * sin;
					const resultY = unit.y + x * sin + y * cos;
					const bullet = createBullet(
						resultX,
						resultY,
						rotationZ,
						weapon,
						weapon.speed,
						type,
						world,
					);
					bullet.z = 90;
					world.addBullet(bullet);
				}
			}
		} else {
			weaponTime -= time;
		}
	}
}