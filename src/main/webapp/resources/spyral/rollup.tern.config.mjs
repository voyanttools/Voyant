import concat from 'rollup-plugin-concat';

let config = {
	input: 'tern/tern_input.js',
	plugins: [
		concat({
			groupedFiles: [{
				files: [
					'./node_modules/acorn/dist/acorn.js',
					'./node_modules/acorn-loose/dist/acorn-loose.js',
					'./node_modules/acorn-walk/dist/walk.js',
					'./node_modules/tern/lib/signal.js',
					'./node_modules/tern/lib/tern.js',
					'./node_modules/tern/lib/def.js',
					'./node_modules/tern/lib/comment.js',
					'./node_modules/tern/lib/infer.js',
					'./node_modules/tern/plugin/doc_comment.js'
				],
				outputFile: './tern/tern_worker_deps.js'
			}]
		})
	]
};

export default config;
