import { IPlayerControl } from "../utils/player-control";
import { createUnit, Unit, UnitSettings } from "./unit";
import { getWeaponControl } from "../weapons/weapon";
import { World } from "../world";
import { gun, rifle, shotgun } from "../weapons/weapons";
import { UNIT_PLAYER } from "./types";
import { STATE_DEAD, STATE_WALK } from "./states";

export function createPlayer(world: World, control: IPlayerControl): Unit {
	const radius = 30;

	const settings: UnitSettings = {
		type: UNIT_PLAYER,
		radius,
		weight: 90,
		health: 100,
		color: 0xff009999,
		walkSpeed: 200,
		reaction: 0.2,
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

	actions.set(STATE_WALK, {
		update(time) {
			const currentWalkSpeed = walkSpeed * time;
			unit.x += control.direction.x * currentWalkSpeed;
			unit.y += control.direction.y * currentWalkSpeed;

			unit.rotation = control.rotation;
			unit.weapon = control.weapon;

			weaponControl(time, control.attack);
		},
		start() {
		}
	});

	actions.set(STATE_DEAD, {
		update() {
		},
		start() {
			unit.alpha = 0.5;
			unit.body.enabled = false;
		}
	});

	transitions.push({
		from: [],
		to: STATE_DEAD,
		condition() {
			return unit.health <= 0;
		}
	});

	fsm.setState(STATE_WALK);

	return unit;
}