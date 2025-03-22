import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
	collection,
	query,
	where,
	orderBy,
	limit,
	getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export function useUserBracket(tournamentId = 'ncaa-2025') {
	const { user } = useAuth();
	const [bracketId, setBracketId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchUserBracket() {
			if (!user?.uid) {
				setLoading(false);
				return;
			}

			try {
				// Query for the user's most recent bracket for this tournament
				const bracketsRef = collection(db, 'brackets');
				const q = query(
					bracketsRef,
					where('userId', '==', user.uid),
					where('tournamentId', '==', tournamentId),
					orderBy('createdAt', 'desc'),
					limit(1)
				);

				const querySnapshot = await getDocs(q);

				if (!querySnapshot.empty) {
					// Get the user's bracket ID
					const bracketDoc = querySnapshot.docs[0];
					setBracketId(bracketDoc.id);
				}
			} catch (err) {
				console.error('Error fetching user bracket:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchUserBracket();
	}, [user, tournamentId]);

	return { bracketId, loading, error };
}
