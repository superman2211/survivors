import { Point } from "../geom/point";
import { Component } from "../graphics/component";
import { mathAtan2 } from "../utils/math";
import { getPlayerControl } from "./player-control";
import { createUnit, Unit, UnitSettings, UnitType } from "./unit";

const enum PlayerState {
	ALIVE = 0,
	DEAD = 1,
}

export function createPlayer(world: Component, units: Unit[]): Unit {
	const settings: UnitSettings = {
		type: UnitType.PLAYER,
		radius: 30,
		weight: 90,
		health: 100,
		color: 0xff009999,
		walkSpeed: 200,
		reaction: 0.2,
	}

	const player = createUnit(settings);
	const control = getPlayerControl(player, world);

	const { fsm } = player;
	const { actions, transitions } = fsm;
	const { walkSpeed } = settings;

	actions.set(PlayerState.ALIVE, {
		data: {},
		time: 0,
		update(time) {
			const currentWalkSpeed = walkSpeed * time;
			player.x += control.direction.x * currentWalkSpeed;
			player.y += control.direction.y * currentWalkSpeed;

			player.rotation = control.rotation;

			if (control.attack) {
				console.log('attack');
			}
		},
		start() {
		}
	});

	actions.set(PlayerState.DEAD, {
		data: {},
		time: 0,
		update(time) {
		},
		start() {
			player.alpha = 0.5;
			player.body.enabled = false;
		}
	});

	transitions.push({
		from: [],
		to: PlayerState.DEAD,
		condition() {
			return player.health <= 0;
		}
	});

	fsm.setState(PlayerState.ALIVE);

	return player;
}