import { chance, math2PI, mathCos, mathRandom, mathSin, randomFloat } from "../../utils/math";
import { FSMAction } from "../utils/fsm";
import { World } from "../world";
import { UnitState } from "./states";
import { createUnit, Unit, UnitSettings } from "./unit";

type RotationData = { time: number, speed: number };
type WalkData = { time: number, speedX: number, speedY: number };

export function createBase(settings: UnitSettings, world: World): Unit {
	const unit = createUnit(settings);

	const { walkSpeed } = settings;

	unit.rotationZ = math2PI * mathRandom();

	const { fsm } = unit;
	const { actions, transitions } = fsm;

	actions[UnitState.ROTATE] = {
		update(time: number) {
			unit.rotationZ += this.data!.speed * time;
			this.data!.time -= time;
		},
		start() {
			this.data = {
				speed: chance() ? -1 : 1,
				time: randomFloat(0.5, 2)
			};
		},
	} as FSMAction<RotationData>;

	actions[UnitState.WALK] = {
		update(time: number) {
			unit.x += this.data!.speedX * time;
			unit.y += this.data!.speedY * time;
			this.data!.time -= time;
		},
		start() {
			this.data = {
				speedX: mathCos(unit.rotationZ) * walkSpeed,
				speedY: mathSin(unit.rotationZ) * walkSpeed,
				time: randomFloat(1, 3),
			}
		}
	} as FSMAction<WalkData>;

	actions[UnitState.DEAD] = {
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
	};

	transitions.push(
		{
			from: [UnitState.WALK],
			to: UnitState.ROTATE,
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
		},
		{
			from: [UnitState.ROTATE],
			to: UnitState.WALK,
			condition() {
				return (fsm.getAction().data as RotationData).time < 0;
			}
		},
		{
			from: [],
			to: UnitState.DEAD,
			condition() {
				return unit.health <= 0;
			}
		}
	);

	fsm.setState(UnitState.ROTATE);

	return unit;
}