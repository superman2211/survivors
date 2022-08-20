import { Application, application } from './game/application';
import { Point } from './geom/point';
import { Component } from './graphics/component';
import { KeyboardEventType, TouchEventType } from './graphics/events';
import { Graphics, dpr, globalMatrix } from './graphics/graphics';

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

	document.addEventListener('keydown', (e) => {
		Component.keyProcess(app, e, KeyboardEventType.DOWN);
		e.preventDefault();
	});
	document.addEventListener('keyup', (e) => {
		Component.keyProcess(app, e, KeyboardEventType.UP);
		e.preventDefault();
	});

	canvas.addEventListener('mousedown', (e) => {
		const global: Point = { x: e.clientX * dpr, y: e.clientY * dpr };
		Component.touchProcess(app, global, globalMatrix, TouchEventType.DOWN);
	});

	canvas.addEventListener('mouseup', (e) => {
		const global: Point = { x: e.clientX * dpr, y: e.clientY * dpr };
		Component.touchProcess(app, global, globalMatrix, TouchEventType.UP);
	});

	canvas.addEventListener('mousemove', (e) => {
		const global: Point = { x: e.clientX * dpr, y: e.clientY * dpr };
		Component.touchProcess(app, global, globalMatrix, TouchEventType.MOVE);
	});
}

async function main() {
	start();
}

main();
