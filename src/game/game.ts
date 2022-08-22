import { Point } from '../geom/point';
import { Component } from '../graphics/component';

import { max, min, random, sqrt } from '../utils/math';
import { createEnemy } from './enemy';
import { createGround } from './ground';
import { IBody, updatePhysics } from './physics';
import { createPlayer } from './player';
import { Unit } from './unit';

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

	const bodies: IBody[] = [];
	const units: Unit[] = [];

	function addUnit(unit:Unit) {
		units.push(unit);
		bodies.push(unit);
	}

	const world: Component = {
		children: [createGround(), { children: units }],
	}

	const player = createPlayer(world, units);
	addUnit(player);

	for(let i = 0; i < 10; i++) {
		const enemy = createEnemy(units);
		enemy.x = -500 + random() * 1000;
		enemy.y = -500 + random() * 1000;
		addUnit(enemy);
	}

	const component: Game = {
		camera,
		shakingTime: 0,
		children: [
			world,
		],
		size: SIZE,
		onUpdate(time) {
			updatePhysics(bodies, time);
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
			const distance = sqrt(Point.distanceSquared(camera, point));
			return 1 - min(1, max(0, distance / maxDistance));
		}
	};

	return component;
}
