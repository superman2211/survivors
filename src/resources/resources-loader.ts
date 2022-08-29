export const resources: ArrayBuffer[] = [];

export async function loadResources() {
	const response = await fetch('r');
	const buffer = await response.arrayBuffer();
	const view = new Uint8Array(buffer);
	let p = 0;
	while(p < view.length) {
		const length = view[p++];
		resources.push(buffer.slice(p, p + length));
		p += length;
	}
}
