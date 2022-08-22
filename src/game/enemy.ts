import { Point } from "../geom/point";
import { mathAtan2, chance, mathCos, math2PI, mathRandom, randomFloat, mathSin, mathSqrt } from "../utils/math";
import { createUnit, isFriend, Unit, UnitType } from "./unit";

const enum EnemyState {
	ROTATE = 0,
	WALK = 1,
	GOTO_TARGET = 2,
	ATTACK = 3
}

export function createEnemy(units: Unit[]) {
	const enemy = createUnit(UnitType.ENEMY, 30, 60, 100, 0xff990000, 100);

	// enemy.onCollision = (o, p) => {
	// 	if ('type' in o) {
	// 		const unit: Unit = o as Unit;
	// 		if (!isFriend(unit, enemy)) {
	// 			fsm.setState(EnemyState.ATTACK, unit);
	// 		}
	// 	}
	// };

	enemy.rotation = math2PI * mathRandom();

	const { fsm } = enemy;

	fsm.setUpdateTime(0.5);

	fsm.actions.set(EnemyState.ROTATE, {
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

	fsm.actions.set(EnemyState.WALK, {
		data: {},
		time: 0,
		update(time: number) {
			enemy.x += this.data.speedX * time;
			enemy.y += this.data.speedY * time;
			this.time -= time;
		},
		start() {
			const speed = randomFloat(50, 100);
			this.data.speedX = mathCos(enemy.rotation) * speed;
			this.data.speedY = mathSin(enemy.rotation) * speed;
			this.time = randomFloat(1, 3);
		}
	});

	fsm.actions.set(EnemyState.GOTO_TARGET, {
		data: {},
		time: 0,
		update(time: number) {
			enemy.rotation = mathAtan2(this.data.target.y - enemy.y, this.data.target.x - enemy.x);
			const speedX = mathCos(enemy.rotation) * this.data.speed;
			const speedY = mathSin(enemy.rotation) * this.data.speed;
			enemy.x += speedX * time;
			enemy.y += speedY * time;
		},
		start(target: Unit) {
			this.data.speed = randomFloat(50, 100);
			this.data.target = target;
		}
	});

	fsm.actions.set(EnemyState.ATTACK, {
		data: {},
		time: 0,
		update(time: number) {
			this.time -= time;
		},
		start(target: Unit) {
			this.time = 1;
			this.data.target = target;
			target.health -= 10;
			console.log(target.health);
		}
	});

	fsm.transitions.push({
		from: [EnemyState.WALK],
		to: EnemyState.ROTATE,
		condition() {
			return fsm.getAction().time < 0;
		}
	});

	fsm.transitions.push({
		from: [EnemyState.ROTATE],
		to: EnemyState.WALK,
		condition() {
			return fsm.getAction().time < 0;
		}
	});

	const enemyDistance = 300;
	const enemyDistanceSquared = enemyDistance * enemyDistance;

	fsm.transitions.push({
		from: [EnemyState.ROTATE, EnemyState.WALK],
		to: EnemyState.GOTO_TARGET,
		condition() {
			for (const unit of units) {
				if (!isFriend(unit, enemy) && unit.health > 0) {
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

	fsm.transitions.push({
		from: [EnemyState.GOTO_TARGET],
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

	fsm.transitions.push({
		from: [EnemyState.GOTO_TARGET],
		to: EnemyState.ATTACK,
		condition() {
			const target: Unit = fsm.getAction().data.target;
			const distanceSquared = Point.distanceSquared(target, enemy);
			const radiuses = enemy.body.radius + target.body.radius;
			const radiusesSquared = radiuses * radiuses;
			if (distanceSquared < radiusesSquared * 1.1) {
				this.data = target;
				return true;
			}
			return false;
		}
	});

	fsm.transitions.push({
		from: [EnemyState.ATTACK],
		to: EnemyState.GOTO_TARGET,
		condition() {
			if(fsm.getAction().time < 0) {
				this.data = fsm.getAction().data.target;
				return true;
			}
			return false;
		}
	});

	fsm.setState(0);

	return enemy;
}