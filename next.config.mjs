/** @type {import('next').NextConfig} */
const nextConfig = {
	// Keep this to tell Next.js this is an exported static site for Firebase Hosting
	output: 'export',

	// This is critical - without it, image optimization will fail
	images: {
		unoptimized: true,
	},

	// This helps solve redirect and 404 issues
	trailingSlash: true,

	// Additional environment variable configuration
	env: {
		NEXT_PUBLIC_FIREBASE_API_KEY:
			process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
			'AIzaSyBKGqBIvTIghBDDY4miqPWNIRoEiKlCsZQ',
		NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
			process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
			'bracket-analysis-papagpt.firebaseapp.com',
		NEXT_PUBLIC_FIREBASE_PROJECT_ID:
			process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
			'bracket-analysis-papagpt',
		NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
			process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
			'bracket-analysis-papagpt.firebasestorage.app',
		NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
			process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
			'729631288438',
		NEXT_PUBLIC_FIREBASE_APP_ID:
			process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
			'1:729631288438:web:836928f5e6c6f600784357',
	},

	// Add redirects directly in the Next.js config
	async redirects() {
		return [
			{
				source: '/profile',
				destination: '/data-dashboard',
				permanent: false,
			},
		];
	},
};

export default nextConfig;
