import { Point } from "../geom/point";
import { Component } from "../graphics/component";
import { generateShape } from "../utils/generate-shape";

export interface Unit extends Component {
	direction: Direction;
	speed: Point;
	targetSpeed: Point;
	walkSpeed: number;
}

export interface Direction {
	up: boolean;
	down: boolean;
	left: boolean;
	right: boolean;
}

export function unit(radius: number, color: number, x: number, y: number, walkSpeed: number): Unit {
	const shape: number[] = [];
	const pallete = [color, 0xff000000];
	const speed = Point.create();
	const targetSpeed = Point.create();
	const direction: Direction = { up: false, down: false, left: false, right: false }
	generateShape(shape, 0, 0, 0, 5, 5, radius, radius, Math.PI / 10);
	generateShape(shape, 1, radius / 2, 0, 3, 3, radius / 3, radius / 3, Math.PI / 2);
	return {
		shape,
		pallete,
		x, y,
		speed,
		targetSpeed,
		direction,
		walkSpeed,

		onUpdate(time) {
			this.targetSpeed.x = 0;
			this.targetSpeed.y = 0;
			
			if (this.direction.up) {
				this.targetSpeed.y -= 1;
			}
			if (this.direction.down) {
				this.targetSpeed.y += 1;
			}
			if (this.direction.left) {
				this.targetSpeed.x -= 1;
			}
			if (this.direction.right) {
				this.targetSpeed.x += 1;
			}

			Point.normalize(this.targetSpeed, this.walkSpeed);

			this.speed.x += (this.targetSpeed.x - this.speed.x) / 3;
			this.speed.y += (this.targetSpeed.y - this.speed.y) / 3;

			this.x! += this.speed.x * time;
			this.y! += this.speed.y * time;
		}
	}
}