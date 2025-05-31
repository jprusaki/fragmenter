import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import compat from 'eslint-plugin-compat';
import tsdocPlugin from 'eslint-plugin-tsdoc';

export default defineConfig([
	{ files: ['**/*.{js,mjs,cjs,ts}'], plugins: { js }, extends: ['js/recommended'] },
	{
		files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	tseslint.configs.recommended,
	compat.configs['flat/recommended'],
	{
		files: ['**/*.{ts}'],
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		languageOptions: {
			parser: tseslint.parser,
		},
	},
	{
		ignores: [
			'./lib',
			'./dist'
		],
	},
	{
		plugins: {
			tsdoc: tsdocPlugin,
		},
		rules: {
			quotes: ['error', 'single', { avoidEscape: true }],
			semi: ['error', 'always'],
			'tsdoc/syntax': 'error',
		},
	},
]);
