import { Point } from "../../geom/point";
import { Component } from "../../graphics/component";
import { createCircleImage } from "./utils";

const RADIUS_BACK = 150;
const RADIUS_FRONT = 60;
const IMAGE_BACK = createCircleImage(RADIUS_BACK, '#fff', 5);
const IMAGE_FRONT = createCircleImage(RADIUS_FRONT, '#fff', 5);

export interface Joystick extends Component {
	radius: number;
	value: Point;
	isActive(): boolean;
	updateValue(p: Point): void;
	onChange?: () => void;
}

export function createJoystick(): Joystick {
	const back: Component = {
		image: IMAGE_BACK,
	};

	const front: Component = {
		image: IMAGE_FRONT,
	};

	back.x = -RADIUS_BACK;
	back.y = -RADIUS_BACK;

	let pressedId = -1;

	return {
		children: [back, front],
		radius: RADIUS_BACK,
		value: Point.create(),

		isActive(): boolean {
			return pressedId != -1;
		},

		onUpdate() {
			front.x = -RADIUS_FRONT + this.value.x * RADIUS_BACK;
			front.y = -RADIUS_FRONT + this.value.y * RADIUS_BACK;
		},

		onTouchDown(p, g, id) {
			if (pressedId === -1 && Point.length(p) < RADIUS_BACK) {
				pressedId = id;

				this.updateValue(p);
			}
		},

		onTouchUp(p, g, id) {
			if (pressedId === id) {
				pressedId = -1;

				this.value.x = 0;
				this.value.y = 0;
				
				if (this.onChange) {
					this.onChange();
				}
			}
		},

		onTouchMove(p, g, id) {
			if (pressedId === id) {
				this.updateValue(p);
			}
		},

		updateValue(p: Point) {
			this.value.x = p.x / RADIUS_BACK;
			this.value.y = p.y / RADIUS_BACK;

			if (Point.length(this.value) > 1) {
				Point.normalize(this.value, 1);
			}

			if (this.onChange) {
				this.onChange();
			}
		}
	}
}

