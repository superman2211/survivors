export const mathRound = Math.round;
export const mathRandom = Math.random;
export const mathSin = Math.sin;
export const mathCos = Math.cos;
export const mathAtan2 = Math.atan2;
export const mathAbs = Math.abs;
export const mathMax = Math.max;
export const mathMin = Math.min;
export const mathSqrt = Math.sqrt;
export const mathPI = Math.PI;
export const math2PI = mathPI * 2;

export function chance(): boolean {
	return mathRandom() > 0.5;
}

export function randomInt(min: number, max: number): number {
	return mathRound(min + mathRandom() * (max - min));
}

export function randomFloat(min: number, max: number): number {
	return min + mathRandom() * (max - min);
}

export function randomSelect<T>(array: Array<T>): T {
	const index = randomInt(0, array.length - 1);
	return array[index];
}

export function deltaAngle(angle0: number, angle1: number): number {
	const half = mathPI;
	const full = half * 2;

	let delta = (angle0 - angle1) % full;

	if (delta > half) delta -= full;
	if (delta < -half) delta += full;

	return delta;
}
