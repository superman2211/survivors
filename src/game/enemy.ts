import { Point } from "../geom/point";
import { mathAtan2, chance, mathCos, math2PI, mathRandom, randomFloat, mathSin, mathSqrt } from "../utils/math";
import { createUnit, isFriend, Unit, UnitSettings, UnitType } from "./unit";
import { World } from "./world";

const enum EnemyState {
	ROTATE = 0,
	WALK = 1,
	GOTO_TARGET = 2,
	ATTACK = 3,
	DEAD = 4,
}

export function createEnemy(world: World) {
	const settings: UnitSettings = {
		type: UnitType.ENEMY,
		radius: 30,
		weight: 60,
		health: 100,
		color: 0xff990000,
		walkSpeed: 100,
		reaction: 0.5,
		enemyDistance: 300,
		weapons: [
			{
				damage: 3,
				speed: 100,
				points: [Point.create(30, 0)],
				frequency: 1,
				distance: 10,
				color: 0xffff0000,
				length: 10,
				width: 10,
			}
		]
	}

	const { units } = world;

	const enemy = createUnit(settings);

	const { walkSpeed } = settings;

	const enemyDistance = settings.enemyDistance!;
	const enemyDistanceSquared = enemyDistance * enemyDistance;

	enemy.rotation = math2PI * mathRandom();

	const { fsm } = enemy;
	const { actions, transitions } = fsm;

	actions.set(EnemyState.ROTATE, {
		data: {},
		time: 0,
		update(time: number) {
			enemy.rotation += this.data.speed * time;
			this.time -= time;
		},
		start() {
			this.data.speed = chance() ? -1 : 1;
			this.time = randomFloat(0.5, 2);
		},
	});

	actions.set(EnemyState.WALK, {
		data: {},
		time: 0,
		update(time: number) {
			enemy.x += this.data.speedX * time;
			enemy.y += this.data.speedY * time;
			this.time -= time;
		},
		start() {
			this.data.speedX = mathCos(enemy.rotation) * walkSpeed;
			this.data.speedY = mathSin(enemy.rotation) * walkSpeed;
			this.time = randomFloat(1, 3);
		}
	});

	actions.set(EnemyState.GOTO_TARGET, {
		data: {},
		time: 0,
		update(time: number) {
			enemy.rotation = mathAtan2(this.data.target.y - enemy.y, this.data.target.x - enemy.x);
			const speedX = mathCos(enemy.rotation) * walkSpeed;
			const speedY = mathSin(enemy.rotation) * walkSpeed;
			enemy.x += speedX * time;
			enemy.y += speedY * time;
		},
		start(target: Unit) {
			this.data.target = target;
		}
	});

	actions.set(EnemyState.ATTACK, {
		data: {},
		time: 0,
		update(time: number) {
			this.time -= time;
			if (this.time <= 0) {
				this.start(this.data.target);
			}
		},
		start(target: Unit) {
			this.data.target = target;
			const wheapon = settings.weapons![enemy.weapon]!;
			target.health -= wheapon.damage;
			this.time = 1 / wheapon.frequency;
		}
	});

	actions.set(EnemyState.DEAD, {
		data: {},
		time: 0,
		update(time: number) {
		},
		start() {
			enemy.alpha = 0.5;
			enemy.body.enabled = false;
		}
	});

	transitions.push({
		from: [EnemyState.WALK],
		to: EnemyState.ROTATE,
		condition() {
			return fsm.getAction().time < 0;
		}
	});

	transitions.push({
		from: [EnemyState.ROTATE],
		to: EnemyState.WALK,
		condition() {
			return fsm.getAction().time < 0;
		}
	});

	transitions.push({
		from: [EnemyState.ROTATE, EnemyState.WALK],
		to: EnemyState.GOTO_TARGET,
		condition() {
			for (const unit of units) {
				if (!isFriend(unit.type, enemy.type) && unit.health > 0) {
					const distanceSquared = Point.distanceSquared(unit, enemy);
					if (distanceSquared < enemyDistanceSquared) {
						this.data = unit;
						return true;
					}
				}
			}
			return false;
		}
	});

	transitions.push({
		from: [EnemyState.GOTO_TARGET, EnemyState.ATTACK],
		to: EnemyState.ROTATE,
		condition() {
			const target: Unit = fsm.getAction().data.target;
			if (target.health <= 0) {
				return true;
			}
			const distanceSquared = Point.distanceSquared(target, enemy);
			return distanceSquared > enemyDistanceSquared * 1.5;
		}
	});

	function isTargetNearby(target: Unit): boolean {
		const distanceSquared = Point.distanceSquared(target, enemy);
		const radiuses = enemy.body.radius + target.body.radius;
		const radiusesSquared = radiuses * radiuses;
		return distanceSquared < radiusesSquared * 1.1;
	}

	transitions.push({
		from: [EnemyState.GOTO_TARGET],
		to: EnemyState.ATTACK,
		condition() {
			const target: Unit = fsm.getAction().data.target;
			if (isTargetNearby(target)) {
				this.data = target;
				return true;
			}
			return false;
		}
	});

	transitions.push({
		from: [EnemyState.ATTACK],
		to: EnemyState.GOTO_TARGET,
		condition() {
			const target: Unit = fsm.getAction().data.target
			if (!isTargetNearby(target)) {
				this.data = target;
				return true;
			}
			return false;
		}
	});

	transitions.push({
		from: [],
		to: EnemyState.DEAD,
		condition() {
			return enemy.health <= 0;
		}
	});

	fsm.setState(EnemyState.ROTATE);

	return enemy;
}