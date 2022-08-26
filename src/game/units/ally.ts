import { Point } from "../../geom/point";
import { mathAtan2 } from "../../utils/math";
import { FSMAction } from "../utils/fsm";
import { getWeaponControl } from "../weapons/weapon";
import { randomWeapon } from "../weapons/weapons";
import { World } from "../world";
import { BaseState, createBase } from "./base";
import { isFriend, Unit, UnitSettings, UnitType } from "./unit";

const enum AllyState {
	ATTACK = 10,
}

type TargetData = { target: Unit };

export function createAlly(world: World) {
	const radius = 30;

	const settings: UnitSettings = {
		type: UnitType.NPC,
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
	const { walkSpeed } = settings;
	const { units } = world;

	const enemyDistance = 200;
	const enemyDistanceSquared = enemyDistance * enemyDistance;

	const weaponControl = getWeaponControl(unit, world);

	actions.set(AllyState.ATTACK, {
		update(time) {
			const traget = this.data!.target;
			unit.rotation = mathAtan2(traget.y - unit.y, traget.x - unit.x);
			weaponControl(time, true);
		},
		start(target: Unit) {
			this.data = { target };
		}
	} as FSMAction<TargetData>)

	transitions.push({
		from: [BaseState.ROTATE, BaseState.WALK],
		to: AllyState.ATTACK,
		condition() {
			let target: Unit | null = null;
			let minDistance = enemyDistanceSquared;
			for (const u of units) {
				if (!isFriend(u.type, unit.type) && u.health > 0) {
					const distanceSquared = Point.distanceSquared(u, unit);
					if (distanceSquared < minDistance) {
						minDistance = distanceSquared;
						target = u;
					}
				}
			}
			if (target) {
				this.data = target;
				return true;
			}
			return false;
		}
	});

	transitions.push({
		from: [AllyState.ATTACK],
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

	return unit;
}