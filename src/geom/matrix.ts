import { createV3, crossV3, normalizeV3, subtractV3 } from "./vector";

export function createM4(): Float32Array {
	return new Float32Array(16);
}

export function identityM4(dst: Float32Array) {
	dst[0] = 1;
	dst[1] = 0;
	dst[2] = 0;
	dst[3] = 0;

	dst[4] = 0;
	dst[5] = 1;
	dst[6] = 0;
	dst[7] = 0;
	
	dst[8] = 0;
	dst[9] = 0;
	dst[10] = 1;
	dst[11] = 0;
	
	dst[12] = 0;
	dst[13] = 0;
	dst[14] = 0;
	dst[15] = 1;
}

export function transformV3(m: Float32Array, v: Float32Array, dst: Float32Array) {
	var v0 = v[0];
	var v1 = v[1];
	var v2 = v[2];
	var d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];

	dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
	dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
	dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;

	return dst;
}

export function perspectiveM4(fov: number, aspect: number, near: number, far: number, dst: Float32Array) {
	const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
	const rangeInv = 1.0 / (near - far);
	dst[0] = f / aspect;
	dst[1] = 0;
	dst[2] = 0;
	dst[3] = 0;
	dst[4] = 0;
	dst[5] = f;
	dst[6] = 0;
	dst[7] = 0;
	dst[8] = 0;
	dst[9] = 0;
	dst[10] = (near + far) * rangeInv;
	dst[11] = -1;
	dst[12] = 0;
	dst[13] = 0;
	dst[14] = near * far * rangeInv * 2;
	dst[15] = 0;
	return dst;
}

