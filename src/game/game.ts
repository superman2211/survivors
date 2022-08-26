import { Point } from '../geom/point';
import { Component } from '../graphics/component';

import { mathMax, mathMin, mathRandom, mathSqrt, randomFloat } from '../utils/math';
import { createEnemy } from './units/enemy';
import { createAlly } from './units/ally';
import { createPlayer } from './units/player';
import { createWorld } from './world';
import { isFriend, Unit, UnitType } from './units/unit';

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
			if (!isFriend(u.type, unit.type)) {
				if (Point.distanceSquared(unit, u) < safeDistanceSquared) {
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

export function game(): Game {
	const camera = Point.create();

	const world = createWorld();

	const player = createPlayer(world);
	world.addUnit(player);

	const enemyCount = 50;

	for (let i = 0; i < enemyCount; i++) {
		const enemy = createEnemy(world);
		randomPosition(enemy, world.units, -500, 1000);
		world.addUnit(enemy);
	}

	for (let i = 0; i < 10; i++) {
		const ally = createAlly(world);
		ally.x = -500 + mathRandom() * 1000;
		ally.y = -500 + mathRandom() * 1000;
		world.addUnit(ally);
	}

	const component: Game = {
		camera,
		children: [
			world,
		],
		size: SIZE,
		onUpdate() {
			if (world.getUnitCount(UnitType.ENEMY) < enemyCount) {
				const enemy = createEnemy(world);
				randomPosition(enemy, world.units, -500, 1000);
				world.addUnit(enemy);
			}
		},
		updateCamera() {
			this.camera.x = player.x!;
			this.camera.y = player.y!;

			this.children?.forEach(child => {
				child.x = -this.camera.x;
				child.y = -this.camera.y;
			});
		},
		calculateVolume(point: Point): number {
			const maxDistance = SIZE / 2;
			const distance = Point.distance(camera, point);
			return 1 - mathMin(1, mathMax(0, distance / maxDistance));
		}
	};

	return component;
}
