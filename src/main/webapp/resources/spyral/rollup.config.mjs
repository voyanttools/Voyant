import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

let config = {
	strictDeprecations: true,
	input: 'src/index.js',
	output: {
		file: 'build/spyral.js',
		format: 'iife',
		name: 'Spyral',
		globals: {
			highcharts: 'Highcharts'
		}
	},
	plugins: [
		nodeResolve(),
		commonjs()
	],
	external: ['highcharts']
};

// https://rollupjs.org/guide/en/#babel
if (process.env.LOCAL_VOYANT === 'true') {
	config.plugins.push(babel({
		babelHelpers: 'bundled',
		exclude: 'node_modules/**' // for local dev, when voyantjs is loaded/linked from local install
	}))
} else {
	config.plugins.push(babel({
		babelHelpers: 'bundled',
		include: 'node_modules/voyant/**' // for normal build, when voyantjs is loaded from npm
	}))
}

export default config;
