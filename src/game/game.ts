import { Point, pointCreate, pointDistance, pointDistanceSquared } from '../geom/point';
import { Component } from '../graphics/component';
import { mathMax, mathMin, randomFloat } from '../utils/math';
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

export function game(ui: UI): Game {
	const camera = pointCreate();

	const world = createWorld();

	const playerControl = getPlayerControl(world, ui);

	const player = createPlayer(world, playerControl);
	playerControl.player = player;
	world.addUnit(player);

	const allyDistance = 300;
	for (let i = 0; i < 5; i++) {
		const ally = createAlly(world);
		ally.x = randomFloat(-allyDistance, allyDistance);
		ally.y = randomFloat(-allyDistance, allyDistance);
		world.addUnit(ally);
	}

	const enemyCount = 10;
	const enemyDistance = 600;

	for (let i = 0; i < enemyCount; i++) {
		const enemy = createEnemy(world);
		randomPosition(enemy, world.units, -enemyDistance, enemyDistance);
		world.addUnit(enemy);
	}

	generateHouses(world);
	generateBorders(world);

	const component: Game = {
		children: [
			world,
		],
		onUpdate() {
			if (world.getUnitCount(UnitType.ENEMY) < enemyCount) {
				const enemy = createEnemy(world, true);
				randomPosition(enemy, world.units, -enemyDistance, enemyDistance);
				world.addUnit(enemy);
			}
		},
		updateCamera() {
			setCamera(player.x!, player.y!, 1000);
		},
		calculateVolume(point: Point): number {
			const maxDistance = SIZE / 2;
			const distance = pointDistance(camera, point);
			return 1 - mathMin(1, mathMax(0, distance / maxDistance));
		}
	};

	return component;
}
