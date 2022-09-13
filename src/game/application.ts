import { Component, componentTouchProcess, componentUpdate } from '../graphics/component';
import { game as createGame } from './game';
import { mathMin } from '../utils/math';
import { clearUI, createUI, renderUI, UI } from './ui';
import { getPlayerControl } from './utils/player-control';
import { createM4, identityM4 } from '../geom/matrix';
import { dpr } from '../utils/browser';
import { Point } from '../geom/point';
import { TOUCH_DOWN, TOUCH_MOVE, TOUCH_UP } from '../graphics/events';

const SIZE: number = 1024;

export interface Application extends Component {
	updateView(time: number): void;
}

export interface ApplicationOptions {
	getWidth(): number,
	getHeight(): number,
}

const globalMatrix = createM4();
identityM4(globalMatrix);

export function application(options: ApplicationOptions): Application {
	const ui = createUI(options);
	const game = createGame(ui); 
	return {
		children: [game],
		updateView(time: number) {
			const w = options.getWidth();
			const h = options.getHeight();

			const scale = mathMin(w / SIZE, h / SIZE);

			globalMatrix[0] = globalMatrix[5] = dpr;
			ui.scaleX = ui.scaleY = scale;

			game.updateCamera(time);
		},

		onUpdate(time) {
			componentUpdate(ui, time);
			clearUI();
			renderUI(ui, globalMatrix);
		},

		onTouchDown(p:Point, id: number) {
			componentTouchProcess(ui, p, TOUCH_DOWN, id);
		},

		onTouchUp(p: Point, id: number) {
			componentTouchProcess(ui, p, TOUCH_UP, id);
		},

		onTouchMove(p: Point, id: number) {
			componentTouchProcess(ui, p, TOUCH_MOVE, id);
		}
	};
}
