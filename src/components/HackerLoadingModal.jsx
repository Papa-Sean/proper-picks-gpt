'use client';

import { useState, useEffect } from 'react';

export default function HackerLoadingModal({ children, duration = 10000 }) {
	const [loading, setLoading] = useState(true);
	const [scanStage, setScanStage] = useState(0);
	const [scanPercent, setScanPercent] = useState(0);
	const [consoleLines, setConsoleLines] = useState([]);
	const [glitchActive, setGlitchActive] = useState(false);

	// List of fake console outputs for the terminal effect
	const hackingOutputs = [
		'Establishing secure connection...',
		'Connection established to target system',
		'Running vulnerability scan...',
		'Bypassing firewall...',
		'Accessing database...',
		'Decrypting credentials...',
		'Scanning for sports algorithms...',
		'Retrieving prediction models...',
		'Extracting team performance metrics...',
		'Analyzing historical matchup data...',
		'Scanning for nudes...',
		'Injecting PredictionEngine.dll',
		'You should be ashamed of yourself...',
		'Running neural network predictions...',
		'Calculating win probabilities...',
		'Deploying analysis modules...',
		'My CPU is a neuronetwork processor... A learning computer...',
		'ACCESS GRANTED. Welcome to Proper Picks.',
	];

	// Random HEX codes for the background matrix effect
	const generateMatrixCode = () => {
		let code = '';
		const characters = '0123456789ABCDEF';
		for (let i = 0; i < 8; i++) {
			code += characters.charAt(
				Math.floor(Math.random() * characters.length)
			);
		}
		return code;
	};

	// Add new console line with typewriter effect
	const addConsoleLine = (line) => {
		setConsoleLines((prev) => [...prev, line]);
	};

	// Trigger occasional UI glitches
	const triggerGlitch = () => {
		setGlitchActive(true);
		setTimeout(() => setGlitchActive(false), 150);
	};

	// Control the animation sequence
	useEffect(() => {
		const timers = [];
		const consoleDelay = duration / (hackingOutputs.length + 2); // Distribute messages across animation

		// Initialize scan
		timers.push(setTimeout(() => setScanStage(1), 500));

		// Add console messages progressively
		hackingOutputs.forEach((line, index) => {
			timers.push(
				setTimeout(() => {
					addConsoleLine(line);
					// Occasionally trigger glitch effect
					if (Math.random() > 0.7) triggerGlitch();
				}, consoleDelay * (index + 1))
			);
		});

		// Update progress bar
		const progressInterval = setInterval(() => {
			setScanPercent((prev) => {
				if (prev >= 100) {
					clearInterval(progressInterval);
					return 100;
				}
				return prev + 1;
			});
		}, duration / 100);

		// Different scan stages
		timers.push(
			setTimeout(() => {
				setScanStage(2);
				triggerGlitch();
			}, duration * 0.3)
		);

		timers.push(
			setTimeout(() => {
				setScanStage(3);
				triggerGlitch();
			}, duration * 0.6)
		);

		timers.push(
			setTimeout(() => {
				setScanStage(4);
				triggerGlitch();
			}, duration * 0.8)
		);

		// Complete and show content
		timers.push(
			setTimeout(() => {
				setScanStage(5);
				triggerGlitch();
				setTimeout(() => setLoading(false), 500);
			}, duration - 500)
		);

		timers.push(progressInterval);
		return () => {
			timers.forEach((timer) => clearTimeout(timer));
			clearInterval(progressInterval);
		};
	}, [duration, hackingOutputs.length]);

	if (!loading) {
		return children;
	}

	return (
		<div
			className={`fixed inset-0 bg-black z-50 font-mono overflow-hidden ${
				glitchActive ? 'animate-glitch' : ''
			}`}
		>
			{/* Matrix-like background effect */}
			<div className='absolute inset-0 opacity-20 overflow-hidden'>
				<div className='grid grid-cols-12 gap-1 h-full'>
					{[...Array(144)].map((_, i) => (
						<div
							key={i}
							className='overflow-hidden'
						>
							{[...Array(20)].map((_, j) => (
								<div
									key={j}
									className='text-green-500 opacity-50 text-xs'
									style={{
										animation: `typewriter ${
											Math.random() * 3 + 1
										}s infinite`,
										animationDelay: `${Math.random() * 2}s`,
									}}
								>
									{generateMatrixCode()}
								</div>
							))}
						</div>
					))}
				</div>
			</div>

			{/* Main terminal window */}
			<div className='relative z-10 max-w-3xl w-full mx-auto mt-20 border-2 border-green-500 bg-black shadow-[0_0_20px_rgba(0,255,0,0.3)]'>
				{/* Terminal header */}
				<div className='bg-green-900 text-green-400 px-4 py-2 flex justify-between items-center border-b border-green-700'>
					<div className='flex items-center gap-2'>
						<div className='w-3 h-3 bg-red-500 rounded-full'></div>
						<div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
						<div className='w-3 h-3 bg-green-500 rounded-full'></div>
					</div>
					<div className='typing-text overflow-hidden whitespace-nowrap border-r-2 border-green-500'>
						PROPER PICKS SYSTEM ACCESS
					</div>
					<div className='text-xs'>{new Date().toISOString()}</div>
				</div>

				{/* Terminal body */}
				<div className='p-4 text-green-400 h-96 overflow-auto'>
					{/* IP Address block */}
					<div className='mb-4 flex justify-between'>
						<div>
							<span className='text-gray-500'>$</span> SYSTEM
							INFILTRATION IN PROGRESS
						</div>
						<div className='text-gray-500'>
							IP: {Math.floor(Math.random() * 255)}.
							{Math.floor(Math.random() * 255)}.
							{Math.floor(Math.random() * 255)}.
							{Math.floor(Math.random() * 255)}
						</div>
					</div>

					{/* Console output */}
					<div className='space-y-1'>
						{consoleLines.map((line, index) => (
							<div
								key={index}
								className='flex'
							>
								<span className='text-yellow-500 mr-2'>
									&gt;
								</span>
								<span
									className={`${
										index === consoleLines.length - 1
											? 'typing-effect'
											: ''
									}`}
								>
									{line}
								</span>
							</div>
						))}
					</div>

					{/* Scan visualization */}
					{scanStage >= 2 && (
						<div className='mt-6 border border-green-500 p-3'>
							<div className='text-xs mb-2'>
								SCANNING TARGET SYSTEMS...
							</div>
							<div className='grid grid-cols-16 gap-px'>
								{[...Array(128)].map((_, i) => (
									<div
										key={i}
										className={`h-3 ${
											Math.random() > 0.2
												? 'bg-green-500'
												: 'bg-green-800'
										} 
                      ${Math.random() > 0.9 ? 'animate-pulse' : ''}`}
										style={{
											opacity: Math.random() * 0.5 + 0.5,
										}}
									></div>
								))}
							</div>
						</div>
					)}

					{/* File discovery */}
					{scanStage >= 3 && (
						<div className='mt-4'>
							<div className='text-white font-bold'>
								DISCOVERED FILES:
							</div>
							<div className='grid grid-cols-2 gap-2 text-xs mt-2'>
								<div>bracket_data.json</div>
								<div>user_predictions.db</div>
								<div>tournament_history.sql</div>
								<div>neural_net_weights.bin</div>
								<div>team_statistics.csv</div>
								<div>prediction_engine.exe</div>
							</div>
						</div>
					)}

					{/* System access visualization */}
					{scanStage >= 4 && (
						<div className='mt-4 border border-yellow-500 p-2 bg-black'>
							<div className='text-yellow-500 font-bold'>
								SYSTEM ACCESS PROTOCOLS BYPASSED
							</div>
							<div className='flex justify-between text-xs mt-2'>
								<div>AUTH_MODULE</div>
								<div className='text-green-500'>BYPASSED</div>
							</div>
							<div className='flex justify-between text-xs'>
								<div>FIREWALL</div>
								<div className='text-green-500'>DISABLED</div>
							</div>
							<div className='flex justify-between text-xs'>
								<div>DATABASE_ACCESS</div>
								<div className='text-green-500'>GRANTED</div>
							</div>
						</div>
					)}

					{/* Final success message */}
					{scanStage >= 5 && (
						<div className='mt-4 text-center'>
							<div className='text-4xl text-green-500 font-bold animate-pulse'>
								ACCESS GRANTED
							</div>
							<div className='text-sm mt-2'>
								Welcome to Proper Picks
							</div>
							<div className='text-xs mt-4'>
								Loading secure interface...
							</div>
						</div>
					)}
				</div>

				{/* Progress bar at bottom */}
				<div className='bg-black px-4 py-2 border-t border-green-700'>
					<div className='flex justify-between text-xs text-green-400 mb-1'>
						<div>OPERATION PROGRESS</div>
						<div>{scanPercent}%</div>
					</div>
					<div className='w-full bg-gray-900 rounded-full h-2.5'>
						<div
							className='bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out'
							style={{
								width: `${scanPercent}%`,
							}}
						></div>
					</div>
				</div>
			</div>
		</div>
	);
}
