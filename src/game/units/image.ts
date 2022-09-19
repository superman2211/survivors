import { Command, CommandType, generateImage } from "../../utils/image";
import { randomInt, randomSelect } from "../../utils/math";
import { UnitType } from "./types";

function createUnitImage(skin: number, shirt: number, pants: number, boots: number) {
	const texture: Command[] = [
		{ type: CommandType.FILL, color: skin },
		{ type: CommandType.SIZE, width: 128, height: 128 },
		{ type: CommandType.FILL, color: shirt },
		{ type: CommandType.RECTANGLE, x: 64, y: 0, width: 64, height: 64 },
		{ type: CommandType.FILL, color: pants },
		{ type: CommandType.RECTANGLE, x: 0, y: 64, width: 64, height: 64 },
		{ type: CommandType.FILL, color: boots },
		{ type: CommandType.RECTANGLE, x: 64, y: 64, width: 64, height: 64 },
		{ type: CommandType.NOISE, colorOffset: 20 },
	];

	return generateImage(texture);
}

function createRandomUnitImage(skin: number[], shirt: number[], pants: number[], boots: number[]) {
	return createUnitImage(randomSelect(skin), randomSelect(shirt), randomSelect(pants), randomSelect(boots));
}

const SKIN = [0xFFE8BEAC, 0xFFC68642, 0xff492816];
const SHIRT = [0xff562B08, 0xff647E68, 0xffCD104D, 0xff9C2C77, 0xff6F38C5, 0xff367E18, 0xff5F6F94];
const PANTS = [0xff967E76, 0xff182747, 0xffFBF2CF, 0xff874C62, 0xff16213E, 0xff553939];
const BOOTS = [0xff42032C, 0xff000000, 0xffF7ECDE, 0xffEB1D36, 0xffFCF8E8, 0xff100F0F];

const IMAGES: { [key: number]: HTMLCanvasElement[] } = {
	[UnitType.PLAYER]: [createUnitImage(0xFFE8BEAC, 0xff1b9100, 0xff423c09, 0xff1f1a01)],
	[UnitType.ALLY]: [],
	[UnitType.ENEMY]: [],
}

let emenyImages = 20;
while(emenyImages--) {
	IMAGES[UnitType.ENEMY].push(createRandomUnitImage(SKIN, SHIRT, PANTS, BOOTS));
}

let allyImages = 10;
while(allyImages--) {
	IMAGES[UnitType.ALLY].push(createRandomUnitImage(SKIN, SHIRT, PANTS, BOOTS));
}

export function getUnitImage(type: UnitType): HTMLCanvasElement {
	const images = IMAGES[type];
	return randomSelect(images);
}