import { dirname, resolve } from 'node:path/posix';
import { fileURLToPath } from 'node:url';
import TerserPlugin from 'terser-webpack-plugin';
import webpack, { Configuration } from 'webpack';
import { UMDConfig } from './config/umd.js';
import { ESMConfig } from './config/esm.js';

interface Env {
	mode: 'production' | 'development';
	module: 'esm' | 'umd';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const banner = `/**
 * fragmenter
 * https://github.com/jprusaki/fragmenter
 * @license Apache-2.0
 *
 * Copyright 2025 José Pedro Rusakiewicz Serna
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */`;

const baseConfig: Configuration = {
	entry: resolve(__dirname, '../src'),
	resolve: {
		extensionAlias: {
			'.js': '.ts'
		},
		extensions: ['.ts', '...'],
	},
	plugins: [
		new webpack.BannerPlugin({
			banner,
			raw: true,
			entryOnly: true,
			stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
		}),
	],
	devtool: 'source-map',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					output: {
						comments: false,
					},
					sourceMap: {
						content: resolve(__dirname, 'lib/index.js.map')
					},
				},
			})
		],
	},
};

const webpackConfigFunction = (env: Env): Configuration | undefined => {
	if (isProduction) {
		baseConfig.mode = 'production';
	} else {
		baseConfig.mode = 'development';
	}
	if (env.module === 'umd') {
		return { ...baseConfig, ...UMDConfig };
	}

	if (env.module === 'esm') {
		return { ...baseConfig, ...ESMConfig };
	}
};

export default webpackConfigFunction;
