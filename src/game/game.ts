import { Point, pointCreate, pointDistance, pointDistanceSquared } from '../geom/point';
import { Component } from '../graphics/component';
import { chance, mathMax, mathMin, mathRound, randomFloat, randomInt } from '../utils/math';
import { createEnemy } from './units/enemy';
import { createAlly } from './units/ally';
import { createPlayer } from './units/player';
import { createWorld, WorldObject } from './world';
import { Unit } from './units/unit';
import { createBox } from '../physics/body';
import { UI } from './ui';
import { getPlayerControl } from './utils/player-control';
import { UnitType, isFriend } from './units/types';
import { setCamera } from '../render/render';
import { createCube } from '../models/cube';
import { Command, CommandType, generateImage } from '../utils/image';
import { generateHouses } from './objects/houses';
import { generateBorders } from './objects/borders';
import { generateLights } from './objects/lights';
import { UnitState } from './units/states';

const SIZE = 2500;

export interface Game extends Component {
	calculateVolume(point: Point): number;
	updateCamera(time: number): void;
}

function randomPosition(unit: Unit, units: Unit[], min: number, max: number) {
	const safeDistance = 200;
	const safeDistanceSquared = safeDistance * safeDistance;
	let iterations = 100;
	while (true) {
		unit.x = randomFloat(min, max);
		unit.y = randomFloat(min, max);
		let safe = true;
		for (const u of units) {
			if (!isFriend(u.settings.type, unit.settings.type)) {
				if (pointDistanceSquared(unit, u) < safeDistanceSquared) {
					safe = false;
					break;
				}
			}
		}
		if (safe) {
			break;
		}

		if (iterations-- < 0) {
			break
		}
	}
}

let score = 0;

export function addScore(count: number) {
	score += count;
}

export function game(ui: UI): Game {
	const camera = pointCreate();

	const world = createWorld();

	const playerControl = getPlayerControl(world, ui);

	const player = createPlayer(world, playerControl);
	playerControl.player = player;
	world.addUnit(player);

	const allyDistance = 300;
	const allyCount = 5

	let enemyCount = 20;
	const enemyDistance = 600;

	for (let i = 0; i < enemyCount; i++) {
		const enemy = createEnemy(world);
		randomPosition(enemy, world.units, -enemyDistance, enemyDistance);
		world.addUnit(enemy);
	}

	generateHouses(world);
	generateBorders(world);
	generateLights(world);

	function start() {
		enemyCount = 20;

		player.health = 100;
		player.body.enabled = true;
		player.fsm.setState(UnitState.WALK);

		while (world.getUnitCount(UnitType.ALLY) < allyCount) {
			const ally = createAlly(world);
			ally.x = randomFloat(-allyDistance, allyDistance);
			ally.y = randomFloat(-allyDistance, allyDistance);
			world.addUnit(ally);
		}
	}

	start();

	let finishTimeout = 0;

	const component: Game = {
		children: [
			world,
		],
		onUpdate(time: number) {
			if (world.getUnitCount(UnitType.ENEMY) < enemyCount) {
				const enemy = createEnemy(world, true);
				randomPosition(enemy, world.units, -enemyDistance * 2, enemyDistance * 2);
				world.addUnit(enemy);
			}

			ui.healthLabel.text!.value = player.health > 0 ? `health: ${mathRound(player.health)}` : 'WASTED';
			ui.scoreLabel.text!.value = `score: ${score}`;

			const finishVisible = ui.finishLabel.visible;
			ui.finishLabel.visible = player.health <= 0;
			if (ui.finishLabel.visible) {
				if (!finishVisible) {
					finishTimeout = 2;
				}
				ui.finishLabel.text!.value = 'WASTED!' + (finishTimeout <= 0 ? ' tap to start!' : '');
			}

			enemyCount = 20 + score / 3;

			if (finishTimeout > 0) {
				finishTimeout -= time;
			}
		},
		updateCamera() {
			setCamera(player.x!, player.y!, 1000);
		},
		calculateVolume(point: Point): number {
			const maxDistance = SIZE / 2;
			const distance = pointDistance(camera, point);
			return 1 - mathMin(1, mathMax(0, distance / maxDistance));
		},
		onTouchDown() {
			if (ui.finishLabel.visible && finishTimeout <= 0) {
				start();
			}
		}
	};

	return component;
}
