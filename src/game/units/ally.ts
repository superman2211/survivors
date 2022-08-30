import { Point, pointDistanceSquared, pointLengthSquared, pointNormalize, pointVector } from "../../geom/point";
import { mathAtan2 } from "../../utils/math";
import { FSMAction } from "../utils/fsm";
import { getWeaponControl } from "../weapons/weapon";
import { randomWeapon } from "../weapons/weapons";
import { World } from "../world";
import { createBase } from "./base";
import { UnitState } from "./states";
import { isFriend, UnitType } from "./types";
import { Unit, UnitSettings } from "./unit";

type TargetData = { target: Unit };

function getSafePosition(unit: Unit, units: Unit[], enemyDistance: number, enemyDistanceSquared: number): Point | null {
	let { x, y } = unit;
	let count = 1;
	for (const u of units) {
		if (!isFriend(u.settings.type, unit.settings.type)) {
			const vector = pointVector(u, unit);
			if (pointLengthSquared(vector) < enemyDistanceSquared) {
				pointNormalize(vector, enemyDistance);
				x += vector.x;
				y += vector.y;
				count++;
			}
		}
	}
	if (count > 1) {
		x /= count;
		y /= count;
		return { x, y };
	}
	return null;
}

export function createAlly(world: World) {
	const radius = 30;

	const settings: UnitSettings = {
		type: UnitType.ALLY,
		radius,
		weight: 90,
		health: 100,
		color: 0xff999900,
		walkSpeed: 200,
		reaction: 0.2,
		weapons: [
			randomWeapon(radius),
		]
	};

	const unit = createBase(settings, world);

	const { fsm } = unit;
	const { actions, transitions } = fsm;
	const { units } = world;
	const { walkSpeed } = settings;

	const enemyDistance = 200;
	const enemyDistanceSquared = enemyDistance * enemyDistance;

	const weaponControl = getWeaponControl(unit, world);

	actions[UnitState.ATTACK] = {
		update(time) {
			const traget = this.data!.target;
			unit.rotation = mathAtan2(traget.y - unit.y, traget.x - unit.x);

			const safePosition = getSafePosition(unit, units, enemyDistance, enemyDistanceSquared);
			if (safePosition) {
				const vector = pointVector(unit, safePosition);
				if (pointLengthSquared(vector) > walkSpeed) {
					pointNormalize(vector, walkSpeed);
					unit.x += vector.x * time;
					unit.y += vector.y * time;
				}
			}

			weaponControl(time, true);
		},
		start(target: Unit) {
			this.data = { target };
		}
	} as FSMAction<TargetData>;

	transitions.push(
		{
			from: [UnitState.ROTATE, UnitState.WALK],
			to: UnitState.ATTACK,
			condition() {
				let target: Unit | null = world.getNearOpponent(unit, enemyDistance);
				if (target) {
					this.data = target;
					return true;
				}
				return false;
			}
		},
		{
			from: [UnitState.ATTACK],
			to: UnitState.ROTATE,
			condition() {
				const target: Unit = (fsm.getAction().data as TargetData).target;
				if (target.health <= 0) {
					return true;
				}
				const distanceSquared = pointDistanceSquared(target, unit);
				return distanceSquared > enemyDistanceSquared * 1.5;
			}
		}
	);

	return unit;
}