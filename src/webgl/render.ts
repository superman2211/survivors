import { generateGroundImage } from "../game/objects/ground";
import { ANIMATION_POINTS } from "../resources/animation";
import { dpr } from "../utils/browser";
import { mathPI, mathSin, randomFloat } from "../utils/math";
import { createCube, CUBE_POINTS } from "./cube";
import { ELEMENT_SIZE, Geometry, transformGeometry } from "./geometry";
import { createM4, createV3, identityM4, inverseM4, lookAt, multiplyM4, normalizeV3, perspectiveM4, transformM4, transformV3, translationM4, transposeM4, yRotationM4 } from "./m4";
import { fragmentShaderSource } from "./shaders/fragment";
import { vertexShaderSource } from "./shaders/vertex";

export const canvas = c as HTMLCanvasElement;
const gl = canvas.getContext('webgl')!;

const vs = gl.createShader(gl.VERTEX_SHADER)!;
gl.shaderSource(vs, vertexShaderSource);
gl.compileShader(vs);

const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
gl.shaderSource(fs, fragmentShaderSource);
gl.compileShader(fs);

const program = gl.createProgram()!;
gl.attachShader(program, vs);
gl.attachShader(program, fs);

gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, "a_position");
const normalLocation = gl.getAttribLocation(program, "a_normal");
const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

const worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
const worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
const colorLocation = gl.getUniformLocation(program, "u_color");
const lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
const lightWorldPositionLocation2 = gl.getUniformLocation(program, "u_lightWorldPosition2");
const lightWorldPositionLocation3 = gl.getUniformLocation(program, "u_lightWorldPosition3");
const worldLocation = gl.getUniformLocation(program, "u_world");

// const image = generateGroundImage();


const textures = new Map<HTMLCanvasElement,WebGLTexture>();

// const cube = createCube(20, 20, 20);

const elementsBuffer = gl.createBuffer();
const elementsData = new Float32Array(1024 * 1024 * 10);
let elementsCount = 0;

const fieldOfViewRadians = mathPI / 3;

const projectionMatrix = createM4();
const cameraMatrix = createM4();
const viewMatrix = createM4();
const viewProjectionMatrix = createM4();
const worldMatrix = createM4();
const worldViewProjectionMatrix = createM4();
const worldInverseMatrix = createM4();
const worldInverseTransposeMatrix = createM4();

export function updateSize() {
	const w = (innerWidth * dpr) | 0;
	const h = (innerHeight * dpr) | 0;

	if (w !== canvas.width) {
		canvas.width = w;
	}

	if (h !== canvas.height) {
		canvas.height = h;
	}
}

let currentImage: HTMLCanvasElement | undefined;

// const normalsMatrix = createM4();

export function renderObject(geometry: Float32Array, image: HTMLCanvasElement, matrix: Float32Array) {
	if (currentImage !== image) {
		renderBatch();

		currentImage = image;
		if (textures.has(image)) {
			gl.bindTexture(gl.TEXTURE_2D, textures.get(image)!);
		} else {
			const texture = gl.createTexture()!;
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			textures.set(image, texture);
		}
	}

	elementsCount = transformGeometry(geometry, matrix, elementsData, elementsCount);

	//const { vertecies, normals, uvs } = geometry;
	// const vector = createV3();

	// normalsMatrix.set(matrix);
	// normalsMatrix[12] = 0;
	// normalsMatrix[13] = 0;
	// normalsMatrix[14] = 0;
	// normalsMatrix[15] = 1;

	// const elements = vertecies.length / 3;

	// for (let i = 0; i < elements; i++) {
	// 	const j = i * 3;
	// 	const k = i * 2;

	// 	vector[0] = vertecies[j];
	// 	vector[1] = vertecies[j + 1];
	// 	vector[2] = vertecies[j + 2];
	// 	transformV3(matrix, vector, vector);
	// 	elementsData.push(...vector);

	// 	vector[0] = normals[j];
	// 	vector[1] = normals[j + 1];
	// 	vector[2] = normals[j + 2];
	// 	transformV3(normalsMatrix, vector, vector);
	// 	// normalizeV3(vector, vector);
	// 	elementsData.push(...vector);

	// 	elementsData.push(uvs[k], uvs[k + 1]);
	// }
}

// interface Object3d {
// 	geometry: Geometry,
// 	texture: HTMLCanvasElement | HTMLImageElement
// 	matrix?: Float32Array,

// 	x?: number;
// 	y?: number;
// 	z?: number;

// 	sx?: number;
// 	sy?: number;
// 	sz?: number;

// 	rx?: number;
// 	ry?: number;
// 	rz?: number;
// }

