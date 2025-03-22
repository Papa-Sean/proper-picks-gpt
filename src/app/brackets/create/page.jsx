'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSelector } from 'react-redux';
import CreateBracketContainer from '@/components/CreateBracketContainer';
import BracketBuilder from '@/components/bracket/BracketBuilder';
import dummyTeams from '@/dummyTeams';

// Firestore imports
import {
	doc,
	collection,
	getDoc,
	getDocs,
	query,
	where,
	orderBy,
	limit,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function CreateBracketPage() {
	const { isAuthenticated, user } = useSelector((state) => state.auth);
	const { isLoading } = useAuth();
	const router = useRouter();
	const [tournament, setTournament] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Load tournament data only if authenticated
	useEffect(() => {
		if (isAuthenticated === true) {
			fetchTournament();
		}
	}, [isAuthenticated]);

	const fetchTournament = async () => {
		try {
			setLoading(true);

			// Mock data
			const mockTournament = {
				id: 'ncaa-2025',
				name: 'Proper March Madness 2025',
				submissionDeadline: new Date(2025, 3, 22, 12).toISOString(),
				teams: dummyTeams,
				rounds: generateAllRoundsGames(dummyTeams),
				roundNames: [
					'First Round',
					'Second Round',
					'Sweet 16',
					'Elite Eight',
					'Final Four',
					'Championship',
				],
			};

			setTournament(mockTournament);
			setLoading(false);
		} catch (err) {
			console.error('Error fetching tournament data:', err);
			setError(
				'Failed to load tournament data: ' +
					(err.message || 'Unknown error')
			);
			setLoading(false);
		}
	};

	// Generate NCAA tournament structure with all rounds
	function generateAllRoundsGames(teams) {
		const rounds = {};

		// First round - 32 games (64 teams)
		rounds[1] = [];

		// Create matchups based on seeding
		const regions = ['East', 'West', 'South', 'Midwest'];
		const seedMatchups = [
			[1, 16],
			[8, 9],
			[5, 12],
			[4, 13],
			[6, 11],
			[3, 14],
			[7, 10],
			[2, 15],
		];

		let gameId = 1; // Start with 1 and increment for each game

		// Generate first round matchups
		regions.forEach((region) => {
			seedMatchups.forEach(([seedA, seedB]) => {
				const teamA = teams.find(
					(t) => t.region === region && t.seed === seedA
				);
				const teamB = teams.find(
					(t) => t.region === region && t.seed === seedB
				);

				if (teamA && teamB) {
					rounds[1].push({
						gameId, // Ensure this is unique
						teamA: teamA.team,
						teamB: teamB.team,
						userSelectedWinner: '',
						region,
						round: 1,
					});
					gameId++; // Increment for uniqueness
				}
			});
		});

		// Initialize empty subsequent rounds (2-6)
		for (let round = 2; round <= 6; round++) {
			rounds[round] = [];

			// Calculate number of games in this round
			const numGames = Math.pow(2, 6 - round);

			for (let i = 0; i < numGames; i++) {
				rounds[round].push({
					gameId: gameId++, // Ensure this is unique
					teamA: '',
					teamB: '',
					userSelectedWinner: '',
					round,
					// Add region if appropriate (rounds 2-4)
					region:
						round <= 4
							? regions[Math.floor(i / (numGames / 4))]
							: undefined,
				});
			}
		}

		return rounds;
	}

	if (loading) {
		return (
			<CreateBracketContainer title='Loading Tournament...'>
				<div className='flex justify-center p-12'>
					<div className='loading loading-spinner loading-lg'></div>
				</div>
			</CreateBracketContainer>
		);
	}

	if (error) {
		return (
			<CreateBracketContainer title='Error'>
				<div className='alert alert-error'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='stroke-current shrink-0 h-6 w-6'
						fill='none'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
						/>
					</svg>
					<span>{error}</span>
				</div>
			</CreateBracketContainer>
		);
	}

	return (
		<CreateBracketContainer title='Create Tournament Bracket'>
			{/* The BracketBuilder component now handles all the UI and logic for creating a bracket */}
			<BracketBuilder />
		</CreateBracketContainer>
	);
}
