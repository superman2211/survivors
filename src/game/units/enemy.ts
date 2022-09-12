import { pointDistanceSquared } from "../../geom/point";
import { mathAtan2, mathCos, math2PI, mathRandom, mathSin, randomFloat, chance } from "../../utils/math";
import { FSMAction } from "../utils/fsm";
import { Unit, UnitSettings } from "./unit";
import { getWeaponControl } from "../weapons/weapon";
import { World } from "../world";
import { createBase } from "./base";
import { hand } from "../weapons/weapons";
import { UnitType } from "./types";
import { UnitState } from "./states";
import { Resources } from "../../resources/ids";

type TargetData = { target: Unit };

function isTargetNearby(target: Unit, enemy: Unit): boolean {
	const distanceSquared = pointDistanceSquared(target, enemy);
	const radiuses = enemy.body.radius + target.body.radius;
	const radiusesSquared = radiuses * radiuses;
	return distanceSquared < radiusesSquared * 1.1;
}

export function createEnemy(world: World, newEnemy: boolean = false) {
	const radius = randomFloat(25, 35);

	const settings: UnitSettings = {
		type: UnitType.ENEMY,
		radius,
		weight: radius * 3,
		health: radius * 4,
		walkSpeed: randomFloat(80, 150),
		reaction: 0.5,
		animationWalk: Resources.walk_zombie,
		weapons: [
			hand(radius, radius)
		]
	}

	const unit = createBase(settings, world);

	const { walkSpeed } = settings;

	const enemyDistance = 400;
	const enemyDistanceSquared = enemyDistance * enemyDistance;

	unit.rotationZ = math2PI * mathRandom();

	const { fsm } = unit;
	const { actions, transitions } = fsm;

	const weaponControl = getWeaponControl(unit, world);

	actions[UnitState.GOTO_TARGET] = {
		update(time: number) {
			unit.rotationZ = mathAtan2(this.data!.target.y - unit.y, this.data!.target.x - unit.x);
			const speedX = mathCos(unit.rotationZ) * walkSpeed;
			const speedY = mathSin(unit.rotationZ) * walkSpeed;
			unit.x += speedX * time;
			unit.y += speedY * time;
		},
		start(target: Unit) {
			this.data = { target };
			unit.playAnimation(settings.animationWalk, true);
		}
	} as FSMAction<TargetData>;

	actions[UnitState.ATTACK] = {
		update(time: number) {
			weaponControl(time, true);
		},
		start(target: Unit) {
			this.data = { target };
			unit.playAnimation(chance() ? Resources.attack_zombie_1 : Resources.attack_zombie_2, true)
		}
	} as FSMAction<TargetData>;

	transitions.push(
		{
			from: [UnitState.ROTATE, UnitState.WALK],
			to: UnitState.GOTO_TARGET,
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
			from: [UnitState.GOTO_TARGET, UnitState.ATTACK],
			to: UnitState.ROTATE,
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
			from: [UnitState.GOTO_TARGET],
			to: UnitState.ATTACK,
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
			from: [UnitState.ATTACK],
			to: UnitState.GOTO_TARGET,
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
