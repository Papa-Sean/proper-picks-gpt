/** @type {import('next').NextConfig} */
const nextConfig = {
	// ENABLE this for static export
	output: 'export',

	images: {
		unoptimized: true,
	},

	// Disable strict mode to reduce double renders
	reactStrictMode: false,

	// Remove the redirects section or modify it to avoid loops
	// async redirects() {
	//   return [
	//     {
	//       source: '/login',
	//       has: [
	//         {
	//           type: 'cookie',
	//           key: 'auth',
	//         },
	//       ],
	//       destination: '/data-dashboard',
	//       permanent: false,
	//     },
	//   ];
	// },

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
};

export default nextConfig;
