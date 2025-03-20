'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';

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
	teamADetails,
	teamBDetails,
	onSelectWinner,
	disabled = false,
}) {
	const { gameId, teamA, teamB, userSelectedWinner } = game;

	// Handle cases where teamA or teamB might be empty
	const isReadyForSelection = teamA && teamB;

	const handleSelectWinner = (winner) => {
		if (disabled || !isReadyForSelection) return;
		onSelectWinner(gameId, winner);
	};

	return (
		<div className='card bg-base-100 shadow-sm'>
			<div className='card-body p-3 sm:p-4'>
				<div className='flex flex-col gap-2'>
					{/* Game identifier */}
					<div className='text-xs text-base-content/60'>
						Game #{gameId}
						{teamADetails.region && ` • ${teamADetails.region}`}
					</div>

					{/* Team A */}
					<button
						onClick={() => handleSelectWinner(teamA)}
						disabled={disabled || !isReadyForSelection}
						className={`btn btn-sm justify-start h-auto p-2 ${
							userSelectedWinner === teamA
								? 'btn-primary'
								: 'btn-ghost border border-base-300'
						} ${disabled ? 'opacity-70' : ''}`}
					>
						<div className='flex items-center justify-between w-full'>
							<div className='flex items-center gap-2'>
								{teamADetails.seed && (
									<span className='badge badge-sm'>
										{teamADetails.seed}
									</span>
								)}
								<span className='font-semibold'>
									{teamA || 'TBD'}
								</span>
							</div>
							{teamADetails.record && (
								<span className='text-xs opacity-70'>
									{teamADetails.record}
								</span>
							)}
						</div>
					</button>

					{/* VS divider */}
					<div className='text-xs text-center text-base-content/50 my-0'>
						vs
					</div>

					{/* Team B */}
					<button
						onClick={() => handleSelectWinner(teamB)}
						disabled={disabled || !isReadyForSelection}
						className={`btn btn-sm justify-start h-auto p-2 ${
							userSelectedWinner === teamB
								? 'btn-primary'
								: 'btn-ghost border border-base-300'
						} ${disabled ? 'opacity-70' : ''}`}
					>
						<div className='flex items-center justify-between w-full'>
							<div className='flex items-center gap-2'>
								{teamBDetails.seed && (
									<span className='badge badge-sm'>
										{teamBDetails.seed}
									</span>
								)}
								<span className='font-semibold'>
									{teamB || 'TBD'}
								</span>
							</div>
							{teamBDetails.record && (
								<span className='text-xs opacity-70'>
									{teamBDetails.record}
								</span>
							)}
						</div>
					</button>
				</div>

				{/* Selection indicator */}
				{userSelectedWinner && (
					<div className='text-xs text-center mt-2 text-primary-content bg-primary rounded-full py-1 px-2'>
						Selected: {userSelectedWinner}
					</div>
				)}
			</div>
		</div>
	);
}
