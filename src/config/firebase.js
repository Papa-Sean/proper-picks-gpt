import { initializeApp } from 'firebase/app';
import {
	getAuth,
	setPersistence,
	browserLocalPersistence,
	connectAuthEmulator,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Log the environment to debug
if (typeof window !== 'undefined') {
	console.log('Firebase config environment variables present:', {
		apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		messagingSenderId:
			!!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	});
}

const firebaseConfig = {
	apiKey:
		process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
		'AIzaSyBKGqBIvTIghBDDY4miqPWNIRoEiKlCsZQ',
	authDomain:
		process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
		'bracket-analysis-papagpt.firebaseapp.com',
	projectId:
		process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
		'bracket-analysis-papagpt',
	storageBucket:
		process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
		'bracket-analysis-papagpt.firebasestorage.app',
	messagingSenderId:
		process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '729631288438',
	appId:
		process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
		'1:729631288438:web:836928f5e6c6f600784357',
};

// Initialize Firebase - wrap in try/catch for better error handling
let app, auth, db;

try {
	app = initializeApp(firebaseConfig);
	auth = getAuth(app);
	db = getFirestore(app);

	// Connect to emulators in development, if the flag is set
	if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
		connectAuthEmulator(auth, 'http://localhost:9099');
		connectFirestoreEmulator(db, 'localhost', 8080);
		console.log('Connected to Firebase Emulators');
	}

	// Set persistence to LOCAL
	setPersistence(auth, browserLocalPersistence)
		.then(() => {
			console.log('Firebase auth persistence set to LOCAL');
		})
		.catch((error) => {
			console.error('Error setting auth persistence:', error);
		});
} catch (error) {
	console.error('Error initializing Firebase:', error);
}

export { auth, db };
