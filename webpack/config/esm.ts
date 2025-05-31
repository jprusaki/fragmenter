import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Configuration } from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const ESMConfig: Configuration = {
	output: {
		filename: 'fragmenter.esm.min.js',
		path: resolve(__dirname, '../../dist'),
		library: {
			type: 'module',
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
	experiments: {
		outputModule: true,
	},
};
