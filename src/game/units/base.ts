import { chance, math2PI, mathCos, mathRandom, mathSin, randomFloat } from "../../utils/math";
import { FSMAction } from "../utils/fsm";
import { World } from "../world";
import { createUnit, Unit, UnitSettings } from "./unit";

export const enum BaseState {
	ROTATE = 0,
	WALK = 1,
	DEAD = 3,
}

type RotationData = { time: number, speed: number };
type WalkData = { time: number, speedX: number, speedY: number };

export function createBase(settings: UnitSettings, world: World): Unit {
	const unit = createUnit(settings);

	const { walkSpeed } = settings;

	unit.rotation = math2PI * mathRandom();

	const { fsm } = unit;
	const { actions, transitions } = fsm;

	actions.set(BaseState.ROTATE, {
		update(time: number) {
			unit.rotation += this.data!.speed * time;
			this.data!.time -= time;
		},
		start() {
			this.data = {
				speed: chance() ? -1 : 1,
				time: randomFloat(0.5, 2)
			};
		},
	} as FSMAction<RotationData>);

	actions.set(BaseState.WALK, {
		update(time: number) {
			unit.x += this.data!.speedX * time;
			unit.y += this.data!.speedY * time;
			this.data!.time -= time;
		},
		start() {
			this.data = {
				speedX: mathCos(unit.rotation) * walkSpeed,
				speedY: mathSin(unit.rotation) * walkSpeed,
				time: randomFloat(1, 3),
			}
		}
	} as FSMAction<WalkData>);

	actions.set(BaseState.DEAD, {
		update(time) {
			unit.alpha! -= time;
			if (unit.alpha! < 0) {
				world.removeUnit(unit);
			}
		},
		start() {
			unit.alpha = 0.9;
			unit.body.enabled = false;
		}
	});

	transitions.push({
		from: [BaseState.WALK],
		to: BaseState.ROTATE,
		condition() {
			if (unit.x < -500) {
				unit.x += 5;
				return true;
			}

			if (unit.x > 500) {
				unit.x -= 5;
				return true;
			}

			if (unit.y < -500) {
				unit.y += 5;
				return true;
			}

			if (unit.y > 500) {
				unit.y -= 5;
				return true;
			}

			return (fsm.getAction().data as WalkData).time < 0;
		}
	});

	transitions.push({
		from: [BaseState.ROTATE],
		to: BaseState.WALK,
		condition() {
			return (fsm.getAction().data as RotationData).time < 0;
		}
	});

	transitions.push({
		from: [],
		to: BaseState.DEAD,
		condition() {
			return unit.health <= 0;
		}
	});

	fsm.setState(BaseState.ROTATE);

	return unit;
}