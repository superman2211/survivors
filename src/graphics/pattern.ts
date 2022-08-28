import { ColorTransform } from '../geom/color';

export function transformColor(c: number, ct: ColorTransform): string {
	let a = c >> 24 & 0xff;
	let r = c >> 16 & 0xff;
	let g = c >> 8 & 0xff;
	let b = c & 0xff;

	a = (a * ct.am + ct.ao) & 0xff;
	r = (r * ct.rm + ct.ro) & 0xff;
	g = (g * ct.gm + ct.go) & 0xff;
	b = (b * ct.bm + ct.bo) & 0xff;

	return `rgba(${r}, ${g}, ${b}, ${a / 0xff})`;
}

export function formatColor(c: number): string {
	const a = c >> 24 & 0xff;
	const r = c >> 16 & 0xff;
	const g = c >> 8 & 0xff;
	const b = c & 0xff;

	return `rgba(${r}, ${g}, ${b}, ${a / 0xff})`;
}
