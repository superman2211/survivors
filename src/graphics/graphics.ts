import { Component, componentRender } from './component';
import { renderBegin, renderEnd, updateSize } from '../render/render';
import { createM4, identityM4 } from '../geom/matrix';

const globalM4 = createM4();
identityM4(globalM4);

declare global {
	const c: HTMLCanvasElement;
}
export const canvas = c as HTMLCanvasElement;

export function graphicsRender(component: Component) {
	updateSize();
	renderBegin();
	componentRender(component, globalM4);
	renderEnd();
}