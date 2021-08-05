import {concatFiles} from 'rollup-plugin-concatfiles';

let config = {
	input: 'tern/tern_input.js',
	output: {
		file: 'tern/tern_worker_deps.js',
		format: 'iife'
	},
	plugins: [
		concatFiles({
			files: {
				'tern/tern_worker_deps.js':{
					concatFiles: [
						'node_modules/acorn/dist/acorn.js',
						'node_modules/acorn-loose/dist/acorn-loose.js',
						'node_modules/acorn-walk/dist/walk.js',
						'node_modules/tern/lib/signal.js',
						'node_modules/tern/lib/tern.js',
						'node_modules/tern/lib/def.js',
						'node_modules/tern/lib/comment.js',
						'node_modules/tern/lib/infer.js',
						'node_modules/tern/plugin/doc_comment.js'
					]
				}
			}
		})
	]
};

export default config;
