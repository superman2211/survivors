import { Point, pointCreate, pointDistance, pointDistanceSquared } from '../geom/point';
import { Component } from '../graphics/component';
import { mathMax, mathMin, randomFloat } from '../utils/math';
import { createEnemy } from './units/enemy';
import { createAlly } from './units/ally';
import { createPlayer } from './units/player';
import { createWorld, WorldObject } from './world';
import { Unit } from './units/unit';
import { createBox } from '../physics/body';
import { generateShape } from '../utils/generate-shape';
import { UI } from './ui';
import { getPlayerControl } from './utils/player-control';
import { UnitType, isFriend } from './units/types';
import { ShapeCommand } from '../graphics/shape';

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

	const allyDistance = 300;
	for (let i = 0; i < 10; i++) {
		const ally = createAlly(world);
		ally.x = randomFloat(-allyDistance, allyDistance);
		ally.y = randomFloat(-allyDistance, allyDistance);
		world.addUnit(ally);
	}

	const enemyCount = 50;
	const enemyDistance = 600;

	for (let i = 0; i < enemyCount; i++) {
		const enemy = createEnemy(world);
		randomPosition(enemy, world.units, -enemyDistance, enemyDistance);
		world.addUnit(enemy);
	}

	const shape: number[] = [];
	generateShape(shape, 0, 0, 0, 10, 10, 100, 100);
	const colon: WorldObject = {
		x: 512, y: 0,
		rotation: 0,
		pallete: [0xff660066],
		shape,
		body: { weight: 0, static: true, radius: 100, },
	}
	world.addObject(colon);

	const boxSizeX = 700;
	const boxSizeY = 500;
	const boxBorder = 300;
	const boxRotation = 0.1;
	for(let x = 0; x < 5; x++) {
		for (let y = 0; y < 5; y++) {
			const box: WorldObject = {
				x: -2500 + x * (boxSizeX + boxBorder), y: -2500 + y * (boxSizeY + boxBorder),
				rotation: boxRotation,
				pallete: [0xff660066],
				shape: [
					ShapeCommand.PATH, 4,
					0, 0,
					0, boxSizeY,
					boxSizeX, boxSizeY,
					boxSizeX, 0,
					ShapeCommand.FILL, 0,
				],
				body: {
					...createBox(0, 0, boxSizeX, boxSizeY, boxRotation),
					static: true,
				},
			}
			world.addObject(box);
		}
	}
	
	const component: Game = {
		camera,
		children: [
			world,
		],
		size: SIZE,
		onUpdate() {
			if (world.getUnitCount(UnitType.ENEMY) < enemyCount) {
				const enemy = createEnemy(world, true);
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
