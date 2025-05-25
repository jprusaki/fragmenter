/**
 * @typedef {import('webpack').Configuration} WebpackConfig
 * @typedef {Record<string, any>} WebpackEnv
 */

import { dirname, resolve } from 'node:path/posix';
import { fileURLToPath } from 'node:url';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';

/**
 * @type {WebpackConfig}
 */
const config = {
	entry: './src/index.ts',
	output: {
		filename: 'fragmenter.umd.min.js',
		path: resolve(__dirname, 'lib'),
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
				include: resolve(__dirname, 'src'),
				options: {
					configFile: 'tsconfig.json',
				}
			},
		],
	},
	resolve: {
		extensions: ['.ts', '...'],
	},
	devtool: 'source-map',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					sourceMap: {
						content: resolve(__dirname, 'lib/index.js.map')
					},
				},
			})
		],
	},
};

const webpackConfigFunction = () => {
	if (isProduction) {
		config.mode = 'production';
	} else {
		config.mode = 'development';
	}
	return config;
};

export default webpackConfigFunction;
