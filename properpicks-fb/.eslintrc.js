module.exports = {
	root: true, // Important - tells ESLint to stop here
	env: {
		es6: true,
		node: true,
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	extends: ['eslint:recommended', 'google'],
	rules: {
		'no-restricted-globals': ['error', 'name', 'length'],
		'prefer-arrow-callback': 'error',
		quotes: ['error', 'double', { allowTemplateLiterals: true }],
	},
	ignorePatterns: ['node_modules/**'],
	overrides: [
		{
			files: ['**/*.spec.*'],
			env: {
				mocha: true,
			},
			rules: {},
		},
	],
	globals: {},
};
