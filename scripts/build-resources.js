const fs = require('fs');
const path = require('path');
const { convertSound } = require('./base64sfxr');
const { readAnimationsFiles } = require('./person-animation');

function readSoundsFiles(files) {
	const soundFiles = fs.readdirSync(path.resolve('resources/sounds'));
	for(const fileName of soundFiles) {
		const filePath = path.resolve('resources/sounds', fileName);
		const text = fs.readFileSync(filePath).toString();
		const data = convertSound(text);
		const view = new Uint8Array(data.buffer);
		const name = 'sound_' + fileName;
		files.push({ name, view });
	}
}

function writeResources(files) {
	let length = 0;
	files.forEach(file => length += file.view.length + 2);

	const buffer = new ArrayBuffer(length);
	const view = new Uint8Array(buffer);

	let p = 0;
	for(const file of files) {
		const size = file.view.length;
		if (size > 0xffff) {
			throw 'block size overflow: ' + size + ', max: ' + 0xffff;
		}
		view[p++] = size & 0xff;
		view[p++] = (size >> 8) & 0xff;
		view.set(file.view, p);
		p += size;
	}

	fs.writeFileSync(path.resolve('dist/build/r'), view);
}

function createDirectories() {
	if (!fs.existsSync(path.resolve('dist'))) {
		fs.mkdirSync(path.resolve('dist'));
	}

	if (!fs.existsSync(path.resolve('dist/build'))) {
		fs.mkdirSync(path.resolve('dist/build'));
	}
}

function writeIds(files) {
	let code = 'export const enum Resources {\n';
	for(let i = 0; i < files.length; i++) {
		code += `\t${files[i].name} = ${i},\n`;
	}
	code += '}\n';
	fs.writeFileSync(path.resolve('src/resources/ids.ts'), code);
}

function main() {
	createDirectories();
	const files = [];
	readSoundsFiles(files);
	readAnimationsFiles(files);
	writeResources(files);
	writeIds(files);
}

main();