export function multiplyM4(a: Float32Array, b: Float32Array, dst: Float32Array) {
	const b00 = b[0 * 4 + 0];
	const b01 = b[0 * 4 + 1];
	const b02 = b[0 * 4 + 2];
	const b03 = b[0 * 4 + 3];
	const b10 = b[1 * 4 + 0];
	const b11 = b[1 * 4 + 1];
	const b12 = b[1 * 4 + 2];
	const b13 = b[1 * 4 + 3];
	const b20 = b[2 * 4 + 0];
	const b21 = b[2 * 4 + 1];
	const b22 = b[2 * 4 + 2];
	const b23 = b[2 * 4 + 3];
	const b30 = b[3 * 4 + 0];
	const b31 = b[3 * 4 + 1];
	const b32 = b[3 * 4 + 2];
	const b33 = b[3 * 4 + 3];
	const a00 = a[0 * 4 + 0];
	const a01 = a[0 * 4 + 1];
	const a02 = a[0 * 4 + 2];
	const a03 = a[0 * 4 + 3];
	const a10 = a[1 * 4 + 0];
	const a11 = a[1 * 4 + 1];
	const a12 = a[1 * 4 + 2];
	const a13 = a[1 * 4 + 3];
	const a20 = a[2 * 4 + 0];
	const a21 = a[2 * 4 + 1];
	const a22 = a[2 * 4 + 2];
	const a23 = a[2 * 4 + 3];
	const a30 = a[3 * 4 + 0];
	const a31 = a[3 * 4 + 1];
	const a32 = a[3 * 4 + 2];
	const a33 = a[3 * 4 + 3];
	dst[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
	dst[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
	dst[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
	dst[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
	dst[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
	dst[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
	dst[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
	dst[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
	dst[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
	dst[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
	dst[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
	dst[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
	dst[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
	dst[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
	dst[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
	dst[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
	return dst;
}

export function lookAt(cameraPosition: Float32Array, target: Float32Array, up: Float32Array, dst: Float32Array) {
	const zAxis = createV3(); normalizeV3(subtractV3(cameraPosition, target, zAxis), zAxis);
	const xAxis = createV3(); normalizeV3(crossV3(up, zAxis, xAxis), xAxis);
	const yAxis = createV3(); normalizeV3(crossV3(zAxis, xAxis, yAxis), yAxis);

	dst[0] = xAxis[0];
	dst[1] = xAxis[1];
	dst[2] = xAxis[2];
	dst[3] = 0;
	dst[4] = yAxis[0];
	dst[5] = yAxis[1];
	dst[6] = yAxis[2];
	dst[7] = 0;
	dst[8] = zAxis[0];
	dst[9] = zAxis[1];
	dst[10] = zAxis[2];
	dst[11] = 0;
	dst[12] = cameraPosition[0];
	dst[13] = cameraPosition[1];
	dst[14] = cameraPosition[2];
	dst[15] = 1;

	return dst;
}

export function inverseM4(m: Float32Array, dst: Float32Array) {
	const m00 = m[0 * 4 + 0];
	const m01 = m[0 * 4 + 1];
	const m02 = m[0 * 4 + 2];
	const m03 = m[0 * 4 + 3];
	const m10 = m[1 * 4 + 0];
	const m11 = m[1 * 4 + 1];
	const m12 = m[1 * 4 + 2];
	const m13 = m[1 * 4 + 3];
	const m20 = m[2 * 4 + 0];
	const m21 = m[2 * 4 + 1];
	const m22 = m[2 * 4 + 2];
	const m23 = m[2 * 4 + 3];
	const m30 = m[3 * 4 + 0];
	const m31 = m[3 * 4 + 1];
	const m32 = m[3 * 4 + 2];
	const m33 = m[3 * 4 + 3];
	const tmp_0 = m22 * m33;
	const tmp_1 = m32 * m23;
	const tmp_2 = m12 * m33;
	const tmp_3 = m32 * m13;
	const tmp_4 = m12 * m23;
	const tmp_5 = m22 * m13;
	const tmp_6 = m02 * m33;
	const tmp_7 = m32 * m03;
	const tmp_8 = m02 * m23;
	const tmp_9 = m22 * m03;
	const tmp_10 = m02 * m13;
	const tmp_11 = m12 * m03;
	const tmp_12 = m20 * m31;
	const tmp_13 = m30 * m21;
	const tmp_14 = m10 * m31;
	const tmp_15 = m30 * m11;
	const tmp_16 = m10 * m21;
	const tmp_17 = m20 * m11;
	const tmp_18 = m00 * m31;
	const tmp_19 = m30 * m01;
	const tmp_20 = m00 * m21;
	const tmp_21 = m20 * m01;
	const tmp_22 = m00 * m11;
	const tmp_23 = m10 * m01;

	const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
		(tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
	const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
		(tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
	const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
		(tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
	const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
		(tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

	const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

	dst[0] = d * t0;
	dst[1] = d * t1;
	dst[2] = d * t2;
	dst[3] = d * t3;
	dst[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
		(tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
	dst[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
		(tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
	dst[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
		(tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
	dst[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
		(tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
	dst[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
		(tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
	dst[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
		(tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
	dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
		(tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
	dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
		(tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
	dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
		(tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
	dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
		(tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
	dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
		(tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
	dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
		(tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

	return dst;
}

export function xRotationM4(angleInRadians: number, dst: Float32Array) {
	var c = Math.cos(angleInRadians);
	var s = Math.sin(angleInRadians);

	dst[0] = 1;
	dst[1] = 0;
	dst[2] = 0;
	dst[3] = 0;
	dst[4] = 0;
	dst[5] = c;
	dst[6] = s;
	dst[7] = 0;
	dst[8] = 0;
	dst[9] = -s;
	dst[10] = c;
	dst[11] = 0;
	dst[12] = 0;
	dst[13] = 0;
	dst[14] = 0;
	dst[15] = 1;

	return dst;
}

export function yRotationM4(angleInRadians: number, dst: Float32Array) {
	var c = Math.cos(angleInRadians);
	var s = Math.sin(angleInRadians);

	dst[0] = c;
	dst[1] = 0;
	dst[2] = -s;
	dst[3] = 0;
	dst[4] = 0;
	dst[5] = 1;
	dst[6] = 0;
	dst[7] = 0;
	dst[8] = s;
	dst[9] = 0;
	dst[10] = c;
	dst[11] = 0;
	dst[12] = 0;
	dst[13] = 0;
	dst[14] = 0;
	dst[15] = 1;

	return dst;
}

export function zRotationM4(angleInRadians: number, dst: Float32Array) {
	var c = Math.cos(angleInRadians);
	var s = Math.sin(angleInRadians);

	dst[0] = c;
	dst[1] = s;
	dst[2] = 0;
	dst[3] = 0;
	dst[4] = -s;
	dst[5] = c;
	dst[6] = 0;
	dst[7] = 0;
	dst[8] = 0;
	dst[9] = 0;
	dst[10] = 1;
	dst[11] = 0;
	dst[12] = 0;
	dst[13] = 0;
	dst[14] = 0;
	dst[15] = 1;

	return dst;
}

export function scalingM4(sx: number, sy: number, sz: number, dst: Float32Array) {
	dst[0] = sx;
	dst[1] = 0;
	dst[2] = 0;
	dst[3] = 0;
	dst[4] = 0;
	dst[5] = sy;
	dst[6] = 0;
	dst[7] = 0;
	dst[8] = 0;
	dst[9] = 0;
	dst[10] = sz;
	dst[11] = 0;
	dst[12] = 0;
	dst[13] = 0;
	dst[14] = 0;
	dst[15] = 1;
	return dst;
}

export function translationM4(tx: number, ty: number, tz: number, dst: Float32Array) {
	dst[0] = 1;
	dst[1] = 0;
	dst[2] = 0;
	dst[3] = 0;

	dst[4] = 0;
	dst[5] = 1;
	dst[6] = 0;
	dst[7] = 0;

	dst[8] = 0;
	dst[9] = 0;
	dst[10] = 1;
	dst[11] = 0;

	dst[12] = tx;
	dst[13] = ty;
	dst[14] = tz;
	dst[15] = 1;
	return dst;
}

export function transposeM4(m: Float32Array, dst: Float32Array) {
	dst[0] = m[0];
	dst[1] = m[4];
	dst[2] = m[8];
	dst[3] = m[12];
	dst[4] = m[1];
	dst[5] = m[5];
	dst[6] = m[9];
	dst[7] = m[13];
	dst[8] = m[2];
	dst[9] = m[6];
	dst[10] = m[10];
	dst[11] = m[14];
	dst[12] = m[3];
	dst[13] = m[7];
	dst[14] = m[11];
	dst[15] = m[15];
	return dst;
}

export function transformM4(
	m: Float32Array,
	tx: number = 0,
	ty: number = 0,
	tz: number = 0,
	rx: number = 0,
	ry: number = 0,
	rz: number = 0,
	sx: number = 1,
	sy: number = 1,
	sz: number = 1
) {
	scalingM4(sx, sy, sz, m);

	const temp = createM4();

	if (rx) {
		xRotationM4(rx, temp);
		multiplyM4(temp, m, m);
	}

	if (ry) {
		yRotationM4(ry, temp);
		multiplyM4(temp, m, m);
	}

	if (rz) {
		zRotationM4(rz, temp);
		multiplyM4(temp, m, m);
	}
	
	translationM4(tx, ty, tz, temp);
	multiplyM4(temp, m, m);
}

export function composeM4(translation: number[], quaternion: number[], scale: number[], dst: Float32Array) {
	const x = quaternion[0];
	const y = quaternion[1];
	const z = quaternion[2];
	const w = quaternion[3];

	const x2 = x + x;
	const y2 = y + y;
	const z2 = z + z;

	const xx = x * x2;
	const xy = x * y2;
	const xz = x * z2;

	const yy = y * y2;
	const yz = y * z2;
	const zz = z * z2;

	const wx = w * x2;
	const wy = w * y2;
	const wz = w * z2;

	const sx = scale[0];
	const sy = scale[1];
	const sz = scale[2];

	dst[0] = (1 - (yy + zz)) * sx;
	dst[1] = (xy + wz) * sx;
	dst[2] = (xz - wy) * sx;
	dst[3] = 0;

	dst[4] = (xy - wz) * sy;
	dst[5] = (1 - (xx + zz)) * sy;
	dst[6] = (yz + wx) * sy;
	dst[7] = 0;

	dst[8] = (xz + wy) * sz;
	dst[9] = (yz - wx) * sz;
	dst[10] = (1 - (xx + yy)) * sz;
	dst[11] = 0;

	dst[12] = translation[0];
	dst[13] = translation[1];
	dst[14] = translation[2];
	dst[15] = 1;

	return dst;
}
