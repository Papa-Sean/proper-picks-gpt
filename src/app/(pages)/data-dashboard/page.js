'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import BracketForm from '@/components/BracketForm';

export default function Dashboard() {
	const router = useRouter();
	const { isAuthenticated, user } = useSelector((state) => state.auth);
	const [brackets, setBrackets] = useState([]);

	const fetchBrackets = async () => {
		try {
			const response = await fetch('/api/brackets');
			if (!response.ok) throw new Error('Failed to fetch brackets');
			const data = await response.json();
			setBrackets(data.brackets);
		} catch (error) {
			console.error('Error fetching brackets:', error);
		}
	};

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login');
		} else {
			fetchBrackets();
		}
	}, [isAuthenticated, router]);

	const handleNewBracket = () => {
		fetchBrackets(); // Refresh the list after creating a new bracket
	};

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<div>
					<BracketForm onSubmit={handleNewBracket} />
				</div>
				<div>
					<h2 className='text-2xl font-bold mb-4'>Your Brackets</h2>
					<div className='space-y-4'>
						{brackets.map((bracket) => (
							<div
								key={bracket.id}
								className='bg-white dark:bg-gray-800 rounded-lg shadow p-4'
							>
								<h3 className='text-lg font-semibold'>
									{bracket.name}
								</h3>
								<p className='text-gray-600'>
									Status: {bracket.status}
								</p>
								<p className='text-gray-600'>
									Score: {bracket.score}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
