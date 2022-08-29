export const UNIT_PLAYER = 0;
export const UNIT_ALLY = 1;
export const UNIT_ENEMY = 2;
export const UNIT_NEUTRAL = 3;

const friends: { [key: number]: number } = {
	[UNIT_ALLY]: UNIT_PLAYER,
	[UNIT_PLAYER]: UNIT_ALLY,
}

export function isFriend(type1: number, type2: number): boolean {
	if (type1 === type2) {
		return true;
	}
	return friends[type1] === type2;
}