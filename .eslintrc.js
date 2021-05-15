module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'airbnb',
		'airbnb-typescript',
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended'
	],
	parserOptions: {
		project: './tsconfig.json',
	},
	env: {
		browser: true,
		node: true,
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		'prettier/prettier': 'error',
	},
};
