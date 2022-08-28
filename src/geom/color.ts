export interface ColorTransform {
	am: number;
	rm: number;
	gm: number;
	bm: number;

	ao: number;
	ro: number;
	go: number;
	bo: number;
}

export function colorTransformCreate(): ColorTransform {
	return {
		am: 1,
		rm: 1,
		gm: 1,
		bm: 1,

		ao: 0,
		ro: 0,
		go: 0,
		bo: 0,
	};
}

export function colorTransformConcat(ct1: ColorTransform, ct0: ColorTransform, result: ColorTransform) {
	const am = ct1.am * ct0.am;
	const rm = ct1.rm * ct0.rm;
	const gm = ct1.gm * ct0.gm;
	const bm = ct1.bm * ct0.bm;
	const ao = ct1.am * ct0.ao + ct1.ao;
	const ro = ct1.rm * ct0.ro + ct1.ro;
	const go = ct1.gm * ct0.go + ct1.go;
	const bo = ct1.bm * ct0.bo + ct1.bo;

	result.am = am;
	result.rm = rm;
	result.gm = gm;
	result.bm = bm;
	result.ao = ao;
	result.ro = ro;
	result.go = go;
	result.bo = bo;
}
