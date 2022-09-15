import { Application, application } from './game/application';
import { Point } from './geom/point';
import { componentKeyProcess, componentTouchProcess, componentUpdate } from './graphics/component';
import { Events } from './graphics/events';
import { graphicsRender } from './graphics/graphics';
import { domDocument, dpr, hasTouch, info } from './utils/browser';
import { loadResources } from './resources/resources-loader';
import { direction } from './game/units/unit';
import { canvas } from './game/ui';
import { timeout } from './utils/browser';

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

	domDocument.onkeydown = (e) => keyHandler(e, Events.KEY_DOWN);
	domDocument.onkeyup = (e) => keyHandler(e, Events.KEY_UP);

	if (hasTouch) {
		function touchHandler(e: TouchEvent, type: number) {
			const touches = e.changedTouches;
			for (let i = 0; i < touches.length; i++) {
				const { clientX, clientY, identifier } = touches[i];
				const global: Point = { x: clientX * dpr, y: clientY * dpr };
				componentTouchProcess(app, global, type, identifier);
			}
			e.preventDefault();
		}

		canvas.ontouchstart = (e) => touchHandler(e, Events.TOUCH_DOWN);
		canvas.ontouchend = (e) => touchHandler(e, Events.TOUCH_UP);
		canvas.ontouchcancel = (e) => touchHandler(e, Events.TOUCH_UP);
		canvas.ontouchmove = (e) => touchHandler(e, Events.TOUCH_MOVE);
	} else {
		function mouseHandler(e: MouseEvent, type: number) {
			const global: Point = { x: e.clientX * dpr, y: e.clientY * dpr };
			componentTouchProcess(app, global, type, 0);
			direction.x = e.clientX - innerWidth / 2 / dpr;
			direction.y = e.clientY - innerHeight / 2 / dpr;
			e.preventDefault();
		};

		canvas.onmousedown = (e) => mouseHandler(e, Events.TOUCH_DOWN);
		canvas.onmousemove = (e) => mouseHandler(e, Events.TOUCH_MOVE);
		canvas.onmouseup = (e) => mouseHandler(e, Events.TOUCH_UP);
		canvas.onmouseleave = (e) => mouseHandler(e, Events.TOUCH_UP);
	}
}

async function main() {
	info.innerText = 'Loading...';
	await loadResources();
	await timeout(10);
	start();
	info.innerText = '';
}

main();