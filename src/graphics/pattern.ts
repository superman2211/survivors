export function formatColor(c: number): string {
	const a = c >> 24 & 0xff;
	const r = c >> 16 & 0xff;
	const g = c >> 8 & 0xff;
	const b = c & 0xff;

	return `rgba(${r}, ${g}, ${b}, ${a / 0xff})`;
}
