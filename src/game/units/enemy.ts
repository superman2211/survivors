import { pointDistanceSquared } from "../../geom/point";
import { mathAtan2, mathCos, math2PI, mathRandom, mathSin, randomFloat } from "../../utils/math";
import { FSMAction } from "../utils/fsm";
import { Unit, UnitSettings } from "./unit";
import { getWeaponControl } from "../weapons/weapon";
import { World } from "../world";
import { createBase } from "./base";
import { hand } from "../weapons/weapons";
import { UNIT_ENEMY } from "./types";
import { STATE_ATTACK, STATE_GOTO_TARGET, STATE_ROTATE, STATE_WALK } from "./states";

type TargetData = { target: Unit };

function isTargetNearby(target: Unit, enemy: Unit): boolean {
	const distanceSquared = pointDistanceSquared(target, enemy);
	const radiuses = enemy.body.radius + target.body.radius;
	const radiusesSquared = radiuses * radiuses;
	return distanceSquared < radiusesSquared * 1.1;
}

export function createEnemy(world: World) {
	const radius = randomFloat(25, 45);

	const settings: UnitSettings = {
		type: UNIT_ENEMY,
		radius,
		weight: radius * 3,
		health: radius * 4,
		color: 0xff990000,
		walkSpeed: randomFloat(80, 150),
		reaction: 0.5,
		weapons: [
			hand(radius, radius)
		]
	}

	const unit = createBase(settings, world);

	const { walkSpeed } = settings;

	const enemyDistance = 400;
	const enemyDistanceSquared = enemyDistance * enemyDistance;

	unit.rotation = math2PI * mathRandom();

	const { fsm } = unit;
	const { actions, transitions } = fsm;

	const weaponControl = getWeaponControl(unit, world);

	actions[STATE_GOTO_TARGET] = {
		update(time: number) {
			unit.rotation = mathAtan2(this.data!.target.y - unit.y, this.data!.target.x - unit.x);
			const speedX = mathCos(unit.rotation) * walkSpeed;
			const speedY = mathSin(unit.rotation) * walkSpeed;
			unit.x += speedX * time;
			unit.y += speedY * time;
		},
		start(target: Unit) {
			this.data = { target };
		}
	} as FSMAction<TargetData>;

	actions[STATE_ATTACK] = {
		update(time: number) {
			weaponControl(time, true);
		},
		start(target: Unit) {
			this.data = { target };
		}
	} as FSMAction<TargetData>;

	transitions.push(
		{
			from: [STATE_ROTATE, STATE_WALK],
			to: STATE_GOTO_TARGET,
			condition() {
				const target: Unit | null = world.getNearOpponent(unit, enemyDistance);
				if (target) {
					this.data = target;
					return true;
				}
				return false;
			}
		},
		{
			from: [STATE_GOTO_TARGET, STATE_ATTACK],
			to: STATE_ROTATE,
			condition() {
				const target: Unit = (fsm.getAction().data as TargetData).target;
				if (target.health <= 0) {
					return true;
				}

				const distanceSquared = pointDistanceSquared(target, unit);
				if (distanceSquared > enemyDistanceSquared * 1.5) {
					return true;
				}

				const opponent = world.getNearOpponent(unit, enemyDistance);
				if (opponent != target) {
					return true;
				}

				return false;
			}
		},
		{
			from: [STATE_GOTO_TARGET],
			to: STATE_ATTACK,
			condition() {
				const target: Unit = (fsm.getAction().data as TargetData).target;
				if (isTargetNearby(target, unit)) {
					this.data = target;
					return true;
				}
				return false;
			}
		},
		{
			from: [STATE_ATTACK],
			to: STATE_GOTO_TARGET,
			condition() {
				const target: Unit = (fsm.getAction().data as TargetData).target
				if (!isTargetNearby(target, unit)) {
					this.data = target;
					return true;
				}
				return false;
			}
		}
	);

	return unit;
}