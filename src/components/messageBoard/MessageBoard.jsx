'use client';

import React, { useState, useEffect } from 'react';
import MessageInput from './MessageInput';
import {
	collection,
	onSnapshot,
	query,
	orderBy,
	limit,
	doc,
	deleteDoc,
	getDoc,
	setDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function MessageBoard() {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [glitchActive, setGlitchActive] = useState(false);
	const { user } = useAuth();

	// Generate random Matrix-like code
	const generateMatrixCode = () => {
		let code = '';
		const characters = '0123456789ABCDEF';
		for (let i = 0; i < 8; i++) {
			code += characters.charAt(
				Math.floor(Math.random() * characters.length)
			);
		}
		return code;
	};

	// Trigger occasional UI glitches for effect
	const triggerGlitch = () => {
		setGlitchActive(true);
		setTimeout(() => setGlitchActive(false), 150);
	};

	// Add this function to handle message deletion
	const handleDeleteMessage = async (messageId) => {
		try {
			// Delete message from Firestore
			await deleteDoc(doc(db, 'messages', messageId));

			// Update UI optimistically (remove the message from local state)
			setMessages(messages.filter((msg) => msg.id !== messageId));

			// Update user's message count in Firestore
			if (user) {
				const countRef = doc(db, 'userMessageCounts', user.uid);
				const countDoc = await getDoc(countRef);

				if (countDoc.exists()) {
					const currentCount = countDoc.data().count || 0;
					if (currentCount > 0) {
						await setDoc(countRef, {
							count: currentCount - 1,
						});
					}
				}
			}

			// Show a brief glitch effect for visual feedback
			triggerGlitch();
		} catch (error) {
			console.error('Error deleting message:', error);
			// Optionally display an error to the user
		}
	};

	useEffect(() => {
		// Set up real-time message listener
		const messagesRef = collection(db, 'messages');
		const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const messagesList = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setMessages(messagesList);
				setLoading(false);

				// Random glitch effect when new messages arrive
				if (Math.random() > 0.7) triggerGlitch();
			},
			(error) => {
				console.error('Error fetching messages:', error);
				setLoading(false);
			}
		);

		// Random glitch effect every 5-10 seconds
		const glitchInterval = setInterval(() => {
			if (Math.random() > 0.7) triggerGlitch();
		}, Math.random() * 5000 + 5000);

		return () => {
			unsubscribe();
			clearInterval(glitchInterval);
		};
	}, []);

	return (
		<div
			className={`relative font-mono ${
				glitchActive ? 'animate-glitch' : ''
			}`}
		>
			{/* Matrix-like background effect */}
			<div className='absolute inset-0 -z-10 opacity-20 overflow-hidden'>
				<div className='grid grid-cols-12 gap-1 h-full'>
					{[...Array(48)].map((_, i) => (
						<div
							key={i}
							className='overflow-hidden'
						>
							{[...Array(20)].map((_, j) => (
								<div
									key={j}
									className='text-green-500 opacity-50 text-xs'
									style={{
										animation: `typewriter ${
											Math.random() * 3 + 1
										}s infinite`,
										animationDelay: `${Math.random() * 2}s`,
									}}
								>
									{generateMatrixCode()}
								</div>
							))}
						</div>
					))}
				</div>
			</div>

			{/* Terminal Container */}
			<div className='relative z-10 max-w-3xl w-full mx-auto mt-4 mb-8 border-2 border-green-500 bg-black shadow-[0_0_20px_rgba(0,255,0,0.3)] rounded-md overflow-hidden'>
				{/* Terminal header */}
				<div className='bg-green-900 text-green-400 px-4 py-2 flex justify-between items-center border-b border-green-700'>
					<div className='flex items-center gap-2'>
						<div className='w-3 h-3 bg-red-500 rounded-full'></div>
						<div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
						<div className='w-3 h-3 bg-green-500 rounded-full'></div>
					</div>
					<div className='typing-text overflow-hidden whitespace-nowrap border-r-2 border-green-500'>
						PROPER PICKS SECURE COMMS
					</div>
					<div className='text-xs'>
						{new Date().toISOString().slice(0, 10)}
					</div>
				</div>

				{/* Messages area */}
				<div className='p-4 text-green-400 h-96 overflow-auto'>
					{loading ? (
						<div className='flex flex-col items-center justify-center h-full'>
							<div className='text-center'>
								<p className='text-green-500 text-sm mb-2'>
									SCANNING COMMS CHANNEL...
								</p>
								<div className='w-40 bg-gray-900 rounded-full h-2.5 mb-4'>
									<div className='bg-green-500 h-2.5 rounded-full animate-pulse w-full'></div>
								</div>
								<p className='text-xs text-green-400'>
									ESTABLISHING SECURE CONNECTION
								</p>
							</div>
						</div>
					) : messages.length === 0 ? (
						<div className='text-center p-8'>
							<p className='text-yellow-500 mb-2'>
								ACCESS GRANTED
							</p>
							<p className='text-green-400'>NO MESSAGES FOUND</p>
							<p className='text-xs text-green-300 mt-4'>
								BE THE FIRST TO TRANSMIT
							</p>
						</div>
					) : (
						<div className='space-y-3'>
							{messages.map((message) => (
								<div
									key={message.id}
									className='border border-green-800 p-3 rounded bg-black bg-opacity-60'
								>
									<div className='flex justify-between items-start mb-1'>
										<div className='text-yellow-400 font-bold text-sm'>
											{message.username || 'ANONYMOUS'}
										</div>
										<div className='text-xs text-green-600'>
											{message.timestamp
												?.toDate()
												.toLocaleTimeString() ||
												'JUST NOW'}
										</div>
									</div>

									<p className='text-green-300 text-sm mb-2'>
										{message.content}
									</p>

									<div className='flex justify-between text-xs text-green-600'>
										<div>
											ID: {message.id.slice(0, 8)}...
										</div>
										<div>
											{message.expiresAt &&
												`EXPIRES IN: ${Math.max(
													0,
													Math.floor(
														(message.expiresAt.toDate() -
															new Date()) /
															(1000 * 60)
													)
												)} MIN`}
										</div>
										{user &&
											user.uid === message.userId && (
												<button
													onClick={() =>
														handleDeleteMessage(
															message.id
														)
													}
													className='text-red-400 hover:text-red-300'
												>
													[DELETE]
												</button>
											)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer with status info */}
				<div className='bg-black px-4 py-2 border-t border-green-700'>
					<div className='flex justify-between text-xs text-green-400'>
						<div>NETWORK: ENCRYPTED</div>
						<div>
							USERS ONLINE: {Math.floor(Math.random() * 15) + 5}
						</div>
						<div>STATUS: OPERATIONAL</div>
					</div>
				</div>
			</div>

			{/* Message Input - styled as a terminal command interface */}
			<div className='relative z-10 max-w-3xl mx-auto'>
				<MessageInput />
			</div>
		</div>
	);
}
