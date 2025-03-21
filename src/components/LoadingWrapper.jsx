'use client';

import { useState, useEffect } from 'react';

export default function LoadingWrapper({ children, minLoadTime = 8000 }) {
	const [loading, setLoading] = useState(true);
	const [animationStage, setAnimationStage] = useState(0);
	const [countdown, setCountdown] = useState(3);

	// Control the animation sequence
	useEffect(() => {
		const timers = [];

		// Start sequence: initialize
		timers.push(setTimeout(() => setAnimationStage(1), 500));

		// Authentication sequence
		timers.push(setTimeout(() => setAnimationStage(2), 1500));

		// Countdown sequence
		timers.push(setTimeout(() => setAnimationStage(3), 2500));
		timers.push(setTimeout(() => setCountdown(2), 3500));
		timers.push(setTimeout(() => setCountdown(1), 4500));
		timers.push(setTimeout(() => setCountdown(0), 5500));

		// Launch sequence
		timers.push(setTimeout(() => setAnimationStage(4), 6000));

		// Complete and show content
		timers.push(
			setTimeout(() => {
				setAnimationStage(5);
				setTimeout(() => setLoading(false), 500);
			}, minLoadTime - 500)
		);

		return () => timers.forEach((timer) => clearTimeout(timer));
	}, [minLoadTime]);

	if (!loading) {
		return children;
	}

	return (
		<div className='fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden'>
			{/* Static stars background */}
			<div className='absolute inset-0 overflow-hidden'>
				{[...Array(100)].map((_, i) => (
					<div
						key={i}
						className='absolute bg-white rounded-full opacity-70'
						style={{
							width: `${Math.random() * 2 + 1}px`,
							height: `${Math.random() * 2 + 1}px`,
							top: `${Math.random() * 100}%`,
							left: `${Math.random() * 100}%`,
							animation: `twinkle ${
								Math.random() * 5 + 3
							}s infinite`,
						}}
					/>
				))}
			</div>

			{/* Mission Control Terminal */}
			<div className='relative z-10 max-w-2xl w-full mx-4 rounded-lg border-2 border-gray-700 bg-gray-900 shadow-[0_0_15px_rgba(0,255,255,0.3)] overflow-hidden'>
				{/* Terminal header */}
				<div className='bg-gray-800 text-green-400 font-mono text-sm px-4 py-2 flex justify-between items-center border-b border-gray-700'>
					<div className='flex items-center gap-2'>
						<div className='w-3 h-3 bg-red-500 rounded-full'></div>
						<div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
						<div className='w-3 h-3 bg-green-500 rounded-full'></div>
					</div>
					<div className='typing-text'>
						OPERATION: PROPER PICKS
					</div>
					<div className='text-xs line-clamp-1 sm:block hidden'>{new Date().toISOString()}</div>
				</div>

				{/* Terminal body */}
				<div className='p-4 font-mono text-green-400 h-[400px] overflow-hidden relative'>
					{/* Satellite image backdrop */}
					<div className='absolute inset-0 opacity-10'>
						<div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iLjUiPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEwIi8+PGxpbmUgeDE9IjEwIiB5MT0iNTAiIHgyPSI5MCIgeTI9IjUwIi8+PGxpbmUgeDE9IjUwIiB5MT0iMTAiIHgyPSI1MCIgeTI9IjkwIi8+PC9nPjwvc3ZnPg==')] bg-repeat"></div>
					</div>

					<div className='relative z-10 space-y-3'>
						{/* Initial text */}
						<p
							className={`transition-opacity duration-500 ${
								animationStage >= 0
									? 'opacity-100'
									: 'opacity-0'
							}`}
						>
							`&gt;` INITIALIZING SECURE CONNECTION...
						</p>

						{animationStage >= 1 && (
							<p className='transition-opacity duration-500 opacity-100'>
								`&gt;` GETTING INSTRUCTIONS FROM ELON
							</p>
						)}

						{animationStage >= 2 && (
							<>
								<p className='transition-opacity duration-500 opacity-100'>
									`&gt;` GATHERING USER DATA...
								</p>
								<p className='transition-opacity duration-500 opacity-100'>
									`&gt;` ACCESS GRANTED. WELCOME, AGENT.
								</p>
								<p className='transition-opacity duration-500 opacity-100'>
									`&gt;` LOADING MISSION PARAMETERS...
								</p>
							</>
						)}

						{animationStage >= 3 && (
							<>
								<p className='transition-opacity duration-500 opacity-100'>
									`&gt;` MISSION CRITICAL: BEAT AI BRACKET
								</p>
								<div className='flex items-center mt-2'>
									<span className='mr-2'>
										LAUNCH IN T-MINUS:
									</span>
									<span className='text-3xl text-red-500 font-bold'>
										{countdown}
									</span>
								</div>
							</>
						)}

						{animationStage >= 4 && (
							<div className='mt-4'>
								<p className='text-red-500 font-bold'>
									!!! LAUNCH SEQUENCE ACTIVATED !!!
								</p>
								<p className='text-yellow-400'>
									TO THE MOON...
								</p>
							</div>
						)}

						{/* Rocket launch animation */}
						<div
							className={`mt-6 flex justify-center h-48 relative ${
								animationStage < 4
									? 'opacity-30'
									: 'opacity-100'
							}`}
						>
							<div className='absolute bottom-0 w-full h-5 bg-gradient-to-t from-orange-500 to-transparent rounded-full blur-md'></div>

							{/* Launchpad */}
							<div className='absolute bottom-0 w-20 h-10 bg-gray-700 rounded-md'></div>

							{/* Rocket */}
							<div
								className={`absolute h-32 w-16 transition-all duration-1000 ease-in transform ${
									animationStage >= 4
										? 'bottom-full -translate-y-10'
										: 'bottom-10'
								}`}
								style={{
									transform:
										animationStage >= 4
											? 'translateY(calc(-100vh - 100%))'
											: '',
									transitionDelay: '0.5s',
									transitionDuration: '2s',
								}}
							>
								{/* Rocket body */}
								<div className='relative w-full h-full'>
									{/* Rocket nose */}
									<div className='absolute top-0 left-2 w-12 h-10 bg-red-500 rounded-t-full'></div>

									{/* Rocket body */}
									<div className='absolute top-10 left-2 w-12 h-16 bg-gray-200'></div>

									{/* Rocket window */}
									<div className='absolute top-12 left-5 w-6 h-6 bg-blue-400 rounded-full border-2 border-gray-600'></div>

									{/* Rocket fins */}
									<div className='absolute bottom-4 left-0 w-4 h-8 bg-red-400 skew-x-[-30deg]'></div>
									<div className='absolute bottom-4 right-0 w-4 h-8 bg-red-400 skew-x-[30deg]'></div>

									{/* Rocket engine */}
									<div className='absolute -bottom-2 left-4 w-8 h-4 bg-gray-700 rounded-b-lg'></div>

									{/* Rocket flames */}
									{animationStage >= 4 && (
										<>
											<div className='absolute -bottom-6 left-5 w-6 h-8 bg-orange-500 rounded-b-full animate-pulse'></div>
											<div className='absolute -bottom-10 left-6 w-4 h-6 bg-yellow-400 rounded-b-full animate-pulse'></div>

											{/* Smoke effects */}
											<div className='absolute -bottom-12 -left-4 w-24 h-10'>
												{[...Array(12)].map((_, i) => (
													<div
														key={i}
														className='absolute rounded-full bg-gray-400 opacity-50 animate-smoke'
														style={{
															width: `${
																Math.random() *
																	10 +
																5
															}px`,
															height: `${
																Math.random() *
																	10 +
																5
															}px`,
															left: `${
																Math.random() *
																100
															}%`,
															animationDelay: `${
																Math.random() *
																0.5
															}s`,
															animationDuration: `${
																Math.random() *
																	1 +
																1
															}s`,
														}}
													></div>
												))}
											</div>
										</>
									)}
								</div>
							</div>
						</div>

						{animationStage >= 5 && (
							<div className='mt-4 text-center'>
								<p className='text-green-400 font-bold text-xl'>
									MISSION SUCCESSFUL
								</p>
								<p className='text-white'>
									LOADING BRIEFING MATERIALS...
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Loading bar at bottom */}
				<div className='bg-gray-800 px-4 py-2 border-t border-gray-700'>
					<div className='w-full bg-gray-700 rounded-full h-2.5'>
						<div
							className='bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out'
							style={{
								width: `${(animationStage / 5) * 100}%`,
							}}
						></div>
					</div>
				</div>
			</div>
		</div>
	);
}
