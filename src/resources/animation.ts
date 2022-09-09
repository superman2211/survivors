import { createCube, CUBE_POINTS } from "../webgl/cube";
import { ELEMENT_SIZE, transformGeometry, writeGeometry } from "../webgl/geometry";
import { composeM4, createM4, createV3, identityM4, lookAt, multiplyM4, normalizeV3, scalingM4, subtractV3, transformM4, translationM4, xRotationM4, yRotationM4, zRotationM4 } from "../webgl/m4";
import { createSphere } from "../webgl/sphere";
import { Resources } from "./ids";
import { resources } from "./resources-loader";

export const ANIMATION_POINTS = 20;

const enum PointType {
	fl0 = 0,
	fl1 = 1,
	fl2 = 2,
	fl3 = 3,

	fr0 = 4,
	fr1 = 5,
	fr2 = 6,
	fr3 = 7,

	hl0 = 8,
	hl1 = 9,
	hl2 = 10,
	hl3 = 11,

	hr0 = 12,
	hr1 = 13,
	hr2 = 14,
	hr3 = 15,

	h0 = 16,
	h1 = 17,
	h2 = 18,
	h3 = 19,
}

export function readAnimation(buffer: ArrayBuffer): Float32Array[] {
	const limitView = new Float32Array(buffer, 0, 6);
	const pointsView = new Uint8Array(buffer, 6 * 4);
	const animation: Float32Array[] = [];

	const [minX, minY, minZ, maxX, maxY, maxZ] = limitView;

	let frame = new Float32Array(ANIMATION_POINTS * 3);

	let p = 0;
	let f = 0;

	const scaleX = (maxX - minX) / 0xff;
	const scaleY = (maxY - minY) / 0xff;
	const scaleZ = (maxZ - minZ) / 0xff;

	while (p < pointsView.length) {
		frame[f++] = minX + pointsView[p++] * scaleX;
		frame[f++] = minY + pointsView[p++] * scaleY;
		frame[f++] = minZ + pointsView[p++] * scaleZ;
		if (f === frame.length) {
			f = 0;
			animation.push(frame);
			frame = new Float32Array(ANIMATION_POINTS * 3);
		}
	}
	return animation;
}

const matrix = createM4();

function connectPoints(point0: Float32Array, point1: Float32Array, width: number, lengthAppedix: number, stream: number[], p: number): number {
	const vector = createV3();
	subtractV3(point0, point1, vector);

	const length = Math.hypot(...vector) + lengthAppedix;

	const geometry = createSphere(1, 5);

	lookAt(point0, point1, point0, matrix);

	matrix[12] = (point0[0] + point1[0]) / 2;
	matrix[13] = (point0[1] + point1[1]) / 2;
	matrix[14] = (point0[2] + point1[2]) / 2;

	const temp = createM4();
	scalingM4(width, width, length / 2, temp);
	multiplyM4(matrix, temp, matrix);

	p = transformGeometry(geometry, matrix, stream, p);
	return p;
}

function getPoint(points: Float32Array, index: number): Float32Array {
	return points.slice(index * 3, (index + 1) * 3);
}

function getCenter(points: Float32Array, index0: number, index1: number, value: number): Float32Array {
	const point0 = getPoint(points, index0);
	const point1 = getPoint(points, index1);
	const result = createV3();
	result[0] = point0[0] + (point1[0] - point0[0]) * value;
	result[1] = point0[1] + (point1[1] - point0[1]) * value;
	result[2] = point0[2] + (point1[2] - point0[2]) * value;
	return result;
}

