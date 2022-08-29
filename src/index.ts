import { Application, application } from './game/application';
import { Point } from './geom/point';
import { componentKeyProcess, componentTouchProcess, componentUpdate } from './graphics/component';
import { KEY_DOWN, KEY_UP, TOUCH_DOWN, TOUCH_MOVE, TOUCH_UP } from './graphics/events';
import { canvas, globalMatrix, graphicsRender } from './graphics/graphics';
import { playAudio } from './media/sfx';
import { domDocument, dpr, hasTouch } from './utils/browser';
import { loadResources } from './resources/resources-loader';

let app: Application;

let oldTime = performance.now();

function calculateTime(): number {
	const currentTime = performance.now();
	const time = currentTime - oldTime;
	oldTime = currentTime;
	return time / 1000;
}

function update() {
	requestAnimationFrame(update);
	const time = calculateTime();
	componentUpdate(app, time);
	app.updateView(time);
	graphicsRender(app);
}

function start() {
	app = application({ getWidth: () => innerWidth, getHeight: () => innerHeight });

	oldTime = performance.now();
	update();

	function keyHandler(e: KeyboardEvent, type: number) {
		componentKeyProcess(app, e, type);
		e.preventDefault();
	}

	domDocument.onkeydown = (e) => keyHandler(e, KEY_DOWN);
	domDocument.onkeyup = (e) => keyHandler(e, KEY_UP);

	if (hasTouch) {
		function touchHandler(e: TouchEvent, type: number) {
			const touches = e.changedTouches;
			for (let i = 0; i < touches.length; i++) {
				const { clientX, clientY, identifier } = touches[i];
				const global: Point = { x: clientX * dpr, y: clientY * dpr };
				componentTouchProcess(app, global, globalMatrix, type, identifier);
			}
			e.preventDefault();
		}

		canvas.ontouchstart = (e) => touchHandler(e, TOUCH_DOWN);
		canvas.ontouchend = (e) => touchHandler(e, TOUCH_UP);
		canvas.ontouchcancel = (e) => touchHandler(e, TOUCH_UP);
		canvas.ontouchmove = (e) => touchHandler(e, TOUCH_MOVE);
	} else {
		function mouseHandler(e: MouseEvent, type: number) {
			const global: Point = { x: e.clientX * dpr, y: e.clientY * dpr };
			componentTouchProcess(app, global, globalMatrix, type, 0);
			e.preventDefault();
		};

		canvas.onmousedown = (e) => mouseHandler(e, TOUCH_DOWN);
		canvas.onmousemove = (e) => mouseHandler(e, TOUCH_MOVE);
		canvas.onmouseup = (e) => mouseHandler(e, TOUCH_UP);
		canvas.onmouseleave = (e) => mouseHandler(e, TOUCH_UP);
	}
}

async function main() {
	await loadResources();
	start();
}

main();
