const fs = require('fs');
const path = require('path');

const FRAMES_STEP = 10;

const POINTS = [
	'fl0',
	'fl1',
	'fl2',
	'fl3',

	'fr0',
	'fr1',
	'fr2',
	'fr3',

	'hl0',
	'hl1',
	'hl2',
	'hl3',

	'hr0',
	'hr1',
	'hr2',
	'hr3',

	'h0',
	'h1',
	'h2',
	'h3',
]

// console.log('POINTS.length', POINTS.length); // 20
function readFrame(file) {
	// console.log(file);
	const points = {};

	const text = fs.readFileSync(file).toString();
	const textLines = text.split('\n');

	let name;
	let x = 0;
	let y = 0;
	let z = 0;
	let count = 0;

	for (const textLine of textLines) {
		const textParts = textLine.split(' ');
		switch (textParts[0]) {
			case 'o':
				name = textParts[1].split('_')[0];
				// console.log(name);
				x = 0;
				y = 0;
				z = 0;
				count = 0;

				break;

			case 'v':
				x += parseFloat(textParts[1]);
				y += parseFloat(textParts[2]);
				z += parseFloat(textParts[3]);
				count++;
				if (count == 8) {
					x /= count;
					y /= count;
					z /= count;
					points[name] = { x, y, z };
				}
				break;
		}
	}

	return points;
}

function readAnimation(folder) {
	const files = fs.readdirSync(folder);
	const animationFiles = [];
	for (const file of files) {
		if (file.indexOf('.obj') !== -1) {
			animationFiles.push(path.resolve(folder, file));
		}
	}

	const frames = [];

	for (let i = 0; i < animationFiles.length; i += FRAMES_STEP) {
		const frame = readFrame(animationFiles[i]);
		frames.push(frame);
	}

	const pointsCount = frames.length * POINTS.length * 3;
	const limitSize = 6 * 4;
	const size = pointsCount + limitSize;
	const buffer = new ArrayBuffer(size);
	const limitData = new Float32Array(buffer, 0, 6);
	const pointsData = new Uint8Array(buffer, limitSize);

	const min = {
		x: Number.MAX_VALUE,
		y: Number.MAX_VALUE,
		z: Number.MAX_VALUE,
	}

	const max = {
		x: -Number.MAX_VALUE,
		y: -Number.MAX_VALUE,
		z: -Number.MAX_VALUE,
	}

	for (const frame of frames) {
		for (const pointName of POINTS) {
			const point = frame[pointName];

			min.x = Math.min(min.x, point.x);
			min.y = Math.min(min.y, point.y);
			min.z = Math.min(min.z, point.z);

			max.x = Math.max(max.x, point.x);
			max.y = Math.max(max.y, point.y);
			max.z = Math.max(max.z, point.z);
		}
	}

	limitData[0] = min.x;
	limitData[1] = min.y;
	limitData[2] = min.z;

	limitData[3] = max.x;
	limitData[4] = max.y;
	limitData[5] = max.z;

	// console.log(limitData);

	let p = 0;

	for (const frame of frames) {
		for (const pointName of POINTS) {
			const point = frame[pointName];
			// console.log(point.x, point.y, point.z); 
			pointsData[p++] = (point.x - min.x) / (max.x - min.x) * 0xff;
			pointsData[p++] = (point.y - min.y) / (max.y - min.y) * 0xff;
			pointsData[p++] = (point.z - min.z) / (max.z - min.z) * 0xff;
		}
	}

	// console.log(pointsData);
	const view = new Uint8Array(buffer);
	return { view };
}

function readAnimationsFiles(files) {
	const animationFolders = fs.readdirSync(path.resolve('resources/person'));
	for (const animationName of animationFolders) {
		const animationFolderPath = path.resolve('resources/person', animationName);
		if (fs.lstatSync(animationFolderPath).isDirectory()) {
			const animation = readAnimation(animationFolderPath);
			animation.name = animationName;
			files.push(animation);
		}
	}
}

exports.readAnimationsFiles = readAnimationsFiles;