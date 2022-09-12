export const domDocument = document;
export const hasTouch = 'ontouchstart' in window;
export const dpr = devicePixelRatio;

export function createContext2d() {
	return domDocument.createElement('canvas').getContext('2d')!;
}
