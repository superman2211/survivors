import { Component } from '../graphics/component';
import { game as createGame } from './game';
import { min } from '../utils/math';

const SIZE: number = 1024;

export interface Application extends Component {
	updateView(time: number): void;
}

export interface ApplicationOptions {
	getWidth(): number,
	getHeight(): number,
}

export function application(options: ApplicationOptions): Application {
	const game = createGame();
	return {
		children: [game],
		updateView(time: number) {
			const w = options.getWidth();
			const h = options.getHeight();

			const scale = min(w / SIZE, h / SIZE);

			game.scale = scale;
			game.x = w / 2;
			game.y = h / 2;

			game.updateCamera(time);
		},
	};
}
