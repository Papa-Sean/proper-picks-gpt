'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function BracketComparisonSelector({
	tournamentId,
	onBracketSelect,
	currentBracketId = 'actual',
}) {
	const [brackets, setBrackets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchBrackets() {
			try {
				setLoading(true);

				// Fetch top brackets from Firestore
				const bracketsRef = collection(db, 'brackets');
				const q = query(
					bracketsRef,
					where('tournamentId', '==', tournamentId)
				);

				const querySnapshot = await getDocs(q);
				const bracketsList = [];

				querySnapshot.forEach((doc) => {
					const data = doc.data();
					bracketsList.push({
						id: doc.id,
						name: data.name || 'Unnamed Bracket',
						userName: data.userName || 'Anonymous User',
						points: data.points || 0,
					});
				});

				// Sort by points descending
				bracketsList.sort((a, b) => b.points - a.points);
				setBrackets(bracketsList);
			} catch (err) {
				console.error('Error fetching brackets:', err);
				setError('Failed to load brackets');
			} finally {
				setLoading(false);
			}
		}

		fetchBrackets();
	}, [tournamentId]);

	return (
		<div className='form-control w-full max-w-xs'>
			<label className='label'>
				<span className='label-text font-semibold'>
					Compare With Bracket
				</span>
			</label>
			<select
				className='select select-bordered w-full'
				value={currentBracketId}
				onChange={(e) => onBracketSelect(e.target.value)}
				disabled={loading}
			>
				<option value='actual'>Actual Results (Official)</option>
				{brackets.map((bracket) => (
					<option
						key={bracket.id}
						value={bracket.id}
					>
						{bracket.name} ({bracket.userName}) - {bracket.points}{' '}
						pts
					</option>
				))}
			</select>
			{loading && (
				<span className='text-xs mt-1'>Loading brackets...</span>
			)}
			{error && <span className='text-xs text-error mt-1'>{error}</span>}
		</div>
	);
}
