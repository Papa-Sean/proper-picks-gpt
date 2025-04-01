/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			// Your theme extensions
		},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			'light',
			'dark',
			{
				'auburn-tigers': {
					primary: '#0c2340',
					'primary-content': '#dd550c',
					secondary: '#dd550c',
					'secondary-content': '#ffffff',
					accent: '#ffd700',
					'accent-content': '#0c2340',
					neutral: '#e5e5e5',
					'neutral-content': '#0c2340',
					'base-100': '#ffffff',
					'base-200': '#f5f5f5',
					'base-300': '#e5e5e5',
					'base-content': '#0c2340',
					info: '#0c2340',
					success: '#5cb85c',
					warning: '#ffd700',
					error: '#e84a27',
				},
			},
		],
		darkTheme: 'dark',
	},
};
