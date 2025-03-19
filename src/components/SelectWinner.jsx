'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * SelectWinner - A component for selecting the winner of a tournament game
 *
 * @param {Object} props
 * @param {Object} props.game - Game object containing teams and winner info
 * @param {Function} props.onSelectWinner - Callback when winner is selected
 * @param {Object} props.teamADetails - Details for teamA including seed and record
 * @param {Object} props.teamBDetails - Details for teamB including seed and record
 * @param {boolean} props.disabled - Whether selection is disabled
 */
export default function SelectWinner({
	game,
	onSelectWinner,
	teamADetails = {},
	teamBDetails = {},
	disabled = false,
}) {
	const { teamA, teamB, userSelectedWinner, gameId } = game;
	const [selectedWinner, setSelectedWinner] = useState(
		userSelectedWinner || ''
	);

	// Update local state if prop changes
	useEffect(() => {
		if (userSelectedWinner !== selectedWinner) {
			setSelectedWinner(userSelectedWinner || '');
		}
	}, [userSelectedWinner]);

	const handleSelectionChange = (team) => {
		if (disabled) return;

		setSelectedWinner(team);
		// Auto-submit selection to parent
		if (onSelectWinner) {
			onSelectWinner(gameId, team);
		}
	};

	// Check if teams are placeholders (e.g., "Winner of Game X")
	const isTeamAPlaceholder =
		typeof teamA === 'string' && teamA.includes('Winner of Game');
	const isTeamBPlaceholder =
		typeof teamB === 'string' && teamB.includes('Winner of Game');

	return (
		<div className='card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow'>
			<div className='card-body p-4'>
				<h3 className='text-sm font-semibold text-center mb-3'>
					Game {gameId}
				</h3>

				<div className='space-y-3'>
					{/* Team A Option */}
					<label
						className={`flex items-center p-3 rounded-lg border-2 transition-all 
              ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} 
              ${
					selectedWinner === teamA
						? 'border-primary bg-primary bg-opacity-10'
						: 'border-base-200 hover:border-base-300'
				}`}
					>
						<input
							type='radio'
							name={`winner-${gameId}`}
							value={teamA}
							checked={selectedWinner === teamA}
							onChange={() => handleSelectionChange(teamA)}
							className='radio radio-primary radio-sm mr-2'
							disabled={disabled}
						/>
						<div className='flex-1'>
							<div className='font-medium flex items-center'>
								{teamADetails.seed && (
									<span className='badge badge-sm mr-2'>
										#{teamADetails.seed}
									</span>
								)}
								<span>{teamA}</span>
							</div>

							{teamADetails.record && (
								<div className='text-xs opacity-70 mt-1'>
									{teamADetails.record}
								</div>
							)}
						</div>
					</label>

					{/* Team B Option */}
					<label
						className={`flex items-center p-3 rounded-lg border-2 transition-all 
              ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} 
              ${
					selectedWinner === teamB
						? 'border-primary bg-primary bg-opacity-10'
						: 'border-base-200 hover:border-base-300'
				}`}
					>
						<input
							type='radio'
							name={`winner-${gameId}`}
							value={teamB}
							checked={selectedWinner === teamB}
							onChange={() => handleSelectionChange(teamB)}
							className='radio radio-primary radio-sm mr-2'
							disabled={disabled}
						/>
						<div className='flex-1'>
							<div className='font-medium flex items-center'>
								{teamBDetails.seed && (
									<span className='badge badge-sm mr-2'>
										#{teamBDetails.seed}
									</span>
								)}
								<span>{teamB}</span>
							</div>

							{teamBDetails.record && (
								<div className='text-xs opacity-70 mt-1'>
									{teamBDetails.record}
								</div>
							)}
						</div>
					</label>
				</div>
			</div>
		</div>
	);
}
