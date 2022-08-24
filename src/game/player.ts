import { Point } from "../geom/point";
import { getPlayerControl } from "./player-control";
import { createUnit, Unit, UnitSettings, UnitType } from "./unit";
import { controlWheapon as controlWeapon } from "./weapon";
import { World } from "./world";

const enum PlayerState {
	ALIVE = 0,
	DEAD = 1,
}

export function createPlayer(world: World): Unit {
	const wp = Point.create(30, 0);

	const settings: UnitSettings = {
		type: UnitType.PLAYER,
		radius: 30,
		weight: 90,
		health: 100,
		color: 0xff009999,
		walkSpeed: 200,
		reaction: 0.2,
		weapons: [
			{
				damage: 20,
				points: [wp],
				frequency: 3,
				speed: 1000,
				distance: 1000,
				color: 0xffffffff,
				length: 30,
				width: 4,
			},
			{
				damage: 40,
				points: [Point.create(30, -5), Point.create(30, 5)],
				frequency: 10,
				speed: 1500,
				distance: 1000,
				color: 0xffffff00,
				length: 50,
				width: 3,
			},
			{
				damage: 150,
				points: new Array(10).fill(wp),
				frequency: 1,
				speed: 1000,
				distance: 300,
				color: 0xff00ffff,
				length: 10,
				width: 3,
				angle: 0.7,
			}
		]
	}

	const player = createUnit(settings);
	const control = getPlayerControl(player, world);

	const { fsm } = player;
	const { actions, transitions } = fsm;
	const { walkSpeed } = settings;

	const weaponController = controlWeapon(player, world);

	actions.set(PlayerState.ALIVE, {
		data: {},
		time: 0,
		update(time) {
			const currentWalkSpeed = walkSpeed * time;
			player.x += control.direction.x * currentWalkSpeed;
			player.y += control.direction.y * currentWalkSpeed;

			player.rotation = control.rotation;
			player.weapon = control.weapon;

			weaponController(time, control.attack);
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