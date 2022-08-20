export const round = Math.round;
export const random = Math.random;
export const sin = Math.sin;
export const cos = Math.cos;
export const atan2 = Math.atan2;
export const abs = Math.abs;
export const max = Math.max;
export const min = Math.min;
export const sqrt = Math.sqrt;
export const PI = Math.PI;
export const PI2 = PI * 2;

export function chance(): boolean {
	return random() > 0.5;
}

export function randomInt(min: number, max: number): number {
	return round(min + random() * (max - min));
}

export function randomFloat(min: number, max: number): number {
	return min + random() * (max - min);
}

export function deltaAngle(angle0: number, angle1: number): number {
	const half = PI;
	const full = half * 2;

	let delta = (angle0 - angle1) % full;

	if (delta > half) delta -= full;
	if (delta < -half) delta += full;

	return delta;
}
