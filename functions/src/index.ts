/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Add this import
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize the app
initializeApp();

// Export the menuSuggestion function from genkit-sample
export * from './genkit-sample.js';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Schedule function to run every hour
export const cleanupExpiredMessages = onSchedule(
	{
		schedule: 'every 1 hours',
		timeZone: 'America/New_York', // Adjust to your timezone
	},
	async (event) => {
		const db = getFirestore();
		const now = new Date();

		// Query for expired messages
		const messagesRef = db.collection('messages');
		const expiredMessages = await messagesRef
			.where('expiresAt', '<=', now)
			.get();

		// Delete expired messages and update user counts
		const batch = db.batch();
		const userCounts = new Map();

		expiredMessages.forEach((doc) => {
			const data = doc.data();
			const userId = data.userId;

			// Track which users' counts need to be updated
			if (userId) {
				userCounts.set(userId, (userCounts.get(userId) || 0) + 1);
			}

			// Add delete operation to batch
			batch.delete(doc.ref);
		});

		// Update user message counts
		for (const [userId, count] of userCounts.entries()) {
			const userCountRef = db.collection('userMessageCounts').doc(userId);
			const userCountDoc = await userCountRef.get();

			if (userCountDoc.exists) {
				const currentCount = userCountDoc.data()?.count || 0;
				const newCount = Math.max(0, currentCount - count);
				batch.update(userCountRef, { count: newCount });
			}
		}

		// Commit all changes
		await batch.commit();

		console.log(`Deleted ${expiredMessages.size} expired messages`);
	}
);

// Example function (commented out)
/*
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
*/
