'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
	addDoc,
	collection,
	serverTimestamp,
	query,
	where,
	getDocs,
	doc,
	getDoc,
	setDoc,
	orderBy,
	limit,
	deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function MessageInput() {
	const [content, setContent] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [messageCount, setMessageCount] = useState(0);
	const { user } = useAuth();
	const maxChars = 280;
	const maxMessages = 5;

	// Fetch current user message count
	useEffect(() => {
		if (!user) return;

		const fetchMessageCount = async () => {
			try {
				const countRef = doc(db, 'userMessageCounts', user.uid);
				const countDoc = await getDoc(countRef);

				if (countDoc.exists()) {
					setMessageCount(countDoc.data().count || 0);
				} else {
					await setDoc(countRef, { count: 0 });
					setMessageCount(0);
				}
			} catch (err) {
				console.error('Error fetching message count:', err);
			}
		};

		fetchMessageCount();
	}, [user]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!user) {
			setError('YOU MUST BE AUTHENTICATED TO TRANSMIT');
			return;
		}

		if (!content.trim()) return;
		setIsSubmitting(true);
		setError('');

		try {
			// Check if user reached 5 message limit
			if (messageCount >= maxMessages) {
				// Find and delete oldest message
				const messagesRef = collection(db, 'messages');
				const q = query(
					messagesRef,
					where('userId', '==', user.uid),
					orderBy('timestamp', 'asc'),
					limit(1)
				);

				const querySnapshot = await getDocs(q);
				if (!querySnapshot.empty) {
					await deleteDoc(
						doc(db, 'messages', querySnapshot.docs[0].id)
					);
				}
			}

			// Add new message
			const now = new Date();
			const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

			await addDoc(collection(db, 'messages'), {
				content,
				timestamp: serverTimestamp(),
				createdAt: now,
				expiresAt: expiryDate,
				userId: user.uid,
				username:
					user.displayName ||
					user.email?.split('@')[0] ||
					'ANONYMOUS',
			});

			// Update count
			const newCount = Math.min(messageCount + 1, maxMessages);
			await setDoc(doc(db, 'userMessageCounts', user.uid), {
				count: newCount,
			});

			setMessageCount(newCount);
			setContent('');
		} catch (error) {
			console.error('Error adding message: ', error);
			setError('TRANSMISSION FAILED. RETRY CONNECTION.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='border-2 border-green-500 bg-black shadow-[0_0_15px_rgba(0,255,0,0.3)] p-4 rounded-md'
		>
			{error && (
				<div className='mb-3 py-2 px-3 bg-red-900 border border-red-700 text-red-300 text-sm rounded'>
					<span>ERROR: {error}</span>
				</div>
			)}

			<div className='text-green-500 text-xs mb-2'>
				{user ? '> TRANSMIT MESSAGE:' : '> AUTHENTICATION REQUIRED'}
			</div>

			<div className='form-control'>
				<textarea
					className='textarea bg-black border-green-700 text-green-300 w-full resize-none focus:border-green-500 focus:ring-green-500 placeholder-green-800'
					placeholder={
						user
							? 'Enter transmission content...'
							: 'Login to transmit...'
					}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					maxLength={maxChars}
					disabled={!user || isSubmitting}
					rows={3}
					style={{ fontFamily: 'monospace' }}
				></textarea>

				<div className='flex justify-between text-xs text-green-500 mt-1'>
					<span>
						{user
							? `TRANSMISSION BUFFER: ${messageCount}/${maxMessages}`
							: 'ACCESS DENIED: LOGIN REQUIRED'}
					</span>
					<span>
						BYTES: {content.length}/{maxChars}
					</span>
				</div>
			</div>

			<button
				type='submit'
				className={`mt-2 w-full py-2 rounded text-sm font-bold ${
					!user || !content.trim() || isSubmitting
						? 'bg-green-900 text-green-700 cursor-not-allowed'
						: 'bg-green-700 text-black hover:bg-green-600 active:bg-green-800'
				}`}
				disabled={!user || !content.trim() || isSubmitting}
			>
				{isSubmitting ? '[ TRANSMITTING... ]' : '[ TRANSMIT MESSAGE ]'}
			</button>

			{!user && (
				<div className='mt-3 text-center'>
					<a
						href='/login'
						className='text-green-500 hover:text-green-400 text-xs underline'
					>
						[ESTABLISH SECURE CONNECTION]
					</a>
				</div>
			)}
		</form>
	);
}
