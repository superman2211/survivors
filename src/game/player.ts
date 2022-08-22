import { Point } from "../geom/point";
import { Component } from "../graphics/component";
import { mathAtan2 } from "../utils/math";
import { createUnit, Unit, UnitType } from "./unit";

export function createPlayer(world: Component, units: Unit[]): Unit {
	const player = createUnit(UnitType.PLAYER, 30, 90, 0xff009999, 200);

	const { fsm } = player;

	fsm.actions.set(0, {
		data: {},
		time: 0,
		update(time) {

		},
		start() {

		}
	});

	fsm.setState(0);

	world.onTouchMove = (p: Point) => {
		player.rotation = mathAtan2(p.y - player.y, p.x - player.x);
	};

	player.onKeyDown = (e: KeyboardEvent) => {
		switch (e.code) {
			case 'KeyW':
			case 'ArrowUp':
				player.direction.up = true;
				break;
			case 'KeyS':
			case 'ArrowDown':
				player.direction.down = true;
				break;
			case 'KeyA':
			case 'ArrowLeft':
				player.direction.left = true;
				break;
			case 'KeyD':
			case 'ArrowRight':
				player.direction.right = true;
				break;
		}
	};

	player.onKeyUp = (e: KeyboardEvent) => {
		switch (e.code) {
			case 'KeyW':
			case 'ArrowUp':
				player.direction.up = false;
				break;
			case 'KeyS':
			case 'ArrowDown':
				player.direction.down = false;
				break;
			case 'KeyA':
			case 'ArrowLeft':
				player.direction.left = false;
				break;
			case 'KeyD':
			case 'ArrowRight':
				player.direction.right = false;
				break;
		};
	}

	return player;
}