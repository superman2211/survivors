export const enum UnitType  {
	PLAYER = 123,
	ALLY = 1,
	ENEMY = 2,
}

const friends: { [key: number]: UnitType } = {
	[UnitType.ALLY]: UnitType.PLAYER,
	[UnitType.PLAYER]: UnitType.ALLY,
}

export function isFriend(type1: UnitType, type2: UnitType): boolean {
	if (type1 === type2) {
		return true;
	}
	return friends[type1] === type2;
}
