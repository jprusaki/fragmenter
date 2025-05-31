import { dirname, resolve } from 'node:path/posix';
import { fileURLToPath } from 'node:url';
import { Configuration } from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const UMDConfig: Configuration = {
	output: {
		filename: 'fragmenter.umd.min.js',
		path: resolve(__dirname, '../../dist'),
		library: {
			name: 'fragmenter',
			type: 'umd',
			umdNamedDefine: true,
		},
	},
	module: {
		rules: [
			{
				test: /\.ts$/i,
				loader: 'ts-loader',
				exclude: ['/node_modules/'],
				options: {
					onlyCompileBundledFiles: true,
				}
			},
		],
	},
};
