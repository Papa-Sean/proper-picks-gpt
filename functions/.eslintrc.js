module.exports = {
	root: true, // This is important - it tells ESLint not to look for configs in parent directories
	env: {
		es6: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'google',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['tsconfig.json', 'tsconfig.dev.json'],
		sourceType: 'module',
	},
	ignorePatterns: [
		'/lib/**/*', // Ignore built files.
		'/node_modules/**/*',
	],
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		quotes: ['error', 'double'],
		'import/no-unresolved': 0,
		indent: ['error', 2],
	},
};