// interface Cube3d extends Object3d {
// 	rsx: number;
// 	rsy: number;
// 	rsz: number;
// }

// const objects: Cube3d[] = [];

// for (let i = 0; i < 10; i++) {
// 	const x = -70 + (i % 5) * 150;
// 	const y = -70 + ((i / 5) | 0) * 150;
// 	objects.push({
// 		geometry: cube,
// 		texture: image,
// 		x,//: randomFloat(-100, 100),
// 		y,//: randomFloat(-100, 100),
// 		z: 50,
// 		sx: 1.5,
// 		sy: 1.5,
// 		rx: 0,//randomFloat(-1, 1),
// 		ry: 0,//randomFloat(-1, 1),
// 		rz: 0,//randomFloat(-1, 1),
// 		rsx: 0,//randomFloat(-0.02, 0.02),
// 		rsy: 0,//randomFloat(-0.02, 0.02),
// 		rsz: 0,//randomFloat(-0.02, 0.02),
// 	})
// }

// objects.push({
// 	geometry: cube,
// 	texture: image,
// 	x: 0,
// 	y: 0,
// 	rx: 0,
// 	ry: 0,
// 	rz: 0,
// 	rsx: 0,
// 	rsy: 0,
// 	rsz: 0,
// 	sx: 6,
// 	sy: 6,
// 	sz: 0.01,
// })

const objectMatrix = createM4();

let light1 = 0;
let light2 = 0;

let cameraX = 0;
let cameraY = 0;
let cameraZ = 0;

let drawCalls = 0;

export function setCamera(x: number, y: number, z: number) {
	cameraX = x;
	cameraY = y;
	cameraZ = z;
}

export function renderBegin() {
	drawCalls = 0;

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.useProgram(program);

	gl.bindBuffer(gl.ARRAY_BUFFER, elementsBuffer);
	const stride = (3 + 3 + 2) * 4;
	gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, stride, 3 * 4);
	gl.enableVertexAttribArray(normalLocation);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, stride, 3 * 4 + 3 * 4);
	gl.enableVertexAttribArray(texCoordLocation);

	const aspect = canvas.width / canvas.height;
	const zNear = 1;
	const zFar = 2000;
	perspectiveM4(fieldOfViewRadians, aspect, zNear, zFar, projectionMatrix);

	translationM4(cameraX, cameraY, cameraZ, cameraMatrix);

	inverseM4(cameraMatrix, viewMatrix);
	multiplyM4(projectionMatrix, viewMatrix, viewProjectionMatrix);

	identityM4(worldMatrix);

	multiplyM4(viewProjectionMatrix, worldMatrix, worldViewProjectionMatrix);
	inverseM4(worldMatrix, worldInverseMatrix);
	transposeM4(worldInverseMatrix, worldInverseTransposeMatrix);

	gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
	gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
	gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

	gl.uniform4fv(colorLocation, [0.3, 1, 0.2, 1]);
	gl.uniform3fv(lightWorldPositionLocation, [0, 0, 200]);
	gl.uniform3fv(lightWorldPositionLocation2, [1000, 0, 200]);
	gl.uniform3fv(lightWorldPositionLocation3, [cameraX, cameraY, 90]);
}

function renderBatch() {
	if (elementsCount) {
		// console.log(elementsCount, ANIMATION_POINTS * CUBE_POINTS * ELEMENT_SIZE);
		drawCalls++;
		// elementsCount = CUBE_POINTS * ELEMENT_SIZE * 6;
		const data = elementsData.buffer.slice(0, elementsCount * 4);
		gl.bindBuffer(gl.ARRAY_BUFFER, elementsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, elementsCount / ELEMENT_SIZE);
		elementsCount = 0;
	}
}

declare global {
	const i: HTMLDivElement;
}
const info = i;

export function renderEnd() {
	renderBatch();
	info.innerText = 'drawCalls: ' + drawCalls;
	// console.log(drawCalls);
}

// export function renderTest() {
// 	updateSize();
// 	renderBegin();
// 	renderEnd();
	
// 	light1 += 0.01;
// 	light2 += 0.02;

// 	objects.forEach(o => {
// 		o.rx! += o.rsx;
// 		o.ry! += o.rsy;
// 		o.rz! += o.rsz;

// 		transformM4(
// 			objectMatrix,
// 			o.x ?? 0,
// 			o.y ?? 0,
// 			o.z ?? 0,
// 			o.rx ?? 0,
// 			o.ry ?? 0,
// 			o.rz ?? 0,
// 			o.sx ?? 1,
// 			o.sy ?? 1,
// 			o.sz ?? 1,
// 		);

// 		renderObject(o.geometry, objectMatrix);
// 	});

// 	requestAnimationFrame(renderTest);
// }
