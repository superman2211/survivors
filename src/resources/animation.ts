export function readAnimation(buffer: ArrayBuffer): Float32Array[] {
	const limitView = new Float32Array(buffer, 0, 6);
	const pointsView = new Uint8Array(buffer, 6 * 4);
	const animation: Float32Array[] = [];

	const [minX, minY, minZ, maxX, maxY, maxZ] = limitView;

	let frame = new Float32Array(20 * 3);

	let p = 0;
	let f = 0;

	while (p < pointsView.length) {
		frame[f++] = minX + pointsView[p++] / 0xff * (maxX - minX);
		frame[f++] = minY + pointsView[p++] / 0xff * (maxY - minY);
		frame[f++] = minZ + pointsView[p++] / 0xff * (maxZ - minZ);
		if (f === frame.length) {
			f = 0;
			animation.push(frame);
			frame = new Float32Array(20 * 3);
		}
	}
	return animation;
}