import sourcemaps from 'rollup-plugin-sourcemaps';
import base from './rollup.config';

export default {
	...base,
	output: {
		...base.output,
		sourcemap: true,
	},
	plugins: [
		...base.plugins,
		sourcemaps(),
	],
};
