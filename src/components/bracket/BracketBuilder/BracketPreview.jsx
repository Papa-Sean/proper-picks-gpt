'use client';

import { useState } from 'react';
import BracketViewContainer from '@/components/bracket/BracketViewContainer';

export default function BracketPreview({
	bracketData = {},
	teams = [],
	bracketSelections = {},
	onGameClick,
	onContinueBuilding,
}) {
	console.log('BracketPreview received data:', {
		rounds: Object.keys(bracketData).length,
		teams: teams.length,
		selectionCount: Object.keys(bracketSelections).reduce(
			(count, round) => {
				return (
					count + Object.keys(bracketSelections[round] || {}).length
				);
			},
			0
		),
	});

	return (
		<div className='card bg-base-100 shadow-md border border-base-300'>
			<div className='card-body p-4'>
				<div className='flex justify-between items-center mb-4'>
					<h3 className='card-title text-lg'>Bracket Preview</h3>
					<button
						className='btn btn-primary btn-sm'
						onClick={onContinueBuilding}
					>
						Continue Building
					</button>
				</div>

				<BracketViewContainer
					games={Object.values(bracketData).flat()}
					teams={teams}
					bracketSelections={bracketSelections}
					onGameClick={onGameClick}
					isReadOnly={false}
				/>
			</div>
		</div>
	);
}
