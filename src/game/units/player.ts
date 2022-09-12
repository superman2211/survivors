import { IPlayerControl } from "../utils/player-control";
import { createUnit, Unit, UnitSettings } from "./unit";
import { getWeaponControl } from "../weapons/weapon";
import { World } from "../world";
import { gun, rifle, shotgun } from "../weapons/weapons";
import { UnitType } from "./types";
import { UnitState } from "./states";
import { Resources } from "../../resources/ids";
import { chance } from "../../utils/math";

export function createPlayer(world: World, control: IPlayerControl): Unit {
	const radius = 30;

	const settings: UnitSettings = {
		type: UnitType.PLAYER,
		radius,
		weight: 90,
		health: 100000,
		walkSpeed: 200,
		reaction: 0.2,
		animationWalk: Resources.walk_forward,
		weapons: [
			gun(radius),
			rifle(radius),
			shotgun(radius),
		]
	}

	const unit = createUnit(settings);

	const { fsm } = unit;
	const { actions, transitions } = fsm;
	const { walkSpeed } = settings;

	const weaponControl = getWeaponControl(unit, world);

	actions[UnitState.WALK] = {
		update(time) {
			const { direction, rotation, attack, weapon } = control;
			const currentWalkSpeed = walkSpeed * time;
			unit.x += direction.x * currentWalkSpeed;
			unit.y += direction.y * currentWalkSpeed;

			unit.animationPaused = direction.x === 0 && direction.y === 0;

			unit.rotationZ = rotation;
			unit.weapon = weapon;

			weaponControl(time, attack);
		},
		start() {
			unit.playAnimation(settings.animationWalk, true);
		}
	};

	actions[UnitState.DEAD] = {
		update() {
		},
		start() {
			unit.alpha = 0.5;
			unit.body.enabled = false;
			unit.playAnimation(chance() ? Resources.dead_hero : Resources.dead_zombie, false);
		}
	};

	transitions.push({
		from: [],
		to: UnitState.DEAD,
		condition() {
			return unit.health <= 0;
		}
	});

	fsm.setState(UnitState.WALK);

	return unit;
}