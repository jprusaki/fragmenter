import {
	configDefaults, coverageConfigDefaults, defineConfig,
} from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		exclude: [
			...configDefaults.exclude,
			'./lib/**',
		],
		environment: 'jsdom',
		setupFiles: './test/vitest-setup.ts',
		coverage: {
			exclude: [
				...coverageConfigDefaults.exclude,
				'./lib'
			],
      reportsDirectory: './test/coverage',
			thresholds: {
				perFile: true,
				statements: 100,
				branches: 100,
				functions: 100,
				lines: 100,
			},
    }
	}
})
