import { Command, CommandType, generateImage } from "./image";

export function generateMaterial(width: number, height: number, color: number, particles: number[]) {
	const commands: Command[] = [
		{ type: CommandType.FILL, color },
		{ type: CommandType.SIZE, width, height },
	];

	if (particles.length) {
		let i = 0;
		while (i < particles.length) {
			const color = particles[i++];
			const size = particles[i++];
			const sizeMax = particles[i++];
			const count = particles[i++];

			commands.push(
				{ type: CommandType.FILL, color },
				{ type: CommandType.PARTICLES, width, height, size, sizeMax, count },
			)
		}
	}

	commands.push({ type: CommandType.NOISE, colorOffset: 20 });

	return generateImage(commands);
}