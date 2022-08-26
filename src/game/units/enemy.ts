import { Point } from "../../geom/point";
import { mathAtan2, mathCos, math2PI, mathRandom, mathSin, randomFloat } from "../../utils/math";
import { FSMAction } from "../utils/fsm";
import { isFriend, Unit, UnitSettings, UnitType } from "./unit";
import { getWeaponControl } from "../weapons/weapon";
import { World } from "../world";
import { BaseState, createBase } from "./base";
import { hand } from "../weapons/weapons";

const enum EnemyState {
	GOTO_TARGET = 10,
	ATTACK = 11,
}

type TargetData = { target: Unit };

function isTargetNearby(target: Unit, enemy: Unit): boolean {
	const distanceSquared = Point.distanceSquared(target, enemy);
	const radiuses = enemy.body.radius + target.body.radius;
	const radiusesSquared = radiuses * radiuses;
	return distanceSquared < radiusesSquared * 1.1;
}

export function createEnemy(world: World) {
	const radius = randomFloat(25, 45);

	const settings: UnitSettings = {
		type: UnitType.ENEMY,
		radius,
		weight: radius * 3,
		health: radius * 4,
		color: 0xff990000,
		walkSpeed: 100,
		reaction: 0.5,
		weapons: [
			hand(radius, radius)
		]
	}

	const { units } = world;

	const unit = createBase(settings, world);

	const { walkSpeed } = settings;

	const enemyDistance = 400;
	const enemyDistanceSquared = enemyDistance * enemyDistance;

	unit.rotation = math2PI * mathRandom();

	const { fsm } = unit;
	const { actions, transitions } = fsm;

	const weaponControl = getWeaponControl(unit, world);

	actions.set(EnemyState.GOTO_TARGET, {
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
	} as FSMAction<TargetData>);

	actions.set(EnemyState.ATTACK, {
		update(time: number) {
			weaponControl(time, true);
		},
		start(target: Unit) {
			this.data = { target };
		}
	} as FSMAction<TargetData>);

	transitions.push({
		from: [BaseState.ROTATE, BaseState.WALK],
		to: EnemyState.GOTO_TARGET,
		condition() {
			for (const u of units) {
				if (!isFriend(u.type, unit.type) && u.health > 0) {
					const distanceSquared = Point.distanceSquared(u, unit);
					if (distanceSquared < enemyDistanceSquared) {
						this.data = u;
						return true;
					}
				}
			}
			return false;
		}
	});

	transitions.push({
		from: [EnemyState.GOTO_TARGET, EnemyState.ATTACK],
		to: BaseState.ROTATE,
		condition() {
			const target: Unit = (fsm.getAction().data as TargetData).target;
			if (target.health <= 0) {
				return true;
			}
			const distanceSquared = Point.distanceSquared(target, unit);
			return distanceSquared > enemyDistanceSquared * 1.5;
		}
	});

	transitions.push({
		from: [EnemyState.GOTO_TARGET],
		to: EnemyState.ATTACK,
		condition() {
			const target: Unit = (fsm.getAction().data as TargetData).target;
			if (isTargetNearby(target, unit)) {
				this.data = target;
				return true;
			}
			return false;
		}
	});

	transitions.push({
		from: [EnemyState.ATTACK],
		to: EnemyState.GOTO_TARGET,
		condition() {
			const target: Unit = (fsm.getAction().data as TargetData).target
			if (!isTargetNearby(target, unit)) {
				this.data = target;
				return true;
			}
			return false;
		}
	});

	return unit;
}