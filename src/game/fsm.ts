import { mathRandom } from "../utils/math";

export type FSMAction = {
	update: (time: number) => void;
	start: (data?: any) => void;
	time: number;
	data: any;
}

export type FSMTransition = {
	from: number[];
	to: number;
	data?: any;
	condition: () => boolean;
}

export class FSM {
	readonly actions = new Map<number, FSMAction>();
	readonly transitions: FSMTransition[] = [];

	private _state = -1;
	private _reactionTime = 0;
	private _time = 0;

	constructor(reaction: number) {
		this._reactionTime = reaction;
	}

	setState(state: number, data?: any) {
		this._state = state;
		const action = this.getAction();
		if (action) {
			action.start(data);
		}
	}

	getAction(): FSMAction {
		const action = this.actions.get(this._state);
		if (!action) throw 'Action not found: ' + this._state;
		return action;
	}

	update(time: number) {
		const action = this.getAction();
		if (action) {
			action.update(time);
		}

		this._time -= time;
		if (this._time <= 0) {
			this._time = this._reactionTime + this._reactionTime * mathRandom();
			for (const transition of this.transitions) {
				const { from, to } = transition;
				if (to !== this._state && (from.length === 0 || from.includes(this._state))) {
					if (transition.condition()) {
						this.setState(to, transition.data);
						break;
					}
				}
			}
		}
	}
}