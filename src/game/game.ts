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

	const enemyCount = 30;
	const enemyDistance = 600;

	for (let i = 0; i < enemyCount; i++) {
		const enemy = createEnemy(world);
		randomPosition(enemy, world.units, -enemyDistance, enemyDistance);
		world.addUnit(enemy);
	}

	const boxSizeX = 700;
	const boxSizeY = 500;
	const boxSizeZ = 300;
	const boxBorder = 700;
	const boxRotation = 0;
	const boxGeometry = createCube(boxSizeX, boxSizeY, boxSizeZ);

	const texture: Command[] = [
		{ type: CommandType.FILL, color: 0xff964b00 },
		{ type: CommandType.SIZE, width: 512, height: 512 }, 
		{ type: CommandType.FILL, color: 0xff999999 }, 
		{ type: CommandType.RECTANGLE, x: 20, y: 20, width: 50, height: 50 }, 
		{ type: CommandType.REPEAT, stepX: 70, stepY: 70, count: 48, cols: 7, }, 
		{ type: CommandType.NOISE, colorOffset: 20 },
	];

	const boxImage = generateImage(texture);

	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			const box: WorldObject = {
				x: -2000 + x * (boxSizeX + boxBorder),
				y: -2000 + y * (boxSizeY + boxBorder),
				z: boxSizeZ,
				rotationZ: boxRotation,
				geometry: boxGeometry,
				image: boxImage,
				body: {
					...createBox(-boxSizeX / 2, -boxSizeY / 2, boxSizeX, boxSizeY, boxRotation),
					static: true,
				},
			}
			world.addObject(box);
		}
	}

	const component: Game = {
		// camera,
		children: [
			world,
		],
		// size: SIZE,
		onUpdate() {
			if (world.getUnitCount(UnitType.ENEMY) < enemyCount) {
				const enemy = createEnemy(world, true);
				randomPosition(enemy, world.units, -enemyDistance, enemyDistance);
				world.addUnit(enemy);
			}
		},
		updateCamera() {
			// this.camera.x = player.x!;
			// this.camera.y = player.y!;
			setCamera(player.x!, player.y!, 1000);
			// this.children?.forEach(child => {
			// 	world.x = -this.camera.x;
			// 	world.y = -this.camera.y;
			// });
		},
		calculateVolume(point: Point): number {
			const maxDistance = SIZE / 2;
			const distance = pointDistance(camera, point);
			return 1 - mathMin(1, mathMax(0, distance / maxDistance));
		}
	};

	return component;
}
