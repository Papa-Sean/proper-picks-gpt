'use client';

import React from 'react';
import { useRef } from 'react';

/**
 * TournamentRoundContainer - Displays games for a specific round in a tournament bracket
 *
 * @param {Object} props
 * @param {string} props.tournamentRound - The name/number of the round (e.g., "Round 1", "Sweet 16", "Final")
 * @param {Array} props.games - Array of game objects for this round
 * @param {Array} props.teams - Array of all teams in the tournament
 * @param {Function} props.onAdvanceTeam - Optional callback when a team is advanced to next round
 * @param {boolean} props.isActive - Whether this round is currently active
 * @param {string} props.region - Optional region name for styling
 */
export default function TournamentRoundContainer({
	tournamentRound = 'Tournament Round',
	games = [],
	teams = [],
	onAdvanceTeam,
	isActive = true,
	region = '', // Add this new prop
}) {
	const containerRef = useRef(null);

	// Find team details from the teams array
	const getTeamDetails = (teamId) => {
		return (
			teams.find(
				(team) => team.id === teamId || team.team === teamId
			) || { team: teamId, seed: '?' }
		);
	};

	// Handle click on a team to advance it
	const handleTeamClick = (game, team) => {
		if (onAdvanceTeam && isActive) {
			onAdvanceTeam(game, team);
		}
	};

	// Add region-specific classes to the card based on region
	const getRegionClass = (region) => {
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

	// If no specific content is provided, show a tournament structure preview
	if (!games.length && !tournamentRound) {
		return (
			<div className='mb-6'>
				<div className='bg-secondary bg-opacity-10 border border-secondary rounded-lg p-4 text-center'>
					<h3 className='font-bold text-secondary mb-2'>
						Tournament Structure Preview
					</h3>
					<p className='text-sm'>
						Your selected teams will be arranged in a tournament
						bracket based on their seeds. The number of rounds will
						depend on the number of teams selected.
					</p>
					<div className='grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4'>
						<div className='bg-base-100 rounded p-2 border border-base-300 text-center'>
							<p className='text-xs text-base-content opacity-70'>
								Round 1
							</p>
						</div>
						<div className='bg-base-100 rounded p-2 border border-base-300 text-center'>
							<p className='text-xs text-base-content opacity-70'>
								Sweet 16
							</p>
						</div>
						<div className='bg-base-100 rounded p-2 border border-base-300 text-center'>
							<p className='text-xs text-base-content opacity-70'>
								Elite 8
							</p>
						</div>
						<div className='bg-base-100 rounded p-2 border border-base-300 text-center'>
							<p className='text-xs text-base-content opacity-70'>
								Final 4
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='flex-1 flex flex-col mb-6'>
			{/* Round title */}
			<div className='text-center mb-4'>
				<div className='bg-secondary text-secondary-content py-2 px-4 rounded-lg inline-block shadow'>
					<h3 className='font-bold'>{tournamentRound}</h3>
				</div>
			</div>

			{/* Games container */}
			<div
				ref={containerRef}
				className={`flex-1 flex flex-col gap-4 ${
					isActive ? 'opacity-100' : 'opacity-70'
				}`}
			>
				{games.map((game, index) => (
					<div
						key={`${tournamentRound}-game-${index}`}
						className='relative'
					>
						{/* Game card */}
						<div
							className={`card bg-base-100 shadow-md border ${
								isActive
									? 'border-secondary'
									: 'border-base-200'
							} ${getRegionClass(region)}`}
						>
							<div className='card-body p-4'>
								<div className='flex justify-between items-center mb-1'>
									<span className='text-sm font-semibold opacity-70'>
										Game {game.gameNumber || index + 1}
									</span>
									{game.time && (
										<span className='badge badge-ghost badge-sm'>
											{game.time}
										</span>
									)}
								</div>

								{/* Team 1 */}
								<div
									onClick={() =>
										handleTeamClick(game, game.team1)
									}
									className={`flex items-center p-2 rounded-md mb-2 ${
										isActive
											? 'cursor-pointer hover:bg-base-200'
											: ''
									} ${
										game.winner === game.team1
											? 'bg-success bg-opacity-20 border-l-4 border-success'
											: ''
									}`}
								>
									{game.team1 ? (
										<>
											<div className='flex items-center flex-1'>
												<span className='badge badge-sm mr-2'>
													#
													{
														getTeamDetails(
															game.team1
														).seed
													}
												</span>
												<span className='font-medium'>
													{
														getTeamDetails(
															game.team1
														).team
													}
												</span>
											</div>
											{game.score1 !== undefined && (
												<span className='text-lg font-bold'>
													{game.score1}
												</span>
											)}
										</>
									) : (
										<div className='flex-1 text-center text-base-content opacity-50'>
											TBD
										</div>
									)}
								</div>

								{/* Team 2 */}
								<div
									onClick={() =>
										handleTeamClick(game, game.team2)
									}
									className={`flex items-center p-2 rounded-md ${
										isActive
											? 'cursor-pointer hover:bg-base-200'
											: ''
									} ${
										game.winner === game.team2
											? 'bg-success bg-opacity-20 border-l-4 border-success'
											: ''
									}`}
								>
									{game.team2 ? (
										<>
											<div className='flex items-center flex-1'>
												<span className='badge badge-sm mr-2'>
													#
													{
														getTeamDetails(
															game.team2
														).seed
													}
												</span>
												<span className='font-medium'>
													{
														getTeamDetails(
															game.team2
														).team
													}
												</span>
											</div>
											{game.score2 !== undefined && (
												<span className='text-lg font-bold'>
													{game.score2}
												</span>
											)}
										</>
									) : (
										<div className='flex-1 text-center text-base-content opacity-50'>
											TBD
										</div>
									)}
								</div>

								{/* Game location/venue information */}
								{game.location && (
									<div className='text-xs text-center mt-2 opacity-70'>
										{game.location}
									</div>
								)}
							</div>
						</div>
					</div>
				))}

				{/* Empty state when games are expected but none provided */}
				{games && games.length === 0 && tournamentRound && (
					<div className='flex-1 flex items-center justify-center'>
						<div className='bg-base-200 p-8 rounded-lg text-center'>
							<p className='text-base-content opacity-70'>
								No games scheduled for this round yet
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
