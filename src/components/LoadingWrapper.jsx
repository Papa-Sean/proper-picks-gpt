'use client';

import { useState, useEffect } from 'react';

export default function LoadingWrapper({ children, minLoadTime = 8000 }) {
	const [loading, setLoading] = useState(true);
	const [animationStage, setAnimationStage] = useState(0);
	const [shotCount, setShotCount] = useState(0);
	const [basketballPos, setBasketballPos] = useState({ x: 20, y: 30 });

	// Control the animation sequence
	useEffect(() => {
		const timers = [];

		// Start sequence: initialize
		timers.push(setTimeout(() => setAnimationStage(1), 500));

		// Robot activation sequence
		timers.push(setTimeout(() => setAnimationStage(2), 1500));

		// Basketball sequence
		timers.push(setTimeout(() => setAnimationStage(3), 2500));

		// Shots sequence
		timers.push(
			setTimeout(() => {
				setAnimationStage(4);
				shootBall();
			}, 3500)
		);

		// Complete and show content
		timers.push(
			setTimeout(() => {
				setAnimationStage(5);
				setTimeout(() => setLoading(false), 500);
			}, minLoadTime - 500)
		);

		return () => timers.forEach((timer) => clearTimeout(timer));
	}, [minLoadTime]);

	// Basketball shooting animation
	const shootBall = () => {
		if (shotCount >= 5) return;

		// Simulation settings for a basketball arc
		let startX = 20; // Start position (robot's hand)
		let startY = 15; // Lower starting position
		const endX = 75; // End position (basket)
		const endY = 50; // Height of the basket - increased to match new hoop position

		const totalFrames = 30;
		let frame = 0;

		const intervalId = setInterval(() => {
			frame++;
			if (frame >= totalFrames) {
				clearInterval(intervalId);
				setShotCount((prev) => prev + 1);

				// Add a delay before the next shot
				if (shotCount < 4) {
					setTimeout(shootBall, 800);
				}
				return;
			}

			// Calculate position along arc trajectory
			const progress = frame / totalFrames;
			const x = startX + (endX - startX) * progress;

			// Parabolic y motion - basketball arc
			// Higher peak in the middle of the trajectory
			const arcHeight = 50; // Maximum height of arc - increased for higher shot
			const yOffset = Math.sin(progress * Math.PI) * arcHeight;

			// Base trajectory starts lower and ends higher
			const y = startY + yOffset + progress * (endY - startY);

			setBasketballPos({ x, y });
		}, 33); // ~30fps
	};

	if (!loading) {
		return children;
	}

	return (
		<div className='fixed inset-0 bg-gray-900 z-50 flex items-center justify-center overflow-hidden'>
			{/* Basketball court background */}
			<div className='absolute inset-0 opacity-20 overflow-hidden'>
				<div className='w-full h-full border-4 border-orange-500'>
					<div className='absolute left-1/2 top-1/2 w-[150px] h-[150px] rounded-full border-4 border-orange-500 -translate-x-1/2 -translate-y-1/2'></div>
					<div className='absolute top-0 left-1/2 w-0 h-1/2 border-l-4 border-orange-500 -translate-x-1/2'></div>
				</div>
			</div>

			{/* Basketball Terminal */}
			<div className='relative z-10 max-w-2xl w-full mx-4 rounded-lg border-2 border-orange-800 bg-gray-800 shadow-[0_0_15px_rgba(255,165,0,0.3)] overflow-hidden'>
				{/* Terminal header */}
				<div className='bg-orange-900 text-white font-mono text-sm px-4 py-2 flex justify-between items-center border-b border-orange-700'>
					<div className='flex items-center gap-2'>
						<div className='w-3 h-3 bg-red-500 rounded-full'></div>
						<div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
						<div className='w-3 h-3 bg-green-500 rounded-full'></div>
					</div>
					<div className='typing-text'>BASKETBALL BOT 3000</div>
					<div className='text-xs line-clamp-1 sm:block hidden'>
						SYSTEM TIMESTAMP
					</div>
				</div>

				{/* Terminal body */}
				<div className='p-4 font-mono text-orange-400 h-[400px] overflow-hidden relative'>
					{/* Basketball court backdrop */}
					<div className='absolute inset-0 opacity-10 flex items-center justify-center'>
						<div className='w-40 h-40 rounded-full border-4 border-orange-500'></div>
						<div className='absolute w-px h-full border-l-4 border-dashed border-orange-500'></div>
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
							&gt; INITIALIZING BASKETBALL ROBOT...
						</p>

						{animationStage >= 1}

						{animationStage >= 2}

						{animationStage >= 3 && (
							<>
								<p className='transition-opacity duration-500 opacity-100'>
									&gt; PRACTICE SHOTS INITIATED
								</p>
								<div className='flex items-center mt-2'>
									<span className='mr-2'>SHOTS MADE:</span>
									<span className='text-3xl text-green-500 font-bold'>
										{shotCount}/5
									</span>
								</div>
							</>
						)}

						{animationStage >= 4 && (
							<div className='mt-4'>
								<p className='text-green-500 font-bold'>
									!!! BASKETBALL MODE ACTIVATED !!!
								</p>
								<p className='text-yellow-400'>
									SWISH...NOTHING BUT NET!
								</p>
							</div>
						)}

						{/* Basketball animation area */}
						<div
							className={`mt-6 flex justify-center h-48 relative ${
								animationStage < 3
									? 'opacity-30'
									: 'opacity-100'
							}`}
						>
							{/* Basketball court */}
							<div className='absolute bottom-0 w-full h-2 bg-orange-800'></div>

							{/* Basketball hoop - right side */}
							<div className='absolute bottom-10 right-10 w-20 h-40'>
								<div className='absolute top-10 right-0 w-20 h-1 bg-orange-600'></div>
								<div className='absolute top-10 right-5 w-10 h-8 border-2 border-b-0 border-orange-600'></div>
								<div className='absolute top-0 right-0 w-2 h-40 bg-orange-700'></div>
							</div>

							{/* Robot - left side */}
							<div className='absolute bottom-2 left-10 w-30 h-30'>
								{/* Robot head */}
								<div className='absolute bottom-20 left-0 w-12 h-10 bg-gray-400 rounded-t-lg border-2 border-gray-600'>
									{/* Robot eyes */}
									<div className='absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
									<div className='absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
									{/* Robot mouth */}
									<div className='absolute bottom-2 left-3 w-6 h-1 bg-gray-600'></div>
								</div>

								{/* Robot body */}
								<div className='absolute bottom-8 left-1 w-10 h-12 bg-gray-500 rounded-md'>
									{/* Robot control panel */}
									<div className='absolute top-2 left-2 w-6 h-4 bg-gray-700 grid grid-cols-2 gap-1 p-1'>
										<div className='w-1 h-1 bg-red-500 rounded-full animate-ping'></div>
										<div className='w-1 h-1 bg-green-500 rounded-full'></div>
										<div className='w-1 h-1 bg-yellow-500 rounded-full'></div>
										<div className='w-1 h-1 bg-blue-500 rounded-full animate-ping'></div>
									</div>
								</div>

								{/* Robot arm */}
								<div
									className={`absolute bottom-14 left-11 w-8 h-2 bg-gray-400 origin-left transform ${
										animationStage >= 4
											? 'rotate-[30deg]'
											: 'rotate-0'
									} transition-transform`}
								>
									{/* Robot hand */}
									<div className='absolute right-0 -top-1 w-3 h-3 bg-gray-300 rounded-full'></div>
								</div>

								{/* Robot legs */}
								<div className='absolute bottom-0 left-2 w-3 h-8 bg-gray-600'></div>
								<div className='absolute bottom-0 left-7 w-3 h-8 bg-gray-600'></div>
							</div>

							{/* Basketball */}
							{animationStage >= 4 && (
								<div
									className='absolute w-5 h-5 bg-orange-500 rounded-full border border-orange-700'
									style={{
										left: `${basketballPos.x}%`,
										bottom: `${basketballPos.y}%`,
										transition:
											'left 0.05s ease-out, bottom 0.05s ease-out',
									}}
								>
									{/* Basketball lines */}
									<div className='absolute top-1/2 left-0 w-full h-[1px] bg-orange-800 transform -translate-y-1/2'></div>
									<div className='absolute top-0 left-1/2 w-[1px] h-full bg-orange-800 transform -translate-x-1/2'></div>
								</div>
							)}
						</div>

						{animationStage >= 5 && (
							<div className='mt-4 text-center'>
								<p className='text-green-400 font-bold text-xl'>
									PERFECT SCORE!
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Loading bar at bottom */}
				<div className='bg-base-300 px-4 py-2 border-t border-orange-700'>
					<div className='w-full bg-gray-700 rounded-full h-2.5'>
						<div
							className='bg-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out'
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
