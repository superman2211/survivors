import { Point } from "../geom/point";

export interface Update {
	enabled?: boolean;
	onUpdate?: (time: number) => void;
}

export interface Keyboard {
	onKeyDown?: (e: KeyboardEvent) => void;
	onKeyUp?: (e: KeyboardEvent) => void;
}

export interface Pointer {
	touchable?: boolean;
	onTouchDown?: (global: Point, id: number) => void;
	onTouchUp?: (global: Point, id: number) => void;
	onTouchMove?: (global: Point, id: number) => void;
}
