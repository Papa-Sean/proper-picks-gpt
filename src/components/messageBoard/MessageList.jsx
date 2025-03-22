'use client';

import React, { useEffect, useState } from 'react';
import {
	collection,
	query,
	orderBy,
	onSnapshot,
	limit,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import MessageItem from './MessageItem';

export default function MessageList() {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Query for messages, ordered by timestamp
		const messagesRef = collection(db, 'messages');
		const q = query(
			messagesRef,
			orderBy('timestamp', 'desc'),
			limit(50) // Limit to most recent 50 messages
		);

		// Set up real-time listener
		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const messageList = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
					// Ensure we have properly handled timestamps
					timestamp: doc.data().timestamp || new Date(),
					expiresAt:
						doc.data().expiresAt ||
						new Date(Date.now() + 24 * 60 * 60 * 1000),
				}));
				setMessages(messageList);
				setLoading(false);
			},
			(error) => {
				console.error('Error fetching messages:', error);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, []);

	const handleDeleteMessage = (messageId) => {
		// Optimistic UI update
		setMessages(messages.filter((msg) => msg.id !== messageId));
	};

	if (loading) {
		return (
			<div className='flex justify-center p-12'>
				<div className='loading loading-dots loading-md'></div>
				<span className='ml-2'>Loading messages...</span>
			</div>
		);
	}

	if (messages.length === 0) {
		return (
			<div className='text-center p-8 bg-base-200 rounded-lg'>
				<p className='text-base-content/70'>
					No messages yet. Be the first to post!
				</p>
			</div>
		);
	}

	return (
		<div className='space-y-3'>
			{messages.map((message) => (
				<MessageItem
					key={message.id}
					message={message}
					onDelete={handleDeleteMessage}
				/>
			))}
		</div>
	);
}
