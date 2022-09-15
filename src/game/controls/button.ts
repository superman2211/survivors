import { transformInverse } from "../../geom/point";
import { Component } from "../../graphics/component";
import { createCircleImage } from "./utils";

const BUTTON_RADIUS = 50;
const BUTTON_IMAGE = createCircleImage(BUTTON_RADIUS, '#fff', 5);
const ACTIVE_COLOR = 0xffffffff;
const INACTIVE_COLOR = 0xffbbbbbb;

export interface Button extends Component {
	setActive(value: boolean): void;
	onClick?: () => void;
}

export function createRoundButton(text: string): Button {
	const back: Component = { image: BUTTON_IMAGE };

	const fontSize = 30;

	const label: Component = {
		text: {
			value: text,
			font: 'arial',
			size: fontSize,
			align: 0.5,
			color: INACTIVE_COLOR,
		},
	}

	label.x = BUTTON_RADIUS;
	label.y = BUTTON_RADIUS - fontSize / 2;

	const size = BUTTON_RADIUS * 2;

	return {
		children: [back, label],

		onTouchDown(g) {
			if (this.transformedMatrix) {
				const p = transformInverse(this.transformedMatrix, g);
				if (0 < p.x && p.x < size && 0 < p.y && p.y < size) {
					if (this.onClick) {
						this.onClick();
					}
				}
			}
		},

		setActive(value: boolean) {
			label.text!.color = value ? ACTIVE_COLOR : INACTIVE_COLOR
		}
	}
}