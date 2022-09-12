import { CommandType, generateImage } from "../../../utils/image"

export function generateAsphalt(width: number, height: number) {
	return generateImage([
		{ type: CommandType.FILL, color: 0xff666666 },
		{ type: CommandType.SIZE, width, height },
		{ type: CommandType.FILL, color: 0xff999999 },
		{ type: CommandType.PARTICLES, width, height, size: 0.5, sizeMax: 1, count: 10000, },
		{ type: CommandType.FILL, color: 0xff777777 },
		{ type: CommandType.PARTICLES, width, height, size: 0.5, sizeMax: 2, count: 5000, },
		{ type: CommandType.NOISE, colorOffset: 20 },
	]);
}