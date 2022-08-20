import { Component } from "../graphics/component";
import { Command, CommandType, generateImage } from "../utils/generate-image";

const texture: Command[] = [
	{ type: CommandType.FILL, color: 0xff666666 },
	{ type: CommandType.SIZE, width: 512, height: 512 },
	{ type: CommandType.FILL, color: 0xff778877 },
	{ type: CommandType.RECTANGLE, x: 20, y: 20, width: 50, height: 50 },
	{ type: CommandType.REPEAT, stepX: 70, stepY: 70, count: 48, cols: 7, },
	{ type: CommandType.FILL, color: 0xff666666 },
	{ type: CommandType.RECTANGLE, x: 140, y: 140, width: 220, height: 220 },
	{ type: CommandType.FILL, color: 0xff778877 },
	{ type: CommandType.ELLIPSE, x: 160, y: 160, width: 190, height: 190 },
	{ type: CommandType.NOISE, colorOffset: 40 },
]

export function ground(): Component {
	const size = 512;
	const image = generateImage(texture);
	return { children: [{ image, x: -size / 2, y: -size / 2 }] };
}