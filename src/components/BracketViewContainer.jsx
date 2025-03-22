'use client';

import { useMemo } from 'react';

/**
 * BracketViewContainer - Displays a full NCAA tournament bracket with 63 games in a traditional format
 *
 * @param {Object} props
 * @param {Array} props.games - Array of 63 game objects with team and result data
 * @param {Array} props.teams - Array of team details (optional)
 * @param {Object} props.bracketSelections - User's selections (optional)
 * @param {Function} props.onGameClick - Callback when a game is clicked (optional)
 * @param {boolean} props.isReadOnly - Whether the bracket is read-only (optional)
 */
export default function BracketViewContainer({
	games = [],
	teams = [],
	bracketSelections = {},
	actualResults = {},
	onGameClick,
	isReadOnly = true,
}) {
	// Organize games by round and region
	const organizedGames = useMemo(() => {
		// Create structure to hold games organized by round and region
		const result = {
			east: { 1: [], 2: [], 3: [], 4: [] },
			west: { 1: [], 2: [], 3: [], 4: [] },
			south: { 1: [], 2: [], 3: [], 4: [] },
			midwest: { 1: [], 2: [], 3: [], 4: [] },
			finalFour: [],
			championship: null,
		};

		if (!games?.length) return result;

		// Process all games and organize them
		games.forEach((game) => {
			if (!game) return;

			const region = game.region?.toLowerCase();
			const round =
				game.round || Math.ceil(Math.log2(64 / game.gameId + 1));

			if (round <= 4 && region) {
				// Rounds 1-4 are organized by region
				if (result[region] && result[region][round]) {
					result[region][round].push(game);
				}
			} else if (round === 5) {
				// Final Four
				result.finalFour.push(game);
			} else if (round === 6) {
				// Championship
				result.championship = game;
			}
		});

		return result;
	}, [games]);

	// Get seed for a team if available
	const getTeamSeed = (teamName) => {
		if (!teamName || !teams?.length) return '';
		const team = teams.find((t) => t.team === teamName);
		return team?.seed ? `(${team.seed})` : '';
	};

	// Get team details
	const getTeamDetails = (teamName) => {
		if (!teamName || !teams?.length) return null;
		return teams.find((t) => t.team === teamName) || null;
	};

	// Determine winner (if any) for a game
	const getGameWinner = (gameId, round) => {
		if (!gameId || !bracketSelections) return null;
		return bracketSelections[round]?.[gameId] || null;
	};

	// Render a game connector line (vertical line connecting games)
	const renderConnector = (index, type = 'vertical') => {
		if (type === 'vertical') {
			return (
				<div
					className='absolute right-0 w-[50%] border-t border-gray-300'
					style={{ top: '50%', transform: 'translateY(-50%)' }}
				/>
			);
		}
		return (
			<div className='absolute left-0 h-full border-l border-gray-300' />
		);
	};

	// Determine if a game should be disabled (placeholder or no teams set)
	const isGameDisabled = (game) => {
		if (!game) return true;
		if (!game.teamA && !game.teamB) return true;
		return false;
	};

	// Get round name for display
	const getRoundName = (roundNum) => {
		const names = [
			'First Round',
			'Second Round',
			'Sweet 16',
			'Elite Eight',
			'Final Four',
			'Championship',
		];
		return names[roundNum - 1] || `Round ${roundNum}`;
	};

	// Get region-specific styling
	const getRegionStyle = (region) => {
		switch (region?.toLowerCase()) {
			case 'east':
				return 'border-l-4 border-blue-500';
			case 'west':
				return 'border-l-4 border-red-500';
			case 'south':
				return 'border-l-4 border-green-500';
			case 'midwest':
				return 'border-l-4 border-yellow-500';
			default:
				return '';
		}
	};

	// Add this after your other helper functions
	const getGameResultStatus = (gameId, round, userSelection) => {
		// If no actual result or user didn't make a selection, return null
		if (!actualResults[round]?.[gameId] || !userSelection) {
			return null;
		}

		// Compare user selection with actual result
		const actualWinner = actualResults[round][gameId];

		if (userSelection === actualWinner) {
			return 'correct'; // Correct pick
		} else {
			return 'incorrect'; // Incorrect pick
		}
	};

	// Add this after your helper functions
	const getPointsForRound = (round) => {
		const pointsPerRound = [1, 2, 4, 8, 16, 32]; // Points for rounds 1-6
		return pointsPerRound[round - 1] || 0;
	};

	// Render a single game matchup
	// Modify the existing renderGame function
	const renderGame = (game, round, region) => {
		if (!game) return <div className='h-16 opacity-0'></div>;

		const teamADetails = getTeamDetails(game.teamA);
		const teamBDetails = getTeamDetails(game.teamB);
		const userSelection = getGameWinner(game.gameId, round);
		const resultStatus = getGameResultStatus(
			game.gameId,
			round,
			userSelection
		);
		const isDisabled = isGameDisabled(game);

		// For placeholder games that don't have teams yet
		if (!game.teamA || !game.teamB) {
			return (
				<div
					className={`
		  relative border border-gray-200 rounded p-1 h-16 flex flex-col justify-center
		  ${isReadOnly ? 'opacity-50' : 'opacity-80'} 
		  ${getRegionStyle(region)}
		`}
				>
					<div className='text-[10px] text-center text-gray-500'>
						Game {game.gameId}
					</div>
					<div className='text-xs text-center text-gray-500'>
						(Waiting for winners)
					</div>
				</div>
			);
		}

		// Set border color based on result status
		let resultStatusClasses = '';
		if (resultStatus === 'correct') {
			resultStatusClasses = 'border-success bg-success/10';
		} else if (resultStatus === 'incorrect') {
			resultStatusClasses = 'border-warning bg-warning/10';
		} else if (userSelection) {
			resultStatusClasses = 'border-primary bg-primary/10';
		} else {
			resultStatusClasses = 'border-gray-200';
		}

		return (
			<div
				className={`
		relative border rounded p-1 mb-1 cursor-pointer h-16 flex flex-col justify-between
		${isReadOnly ? '' : 'hover:shadow-md transition-shadow'} 
		${resultStatusClasses}
		${getRegionStyle(region)}
	  `}
				onClick={() =>
					onGameClick && onGameClick(game.gameId, round, region)
				}
			>
				<div className='flex justify-between items-center border-b pb-1'>
					<div
						className={`flex items-center text-xs ${
							userSelection === game.teamA
								? resultStatus === 'correct'
									? 'font-bold text-success'
									: resultStatus === 'incorrect'
									? 'font-bold text-warning line-through'
									: 'font-bold text-primary'
								: ''
						}`}
					>
						{teamADetails?.seed && (
							<span className='inline-block w-4 text-center mr-1 opacity-70'>
								{teamADetails.seed}
							</span>
						)}
						<span className='truncate max-w-[80px]'>
							{game.teamA}
						</span>
					</div>

					{/* Show actual winner indicator */}
					{actualResults[round]?.[game.gameId] === game.teamA && (
						<span className='badge badge-xs badge-success'>✓</span>
					)}
				</div>

				<div className='flex justify-between items-center pt-1'>
					<div
						className={`flex items-center text-xs ${
							userSelection === game.teamB
								? resultStatus === 'correct'
									? 'font-bold text-success'
									: resultStatus === 'incorrect'
									? 'font-bold text-warning line-through'
									: 'font-bold text-primary'
								: ''
						}`}
					>
						{teamBDetails?.seed && (
							<span className='inline-block w-4 text-center mr-1 opacity-70'>
								{teamBDetails.seed}
							</span>
						)}
						<span className='truncate max-w-[80px]'>
							{game.teamB}
						</span>
					</div>

					{/* Show actual winner indicator */}
					{actualResults[round]?.[game.gameId] === game.teamB && (
						<span className='badge badge-xs badge-success'>✓</span>
					)}
				</div>

				<div className='absolute -top-1 -right-1'>
					<span className='badge badge-xs badge-outline opacity-50'>
						{game.gameId}
					</span>
				</div>

				{/* Show points earned for correct pick */}
				{resultStatus === 'correct' && (
					<div className='absolute -bottom-1 -right-1'>
						<span className='badge badge-xs badge-success'>
							+{getPointsForRound(round)}
						</span>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className='w-full overflow-x-auto'>
			<div className='min-w-[1200px] p-2'>
				{/* Round headers */}
				<div className='grid grid-cols-9 gap-1 mb-2 text-center text-xs font-bold'>
					{/* Left side */}
					<div className='col-span-1'>
						<div className='text-blue-500'>East - Round 1</div>
					</div>
					<div className='col-span-1'>
						<div className='text-blue-500'>East - Round 2</div>
					</div>
					<div className='col-span-1'>
						<div className='text-blue-500'>East - Sweet 16</div>
					</div>
					<div className='col-span-1'>
						<div className='text-blue-500'>East - Elite Eight</div>
					</div>

					{/* Center */}
					<div className='col-span-1'>
						<div className='bg-base-200 py-1 rounded-t-lg'>
							Final Four
						</div>
					</div>

					{/* Right side */}
					<div className='col-span-1'>
						<div className='text-green-500'>
							South - Elite Eight
						</div>
					</div>
					<div className='col-span-1'>
						<div className='text-green-500'>South - Sweet 16</div>
					</div>
					<div className='col-span-1'>
						<div className='text-green-500'>South - Round 2</div>
					</div>
					<div className='col-span-1'>
						<div className='text-green-500'>South - Round 1</div>
					</div>
				</div>

				{/* Main Bracket Grid */}
				<div className='grid grid-cols-9 grid-rows-16 gap-1 relative'>
					{/* EAST REGION - LEFT SIDE (Rounds 1-4) */}
					{/* Round 1 - East */}
					<div className='col-span-1 row-span-16 grid grid-rows-16 gap-1'>
						{Array(8)
							.fill(null)
							.map((_, idx) => (
								<div
									key={`east-r1-${idx}`}
									className='row-span-2'
								>
									{renderGame(
										organizedGames.east[1][idx],
										1,
										'east'
									)}
								</div>
							))}
					</div>

					{/* Round 2 - East */}
					<div className='col-span-1 row-span-16 grid grid-rows-8 gap-1 mt-4'>
						{Array(4)
							.fill(null)
							.map((_, idx) => (
								<div
									key={`east-r2-${idx}`}
									className='row-span-2 relative'
								>
									{renderGame(
										organizedGames.east[2][idx],
										2,
										'east'
									)}
									{renderConnector(idx, 'horizontal')}
								</div>
							))}
					</div>

					{/* Round 3 - East (Sweet 16) */}
					<div className='col-span-1 row-span-16 grid grid-rows-4 gap-1 mt-8'>
						{Array(2)
							.fill(null)
							.map((_, idx) => (
								<div
									key={`east-r3-${idx}`}
									className='row-span-2 relative'
								>
									{renderGame(
										organizedGames.east[3][idx],
										3,
										'east'
									)}
									{renderConnector(idx, 'horizontal')}
								</div>
							))}
					</div>

					{/* Round 4 - East (Elite 8) */}
					<div className='col-span-1 row-span-16 grid grid-rows-2 gap-1 mt-16'>
						<div className='row-span-2 relative'>
							{renderGame(organizedGames.east[4][0], 4, 'east')}
							{renderConnector(0, 'horizontal')}
						</div>
					</div>

					{/* CENTER COLUMN (Final Four & Championship) */}
					<div className='col-span-1 row-span-16 flex flex-col justify-center items-center'>
						{/* Final Four */}
						<div className='w-full mb-4'>
							{renderGame(organizedGames.finalFour[0], 5)}
						</div>

						{/* Championship */}
						<div className='w-full bg-base-200 p-2 rounded-lg border-2 border-primary mt-4 mb-4'>
							{renderGame(organizedGames.championship, 6)}
							<div className='text-center mt-2 font-bold text-xs'>
								Championship
							</div>
						</div>

						{/* Final Four (second game) */}
						<div className='w-full mt-4'>
							{renderGame(organizedGames.finalFour[1], 5)}
						</div>
					</div>

					{/* SOUTH REGION - RIGHT SIDE (Rounds 4-1 in reverse order) */}
					{/* Round 4 - South (Elite 8) */}
					<div className='col-span-1 row-span-16 grid grid-rows-2 gap-1 mt-16'>
						<div className='row-span-2 relative'>
							{renderGame(organizedGames.south[4][0], 4, 'south')}
							{renderConnector(0, 'horizontal')}
						</div>
					</div>

					{/* Round 3 - South (Sweet 16) */}
					<div className='col-span-1 row-span-16 grid grid-rows-4 gap-1 mt-8'>
						{Array(2)
							.fill(null)
							.map((_, idx) => (
								<div
									key={`south-r3-${idx}`}
									className='row-span-2 relative'
								>
									{renderGame(
										organizedGames.south[3][idx],
										3,
										'south'
									)}
									{renderConnector(idx, 'horizontal')}
								</div>
							))}
					</div>

					{/* Round 2 - South */}
					<div className='col-span-1 row-span-16 grid grid-rows-8 gap-1 mt-4'>
						{Array(4)
							.fill(null)
							.map((_, idx) => (
								<div
									key={`south-r2-${idx}`}
									className='row-span-2 relative'
								>
									{renderGame(
										organizedGames.south[2][idx],
										2,
										'south'
									)}
									{renderConnector(idx, 'horizontal')}
								</div>
							))}
					</div>

					{/* Round 1 - South */}
					<div className='col-span-1 row-span-16 grid grid-rows-16 gap-1'>
						{Array(8)
							.fill(null)
							.map((_, idx) => (
								<div
									key={`south-r1-${idx}`}
									className='row-span-2'
								>
									{renderGame(
										organizedGames.south[1][idx],
										1,
										'south'
									)}
								</div>
							))}
					</div>
				</div>

				{/* West and Midwest Regions (Lower Half) */}
				<div className='mt-8'>
					{/* Round headers */}
					<div className='grid grid-cols-9 gap-1 mb-2 text-center text-xs font-bold'>
						{/* Left side - West */}
						<div className='col-span-1'>
							<div className='text-red-500'>West - Round 1</div>
						</div>
						<div className='col-span-1'>
							<div className='text-red-500'>West - Round 2</div>
						</div>
						<div className='col-span-1'>
							<div className='text-red-500'>West - Sweet 16</div>
						</div>
						<div className='col-span-1'>
							<div className='text-red-500'>
								West - Elite Eight
							</div>
						</div>

						{/* Center - Empty space to align */}
						<div className='col-span-1'>
							<div className='opacity-0'>Spacer</div>
						</div>

						{/* Right side - Midwest */}
						<div className='col-span-1'>
							<div className='text-yellow-500'>
								Midwest - Elite Eight
							</div>
						</div>
						<div className='col-span-1'>
							<div className='text-yellow-500'>
								Midwest - Sweet 16
							</div>
						</div>
						<div className='col-span-1'>
							<div className='text-yellow-500'>
								Midwest - Round 2
							</div>
						</div>
						<div className='col-span-1'>
							<div className='text-yellow-500'>
								Midwest - Round 1
							</div>
						</div>
					</div>

					{/* Bracket Grid for West and Midwest */}
					<div className='grid grid-cols-9 grid-rows-16 gap-1'>
						{/* WEST REGION - LEFT SIDE (Rounds 1-4) */}
						{/* Round 1 - West */}
						<div className='col-span-1 row-span-16 grid grid-rows-16 gap-1'>
							{Array(8)
								.fill(null)
								.map((_, idx) => (
									<div
										key={`west-r1-${idx}`}
										className='row-span-2'
									>
										{renderGame(
											organizedGames.west[1][idx],
											1,
											'west'
										)}
									</div>
								))}
						</div>

						{/* Round 2 - West */}
						<div className='col-span-1 row-span-16 grid grid-rows-8 gap-1 mt-4'>
							{Array(4)
								.fill(null)
								.map((_, idx) => (
									<div
										key={`west-r2-${idx}`}
										className='row-span-2 relative'
									>
										{renderGame(
											organizedGames.west[2][idx],
											2,
											'west'
										)}
										{renderConnector(idx, 'horizontal')}
									</div>
								))}
						</div>

						{/* Round 3 - West (Sweet 16) */}
						<div className='col-span-1 row-span-16 grid grid-rows-4 gap-1 mt-8'>
							{Array(2)
								.fill(null)
								.map((_, idx) => (
									<div
										key={`west-r3-${idx}`}
										className='row-span-2 relative'
									>
										{renderGame(
											organizedGames.west[3][idx],
											3,
											'west'
										)}
										{renderConnector(idx, 'horizontal')}
									</div>
								))}
						</div>

						{/* Round 4 - West (Elite 8) */}
						<div className='col-span-1 row-span-16 grid grid-rows-2 gap-1 mt-16'>
							<div className='row-span-2 relative'>
								{renderGame(
									organizedGames.west[4][0],
									4,
									'west'
								)}
								{renderConnector(0, 'horizontal')}
							</div>
						</div>

						{/* Center column - Empty space */}
						<div className='col-span-1 row-span-16'></div>

						{/* MIDWEST REGION - RIGHT SIDE (Rounds 4-1 in reverse order) */}
						{/* Round 4 - Midwest (Elite 8) */}
						<div className='col-span-1 row-span-16 grid grid-rows-2 gap-1 mt-16'>
							<div className='row-span-2 relative'>
								{renderGame(
									organizedGames.midwest[4][0],
									4,
									'midwest'
								)}
								{renderConnector(0, 'horizontal')}
							</div>
						</div>

						{/* Round 3 - Midwest (Sweet 16) */}
						<div className='col-span-1 row-span-16 grid grid-rows-4 gap-1 mt-8'>
							{Array(2)
								.fill(null)
								.map((_, idx) => (
									<div
										key={`midwest-r3-${idx}`}
										className='row-span-2 relative'
									>
										{renderGame(
											organizedGames.midwest[3][idx],
											3,
											'midwest'
										)}
										{renderConnector(idx, 'horizontal')}
									</div>
								))}
						</div>

						{/* Round 2 - Midwest */}
						<div className='col-span-1 row-span-16 grid grid-rows-8 gap-1 mt-4'>
							{Array(4)
								.fill(null)
								.map((_, idx) => (
									<div
										key={`midwest-r2-${idx}`}
										className='row-span-2 relative'
									>
										{renderGame(
											organizedGames.midwest[2][idx],
											2,
											'midwest'
										)}
										{renderConnector(idx, 'horizontal')}
									</div>
								))}
						</div>

						{/* Round 1 - Midwest */}
						<div className='col-span-1 row-span-16 grid grid-rows-16 gap-1'>
							{Array(8)
								.fill(null)
								.map((_, idx) => (
									<div
										key={`midwest-r1-${idx}`}
										className='row-span-2'
									>
										{renderGame(
											organizedGames.midwest[1][idx],
											1,
											'midwest'
										)}
									</div>
								))}
						</div>
					</div>
				</div>

				{/* Legend */}
				<div className='flex justify-center items-center mt-4 gap-6 text-xs'>
					<div className='flex items-center'>
						<div className='w-3 h-3 border-l-4 border-blue-500 mr-2'></div>
						<span>East Region</span>
					</div>
					<div className='flex items-center'>
						<div className='w-3 h-3 border-l-4 border-red-500 mr-2'></div>
						<span>West Region</span>
					</div>
					<div className='flex items-center'>
						<div className='w-3 h-3 border-l-4 border-green-500 mr-2'></div>
						<span>South Region</span>
					</div>
					<div className='flex items-center'>
						<div className='w-3 h-3 border-l-4 border-yellow-500 mr-2'></div>
						<span>Midwest Region</span>
					</div>
					{/* Scoring legend */}
					<div className='flex items-center ml-6'>
						<div className='w-3 h-3 bg-success/20 border border-success mr-2'></div>
						<span>Correct Pick</span>
					</div>
					<div className='flex items-center'>
						<div className='w-3 h-3 bg-warning/20 border border-warning mr-2'></div>
						<span>Incorrect Pick</span>
					</div>
					<div className='flex items-center'>
						<div className='w-3 h-3 bg-primary/20 border border-primary mr-2'></div>
						<span>Your Selection</span>
					</div>
				</div>
			</div>
		</div>
	);
}
