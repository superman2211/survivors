import { Application, application } from './game/application';
import { Point } from './geom/point';
import { Component } from './graphics/component';
import { KeyboardEventType, TouchEventType } from './graphics/events';
import { Graphics, dpr, globalMatrix } from './graphics/graphics';
import { hasTouch } from './utils/browser';

const canvas: HTMLCanvasElement = document.getElementById('c') as HTMLCanvasElement;
Graphics.init(canvas);

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
	Component.update(app, time);
	app.updateView(time);
	Graphics.render(app);
}

function start() {
	app = application({ getWidth: () => innerWidth, getHeight: () => innerHeight });

	oldTime = performance.now();
	update();

	// keyboard

	document.addEventListener('keydown', (e) => {
		Component.keyProcess(app, e, KeyboardEventType.DOWN);
		e.preventDefault();
	});

	document.addEventListener('keyup', (e) => {
		Component.keyProcess(app, e, KeyboardEventType.UP);
		e.preventDefault();
	});

	if (hasTouch) {
		const typeMap = new Map<string, TouchEventType>([
			['touchstart', TouchEventType.DOWN],
			['touchend', TouchEventType.UP],
			['touchcancel', TouchEventType.UP],
			['touchmove', TouchEventType.MOVE],
		]);

		function touchHandler(e: TouchEvent) {
			const type = typeMap.get(e.type)!;
			for (let i = 0; i < e.changedTouches.length; i++) {
				const touch = e.changedTouches[i];
				const global: Point = { x: touch.clientX * dpr, y: touch.clientY * dpr };
				Component.touchProcess(app, global, globalMatrix, type, touch.identifier);
			}
			e.preventDefault();
		}

		canvas.addEventListener('touchstart', touchHandler, false);
		canvas.addEventListener('touchend', touchHandler, false);
		canvas.addEventListener('touchcancel', touchHandler, false);
		canvas.addEventListener('touchmove', touchHandler, false);
	} else {
		const typeMap = new Map<string, TouchEventType>([
			['mousedown', TouchEventType.DOWN],
			['mouseup', TouchEventType.UP],
			['mouseleave', TouchEventType.UP],
			['mousemove', TouchEventType.MOVE],
		]);

		function mouseHandler(e: MouseEvent) {
			const type = typeMap.get(e.type)!;
			const global: Point = { x: e.clientX * dpr, y: e.clientY * dpr };
			Component.touchProcess(app, global, globalMatrix, type, 0);
			e.preventDefault();
		};

		canvas.addEventListener('mousedown', mouseHandler);
		canvas.addEventListener('mousemove', mouseHandler);
		canvas.addEventListener('mouseup', mouseHandler);
		canvas.addEventListener('mouseleave', mouseHandler);
	}
}

async function main() {
	start();
}

main();
