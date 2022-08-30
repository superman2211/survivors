import { Point, pointCreate, pointDistance, pointDistanceSquared } from '../geom/point';
import { Component } from '../graphics/component';

import { mathMax, mathMin, randomFloat } from '../utils/math';
import { createEnemy } from './units/enemy';
import { createAlly } from './units/ally';
import { createPlayer } from './units/player';
import { createWorld } from './world';
import { Unit } from './units/unit';
import { IBody } from './utils/physics';
import { generateShape } from '../utils/generate-shape';
import { UI } from './ui';
import { getPlayerControl } from './utils/player-control';
import { UnitType, isFriend } from './units/types';

const SIZE = 2500;

export interface Game extends Component {
	camera: Point;
	size: number;
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

	const enemyCount = 30;
	const enemyDistance = 600;

	for (let i = 0; i < enemyCount; i++) {
		const enemy = createEnemy(world);
		randomPosition(enemy, world.units, -enemyDistance, enemyDistance);
		world.addUnit(enemy);
	}

	const allyDistance = 300;
	for (let i = 0; i < 10; i++) {
		const ally = createAlly(world);
		ally.x = randomFloat(-allyDistance, allyDistance);
		ally.y = randomFloat(-allyDistance, allyDistance);
		world.addUnit(ally);
	}

	const shape: number[] = [];
	generateShape(shape, 0, 0, 0, 10, 10, 100, 100);
	const colon: Component & IBody = {
		x: 512, y: 0,
		rotation: 0,
		pallete: [0xff660066],
		shape,
		body: { weight: 0, static: true, radius: 100, },
	}

	world.addObject(colon);

	const component: Game = {
		camera,
		children: [
			world,
		],
		size: SIZE,
		onUpdate() {
			if (world.getUnitCount(UnitType.ENEMY) < enemyCount) {
				const enemy = createEnemy(world);
				randomPosition(enemy, world.units, -enemyDistance, enemyDistance);
				world.addUnit(enemy);
			}
		},
		updateCamera() {
			this.camera.x = player.x!;
			this.camera.y = player.y!;

			this.children?.forEach(child => {
				world.x = -this.camera.x;
				world.y = -this.camera.y;
			});
		},
		calculateVolume(point: Point): number {
			const maxDistance = SIZE / 2;
			const distance = pointDistance(camera, point);
			return 1 - mathMin(1, mathMax(0, distance / maxDistance));
		}
	};

	return component;
}
