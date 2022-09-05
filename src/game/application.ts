import { Component } from '../graphics/component';
import { game as createGame } from './game';
import { mathMin } from '../utils/math';
import { createUI } from './ui';
import { getPlayerControl } from './utils/player-control';

const SIZE: number = 1024;

export interface Application extends Component {
	updateView(time: number): void;
}

export interface ApplicationOptions {
	getWidth(): number,
	getHeight(): number,
}

export function application(options: ApplicationOptions): Application {
	const ui = createUI(options);
	const game = createGame(ui); 
	return {
		children: [game, ui],
		updateView(time: number) {
			// const w = options.getWidth();
			// const h = options.getHeight();

			// const scale = mathMin(w / SIZE, h / SIZE);

			// game.scale = scale;
			// game.x = w / 2;
			// game.y = h / 2;

			// ui.scale = scale;

			game.updateCamera(time);
		},
	};
}