export function createFrame(points: Float32Array): Float32Array {
	const data: number[] = [];
	let p = 0;
	let i = 0;

	// const global = createM4();
	// transformM4(global, 0, 0, 0, Math.PI);

	// while (i < points.length) {
	// 	const x = points[i++];
	// 	const y = points[i++];
	// 	const z = points[i++];
	// 	const cube = createSphere(0.01);
	// 	// const cube = createCube(0.02, 0.02, 0.02);
	// 	transformM4(matrix, x, y, z);
	// 	p = transformGeometry(cube, matrix],
	// }

	const widthHand = 0.07;
	const widthFoot = 0.1;

	const basicConnections = [
		[PointType.fl0, PointType.fl1, widthFoot],
		[PointType.fl1, PointType.fl2, widthFoot],
		[PointType.fl2, PointType.fl3, 0.07, 0.2],

		[PointType.fr0, PointType.fr1, widthFoot],
		[PointType.fr1, PointType.fr2, widthFoot],
		[PointType.fr2, PointType.fr3, 0.07, 0.2],

		[PointType.hl1, PointType.hl0, widthHand],
		[PointType.hl1, PointType.hl2, widthHand],
		[PointType.hl2, PointType.hl3, widthHand],

		[PointType.hr0, PointType.hr1, widthHand],
		[PointType.hr1, PointType.hr2, widthHand],
		[PointType.hr2, PointType.hr3, widthHand],

		[PointType.hr0, PointType.hl0],
		[PointType.fl0, PointType.fr0, 0.16, 0.18],
		[PointType.hl0, PointType.fl0],
		[PointType.hr0, PointType.fr0],

		[PointType.h0, PointType.h1, 0.08],
		[PointType.h1, PointType.h2],
		[PointType.h2, PointType.h3, 0.15, 0.15],
	];

	for (const connection of basicConnections) {
		const [type0, type1, width = 0.1, lengthAppedix = 0.1] = connection;
		p = connectPoints(getPoint(points, type0), getPoint(points, type1), width, lengthAppedix, data, p);
	}

	const interpolationConnections = [
		[
			PointType.hl0, PointType.fl0, 0.2,
			PointType.hr0, PointType.fr0, 0.2,
			0.2, 0.2,
		],
		[
			PointType.hl0, PointType.fl0, 0.5,
			PointType.hr0, PointType.fr0, 0.5,
			0.15, 0.2,
		],
		[
			PointType.hl0, PointType.fl0, 0.7,
			PointType.hr0, PointType.fr0, 0.7,
			0.15, 0.2,
		]
	]

	for (const connection of interpolationConnections) {
		const [p0, p1, value0, p2, p3, value1, width, length] = connection;
		p = connectPoints(
			getCenter(points, p0, p1, value0),
			getCenter(points, p2, p3, value1),
			width, length,
			data, p
		);
	}

	p = connectPoints(
		getCenter(points, PointType.hl0, PointType.fl0, 0.5),
		getCenter(points, PointType.hr0, PointType.fr0, 0.5),
		0.15, 0.2,
		data, p
	);

	p = connectPoints(
		getCenter(points, PointType.hl0, PointType.fl0, 0.7),
		getCenter(points, PointType.hr0, PointType.fr0, 0.7),
		0.15, 0.2,
		data, p
	);

	return new Float32Array(data);
}

const animations: { [key: number]: Float32Array[] } = [];

function interpolate(animation: Float32Array[]): Float32Array[] {
	const result: Float32Array[] = [];
	for (let i = 0; i < animation.length; i++) {
		const frame0 = animation[i];
		const frame1 = animation[(i + 1) % animation.length];
		const frame2 = frame0.slice();
		let j = 0;
		while (j < frame2.length) {
			frame2[j] = frame0[j] + (frame1[j] - frame0[j]) / 2;
			j++;
		}
		result.push(frame0, frame2);
	}
	return result;
}

export function getAnimation(type: Resources): Float32Array[] {
	if (!animations[type]) {
		const animation = [];
		let animationData = readAnimation(resources[type]);
		animationData = interpolate(animationData);
		animationData = interpolate(animationData);
		animationData = interpolate(animationData);
		for (const points of animationData) {
			const frame = createFrame(points);
			const global = createM4();
			transformM4(
				global,
				0, 0, 0,
				Math.PI / 2, 0, Math.PI / 2,
				2, 2, 2
			);
			const data = new Float32Array(frame.length);
			transformGeometry(frame, global, data, 0);
			animation.push(data);
		}
		animations[type] = animation;
	}
	return animations[type];
}