import { Point } from '../geom/point';
import { Component } from '../graphics/component';

import {
	mathAtan2,
	mathMax, mathMin, mathSqrt, randomFloat,
} from '../utils/math';
import { ground } from './ground';
import { Unit, unit } from './unit';

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

	const component: Game = {
		camera,
		shakingTime: 0,
		children: [
			ground(),
			{
				children: [
					unit(30, 0xff009999, 0, 0, 200),
					unit(30, 0xff990000, 100, 100, 100),
					unit(30, 0xff990000, -100, 100, 100),
					unit(30, 0xff990000, 100, 300, 100),
					unit(30, 0xff990000, 200, -100, 100),
				],

				onTouchMove(p: Point) {
					const player: Unit = this.children![0] as Unit;
					player.rotation = mathAtan2(p.y - player.y!, p.x - player.x!);
				},

				onKeyDown(e: KeyboardEvent) {
					const player: Unit = this.children![0] as Unit;
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
				},

				onKeyUp(e: KeyboardEvent) {
					const player: Unit = this.children![0] as Unit;
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
					}
				}
			}
		],
		size: SIZE,
		updateCamera() {
			const unitsComponent = this.children![1];
			const player = unitsComponent.children![0];

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
