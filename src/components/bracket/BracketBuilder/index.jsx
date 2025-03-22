'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
	doc,
	setDoc,
	collection,
	deleteDoc,
	getDocs,
	query,
	where,
	serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Import hooks for data
import { useTournamentData } from '@/hooks/useTournamentData';
import { useBracketSelection } from '@/hooks/useBracketSelection';

// Import subcomponents
import TournamentHeader from './TournamentHeader';
import ProgressTracker from './ProgressTracker';
import BracketPreview from './BracketPreview';
import RoundSelector from './RoundSelector';
import BracketNamingForm from './BracketNamingForm';

export default function BracketBuilder() {
	const router = useRouter();
	const { user } = useSelector((state) => state.auth);
	// This hook handles tournament data loading
	const { tournament, loading, error, isDeadlinePassed } = useTournamentData(
		user?.uid
	);

	const [currentStep, setCurrentStep] = useState(1);
	const [showStepModal, setShowStepModal] = useState(false);
	const [showPreviewModal, setShowPreviewModal] = useState(false); // New state for preview modal
	const [bracketName, setBracketName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize bracket selection state after tournament data loads
	const {
		gamesByRound,
		bracketSelections,
		handleSelectWinner,
		getRoundCompletion,
		prepareDataForBracketView,
		isRoundComplete,
	} = useBracketSelection(tournament?.rounds);

	// Auto-open the first step modal when data is loaded
	useEffect(() => {
		if (tournament && !loading && !error && user) {
			setShowStepModal(true);
		}
	}, [tournament, loading, error, user]);

	// Get team details (seed, record) for a team
	const getTeamDetails = useCallback(
		(teamName) => {
			if (!tournament) return {};

			const team = tournament.teams.find((t) => t.team === teamName);
			return team
				? {
						seed: team.seed,
						record: team.record,
						region: team.region,
				  }
				: {};
		},
		[tournament]
	);

	// Handle bracket game click from the preview
	const handleBracketGameClick = useCallback((gameId, round) => {
		setCurrentStep(round);
		setShowPreviewModal(false); // Close preview modal
		setShowStepModal(true); // Open step modal
	}, []);

	// Move to next step/round
	const handleNextStep = useCallback(() => {
		if (currentStep < 6) {
			setCurrentStep((prev) => prev + 1);
		} else {
			// Final step - hide modal to show submission form
			setShowStepModal(false);
		}
	}, [currentStep]);

	// Move to previous step/round
	const handlePrevStep = useCallback(() => {
		if (currentStep > 1) {
			setCurrentStep((prev) => prev - 1);
		}
	}, [currentStep]);

	// Calculate completion percentage for all rounds
	const getTotalCompletion = useCallback(() => {
		let totalCompleted = 0;
		let totalRequired = 0;

		for (let round = 1; round <= 6; round++) {
			const { completed, total } = getRoundCompletion(round);
			totalCompleted += completed;
			totalRequired += total;
		}

		return {
			percent: totalRequired
				? Math.round((totalCompleted / totalRequired) * 100)
				: 0,
			completed: totalCompleted,
			total: totalRequired,
		};
	}, [getRoundCompletion]);

	// Handle bracket submission
	const handleSubmit = useCallback(async () => {
		if (!bracketName.trim()) {
			alert('Please enter a bracket name');
			return;
		}

		if (!user || !user.uid) {
			alert('You must be logged in to save a bracket');
			router.push('/login?redirect=/brackets/create');
			return;
		}

		setIsSubmitting(true);

		try {
			// Check for existing brackets
			const bracketsRef = collection(db, 'brackets');
			const q = query(
				bracketsRef,
				where('userId', '==', user.uid),
				where('tournamentId', '==', tournament.id)
			);

			const existingBrackets = await getDocs(q);

			if (!existingBrackets.empty) {
				if (
					confirm(
						'You already have a bracket for this tournament. Submitting a new one will replace your existing bracket. Continue?'
					)
				) {
					const existingBracketId = existingBrackets.docs[0].id;
					await deleteDoc(doc(db, 'brackets', existingBracketId));
				} else {
					setIsSubmitting(false);
					return;
				}
			}

			// Clean up data for submission
			const cleanSelections = {};
			Object.keys(bracketSelections).forEach((round) => {
				cleanSelections[round] = {};
				Object.entries(bracketSelections[round]).forEach(
					([gameId, winner]) => {
						if (winner) cleanSelections[round][gameId] = winner;
					}
				);
			});

			// Prepare bracket data
			const bracketData = {
				name: bracketName,
				userId: user.uid,
				userName: user.displayName || 'Anonymous User',
				tournamentId: tournament.id,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				selections: cleanSelections,
				rounds: gamesByRound,
				points: 0,
				maxPossible: 192,
				correctPicks: 0,
				totalPicks: 0,
			};

			// Save to Firestore
			const bracketRef = doc(collection(db, 'brackets'));
			const bracketId = bracketRef.id;

			await setDoc(bracketRef, {
				...bracketData,
				id: bracketId,
			});

			alert('Your bracket has been saved successfully!');
			router.push(`/brackets/view/bracketview?id=${bracketId}`);
		} catch (err) {
			console.error('Error submitting bracket:', err);
			alert(
				`Failed to submit bracket: ${err.message || 'Unknown error'}`
			);
		} finally {
			setIsSubmitting(false);
		}
	}, [
		bracketName,
		user,
		router,
		tournament,
		bracketSelections,
		gamesByRound,
	]);

	// Loading and error states
	if (loading) {
		return (
			<div className='flex justify-center p-12'>
				<div className='loading loading-spinner loading-lg'></div>
			</div>
		);
	}

	if (error) {
		return (
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
		);
	}

	const totalCompletion = getTotalCompletion();

	return (
		<>
			<TournamentHeader
				tournament={tournament}
				isDeadlinePassed={isDeadlinePassed}
			/>

			{!isDeadlinePassed ? (
				// Show bracket builder content when deadline has not passed
				<div className='space-y-8'>
					{/* Progress tracker - shows completion of each round */}
					<ProgressTracker
						gamesByRound={gamesByRound}
						bracketSelections={bracketSelections}
						currentStep={currentStep}
						onStepChange={setCurrentStep}
						onContinueBuilding={() => setShowStepModal(true)}
					/>

					{/* Preview bracket button */}
					<div className='card bg-base-100 shadow-md border border-base-300'>
						<div className='card-body p-4'>
							<div className='flex justify-between items-center'>
								<div>
									<h3 className='card-title text-lg'>
										Bracket Status
									</h3>
									<p className='text-sm text-base-content/70 mt-1'>
										Your bracket is{' '}
										{totalCompletion.percent}% complete (
										{totalCompletion.completed}/
										{totalCompletion.total} selections made)
									</p>
								</div>
								<button
									className='btn btn-primary'
									onClick={() => setShowPreviewModal(true)}
								>
									Preview Full Bracket
								</button>
							</div>

							<div className='mt-4'>
								<progress
									className='progress progress-primary w-full'
									value={totalCompletion.completed}
									max={totalCompletion.total}
								></progress>
							</div>
						</div>
					</div>

					{/* Bracket naming and submission form */}
					<BracketNamingForm
						bracketName={bracketName}
						setBracketName={setBracketName}
						onSubmit={handleSubmit}
						onBack={() => setShowStepModal(true)}
						isSubmitting={isSubmitting}
						completionPercent={totalCompletion.percent}
					/>

					{/* Modal for step-by-step bracket building */}
					<dialog
						className={`modal ${showStepModal ? 'modal-open' : ''}`}
					>
						<div className='modal-box w-11/12 max-w-4xl p-4 sm:p-6'>
							<h2 className='text-xl font-bold mb-2'>
								{tournament?.name} - Build Your Bracket
							</h2>
							<div className='divider my-2'></div>

							{/* Round selector component for building brackets */}
							<RoundSelector
								currentStep={currentStep}
								games={gamesByRound[currentStep] || []}
								bracketSelections={bracketSelections}
								onSelectWinner={handleSelectWinner}
								getTeamDetails={getTeamDetails}
								getRoundCompletion={getRoundCompletion}
								onPrevStep={handlePrevStep}
								onNextStep={handleNextStep}
								onStepChange={setCurrentStep}
								isRoundComplete={isRoundComplete}
							/>

							<button
								className='btn btn-sm btn-circle absolute right-2 top-2'
								onClick={() => setShowStepModal(false)}
							>
								✕
							</button>
						</div>

						{/* Modal backdrop */}
						<form
							method='dialog'
							className='modal-backdrop'
						>
							<button onClick={() => setShowStepModal(false)}>
								close
							</button>
						</form>
					</dialog>

					{/* Modal for bracket preview */}
					<dialog
						className={`modal ${
							showPreviewModal ? 'modal-open' : ''
						}`}
					>
						<div className='modal-box w-11/12 max-w-7xl p-4 sm:p-6'>
							<h2 className='text-xl font-bold mb-2'>
								{tournament?.name} - Bracket Preview
							</h2>
							<div className='divider my-2'></div>

							<BracketPreview
								bracketData={prepareDataForBracketView()}
								teams={tournament?.teams || []}
								bracketSelections={bracketSelections}
								onGameClick={handleBracketGameClick}
								onContinueBuilding={() => {
									setShowPreviewModal(false);
									setShowStepModal(true);
								}}
							/>

							<div className='mt-4 flex justify-end'>
								<button
									className='btn btn-primary'
									onClick={() => setShowPreviewModal(false)}
								>
									Close Preview
								</button>
							</div>

							<button
								className='btn btn-sm btn-circle absolute right-2 top-2'
								onClick={() => setShowPreviewModal(false)}
							>
								✕
							</button>
						</div>

						{/* Modal backdrop */}
						<form
							method='dialog'
							className='modal-backdrop'
						>
							<button onClick={() => setShowPreviewModal(false)}>
								close
							</button>
						</form>
					</dialog>
				</div>
			) : (
				// When deadline has passed, show a message
				<div className='alert alert-warning mb-6 shadow-md'>
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
							d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
						/>
					</svg>
					<div>
						<h3 className='font-bold'>
							Submission Deadline Passed
						</h3>
						<div className='text-sm'>
							The deadline for submitting brackets has passed. You
							can still view existing brackets on the leaderboard.
						</div>
					</div>
					<div>
						<button
							className='btn btn-sm btn-outline'
							onClick={() => router.push('/brackets/leaderboard')}
						>
							View Leaderboard
						</button>
					</div>
				</div>
			)}
		</>
	);
}
