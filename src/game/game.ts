import { Point } from '../geom/point';
import { Component } from '../graphics/component';

import { mathMax, mathMin, mathRandom, mathSqrt } from '../utils/math';
import { createEnemy } from './enemy';
import { createPlayer } from './player';
import { createWorld } from './world';

const SIZE = 2500;

export interface Game extends Component {
	camera: Point;
	size: number;
	calculateVolume(point: Point): number;
	updateCamera(time: number): void;
}

export function game(): Game {
	const camera = Point.create();

	const world = createWorld();

	const player = createPlayer(world);
	world.addUnit(player);

	for (let i = 0; i < 10; i++) {
		const enemy = createEnemy(world);
		enemy.x = -500 + mathRandom() * 1000;
		enemy.y = -500 + mathRandom() * 1000;
		world.addUnit(enemy);
	}

	const component: Game = {
		camera,
		children: [
			world,
		],
		size: SIZE,
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
			const distance = mathSqrt(Point.distanceSquared(camera, point));
			return 1 - mathMin(1, mathMax(0, distance / maxDistance));
		}
	};

	return component;
}
