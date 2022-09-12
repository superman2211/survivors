import { dpr } from "../utils/browser";
import { mathPI } from "../utils/math";
import { ELEMENT_SIZE } from "./geometry";
import { createM4, identityM4, inverseM4, multiplyM4, perspectiveM4, translationM4, transposeM4 } from "../geom/matrix";
import { fragmentShaderSource } from "./shaders/fragment";
import { vertexShaderSource } from "./shaders/vertex";

export const canvas = c as HTMLCanvasElement;
const gl = canvas.getContext('webgl')!;

const lights: number[][] = [];

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
const objectMatrixLocation = gl.getUniformLocation(program, "u_object");

const textures = new Map<HTMLCanvasElement, WebGLTexture>();
const buffers = new Map<Float32Array, WebGLBuffer>();

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
let currentGeometry: Float32Array | undefined;

export function renderObject(geometry: Float32Array, image: HTMLCanvasElement, matrix: Float32Array) {
	if (currentImage !== image) {
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

	if (currentGeometry !== geometry) {
		currentGeometry = geometry;
		if (buffers.has(geometry)) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.get(geometry)!);
		} else {
			const buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, geometry, gl.STATIC_DRAW);
			buffers.set(geometry, buffer!);
		}

		const stride = ELEMENT_SIZE * 4;
		gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, stride, 0);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, stride, 3 * 4);
		gl.enableVertexAttribArray(normalLocation);
		gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, stride, 3 * 4 + 3 * 4);
		gl.enableVertexAttribArray(texCoordLocation);
	}
	
	gl.uniformMatrix4fv(objectMatrixLocation, false, matrix);

	gl.drawArrays(gl.TRIANGLES, 0, geometry.length / ELEMENT_SIZE);

	drawCalls++;
}

let cameraX = 0;
let cameraY = 0;
let cameraZ = 0;

let drawCalls = 0;
const fps = [0];
let lastTime = performance.now();

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
	gl.uniform3fv(lightWorldPositionLocation, lights[0]);
	gl.uniform3fv(lightWorldPositionLocation2, lights[1]);
	gl.uniform3fv(lightWorldPositionLocation3, [cameraX, cameraY, 90]);
}

function renderBatch() {
	if (elementsCount) {
		drawCalls++;
		const data = elementsData.buffer.slice(0, elementsCount * 4);
		gl.bindBuffer(gl.ARRAY_BUFFER, elementsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, elementsCount / ELEMENT_SIZE);
		elementsCount = 0;
	}
}

export function addLight(light: number[]) {
	lights.push(light);
}

declare global {
	const i: HTMLDivElement;
}
const info = i;

export function renderEnd() {
	renderBatch();

	const deltaTime = performance.now() - lastTime;
	lastTime = performance.now();
	fps.push(1000 / deltaTime);
	if (fps.length > 30) {
		fps.shift();
	}
	let frameRate = 0;
	fps.forEach(n => frameRate += n);
	frameRate /= fps.length;

	info.innerText = 'FPS: ' + Math.round(frameRate) + ', DC: ' + drawCalls;
}
