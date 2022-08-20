import { Point } from '../geom/point';
import { Component } from '../graphics/component';

import { max, min, sqrt } from '../utils/math';
import { ground } from './ground';
import { playerController } from './player';
import { unit } from './unit';

const SIZE = 2500;

export interface Game extends Component {
	camera: Point;
	size: number;
	shakingTime: number;
	calculateVolume(point: Point): number;
	updateCamera(time: number): void;
}

export function game(): Game {
	const camera = Point.create();

	const player = unit(30, 0xff009999, 0, 0, 200);

	const units: Component = {
		children: [
			player,
			unit(30, 0xff990000, 100, 100, 100),
			unit(30, 0xff990000, -100, 100, 100),
			unit(30, 0xff990000, 100, 300, 100),
			unit(30, 0xff990000, 200, -100, 100),
		]
	}

	const world: Component = {
		children: [ground(), units],
	}

	playerController(player, world);

	const component: Game = {
		camera,
		shakingTime: 0,
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
			const distance = sqrt(Point.distanceSquared(camera, point));
			return 1 - min(1, max(0, distance / maxDistance));
		}
	};

	return component;
}
