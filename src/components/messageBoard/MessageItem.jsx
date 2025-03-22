'use client';

import React, { useEffect, useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function MessageItem({ message, onDelete }) {
	const { user } = useAuth();
	const isOwner = user && user.uid === message.userId;
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true); // Ensure this runs only on the client
	}, []);

	// Fix timestamp display
	const formatTimestamp = (timestamp) => {
		if (!timestamp) return 'Just now';

		// Handle Firestore timestamp objects
		const date = timestamp.toDate
			? timestamp.toDate()
			: new Date(timestamp);

		// Check if date is valid before formatting
		if (isNaN(date.getTime())) return 'Just now';

		// Format relative time: "2 minutes ago", "1 hour ago", etc.
		const now = new Date();
		const diffMs = now - date;
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);

		if (diffSec < 60) return 'Just now';
		if (diffMin < 60)
			return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
		if (diffHour < 24)
			return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;

		// For older messages, show the actual date
		return date.toLocaleString();
	};

	// Calculate time remaining until expiry
	const calculateTimeRemaining = (expiryTime) => {
		if (!expiryTime) return 'Expires soon';

		// Handle Firestore timestamp objects
		const expiry = expiryTime.toDate
			? expiryTime.toDate()
			: new Date(expiryTime);

		// Check if date is valid
		if (isNaN(expiry.getTime())) return 'Expires soon';

		const now = new Date();
		const diffMs = expiry - now;

		// If already expired
		if (diffMs <= 0) return 'Expiring...';

		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffMinutes = Math.floor(
			(diffMs % (1000 * 60 * 60)) / (1000 * 60)
		);

		if (diffHours > 0) {
			return `Expires in ${diffHours}h ${diffMinutes}m`;
		} else {
			return `Expires in ${diffMinutes}m`;
		}
	};

	const handleDelete = async () => {
		try {
			await deleteDoc(doc(db, 'messages', message.id));
			if (onDelete) onDelete(message.id);
		} catch (error) {
			console.error('Error deleting message:', error);
		}
	};

	return (
		<div className='card bg-base-100 shadow-sm mb-3'>
			<div className='card-body p-4'>
				<div className='flex justify-between items-start mb-2'>
					<div className='font-bold'>
						{message.username || 'Anonymous'}
					</div>
					<div className='text-xs opacity-70'>
						{formatTimestamp(message.timestamp)}
					</div>
				</div>

				<p className='text-sm mb-2'>{message.content}</p>

				<div className='flex justify-between items-center text-xs opacity-70'>
					<div>{calculateTimeRemaining(message.expiresAt)}</div>

					{isOwner && (
						<button
							onClick={handleDelete}
							className='btn btn-xs btn-ghost text-error'
						>
							Delete
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
