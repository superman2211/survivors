import { Point } from "../geom/point";
import { Component } from "../graphics/component";
import { mathAtan2 } from "../utils/math";
import { Unit } from "./unit";

export function playerController(player: Unit, world: Component) {
	world.onTouchMove = (p: Point) => {
		player.rotation = mathAtan2(p.y - player.y!, p.x - player.x!);
	},

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
}