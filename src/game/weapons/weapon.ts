import { Matrix } from "../../geom/matrix";
import { Point } from "../../geom/point";
import { mathCos, mathSin } from "../../utils/math";
import { createBullet } from "./bullet";
import { Unit } from "../units/unit";
import { World } from "../world";

export interface Weapon {
	speed: number,
	damage: number,
	color: number,
	length: number,
	width: number,
	points: Point[],
	frequency: number,
	distance: number,
	angle?: number,
}

export function controlWheapon(unit: Unit, world: World) {
	let weaponTime = 0;
	let pointIndex = 0;
	return (time: number, active: boolean) => {
		if (active && unit.settings.weapons) {
			const weapon = unit.settings.weapons[unit.weapon];
			weaponTime -= time;
			if (weaponTime <= 0) {
				weaponTime = 1 / weapon.frequency;

				const { rotation, type } = unit;

				if (weapon.angle) {
					let angle = rotation - weapon.angle / 2;
					const angleStep = weapon.angle / weapon.points.length;
					for (const point of weapon.points) {
						const cos = mathCos(angle);
						const sin = mathSin(angle);
						const { x, y } = point;
						const resultX = unit.x + x * cos - y * sin;
						const resultY = unit.y + x * sin + y * cos;
						const bullet = createBullet(
							resultX,
							resultY,
							angle,
							weapon,
							type,
							world,
						);
						world.addBullet(bullet);
						angle += angleStep;
					}
				} else {
					pointIndex++;
					if (pointIndex >= weapon.points.length) {
						pointIndex = 0;
					}

					const cos = mathCos(rotation);
					const sin = mathSin(rotation);

					const { x, y } = weapon.points[pointIndex];
					const resultX = unit.x + x * cos - y * sin;
					const resultY = unit.y + x * sin + y * cos;
					const bullet = createBullet(
						resultX,
						resultY,
						rotation,
						weapon,
						type,
						world,
					);
					world.addBullet(bullet);
				}
			}
		} else {
			weaponTime = 0;
		}
	}
}