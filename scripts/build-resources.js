const fs = require('fs');
const path = require('path');
const { convertSound } = require('./base64sfxr');

function readSoundsFiles(files) {
	const soundFiles = fs.readdirSync(path.resolve('resources/sounds'));
	for(const fileName of soundFiles) {
		const filePath = path.resolve('resources/sounds', fileName);
		const text = fs.readFileSync(filePath).toString();
		const data = convertSound(text);
		const view = new Uint8Array(data.buffer);
		const type = 'Float32Array';
		const length = data.length;
		const name = 'sound_' + fileName;
		files.push({ name, type, view, length });
	}
}

function writeResources(files) {
	let length = 0;
	files.forEach(file => length += file.view.length + 1);

	const buffer = new ArrayBuffer(length);
	const view = new Uint8Array(buffer);

	let p = 0;
	for(const file of files) {
		if (file.view.length > 0xff) {
			throw 'length overflow';
		}
		view[p++] = file.view.length;
		view.set(file.view, p);
		p += file.view.length;
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
	let code = '';
	for(let i = 0; i < files.length; i++) {
		code += `export const ${files[i].name} = ${i};\n`;
	}
	fs.writeFileSync(path.resolve('src/resources/ids.ts'), code);
}

function main() {
	createDirectories();
	const files = [];
	readSoundsFiles(files);
	writeResources(files);
	writeIds(files);
}

main();