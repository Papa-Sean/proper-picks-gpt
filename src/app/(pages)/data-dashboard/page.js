'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import BracketForm from '@/components/BracketForm';
import AIModelForm from '@/components/AIModelForm';

export default function Dashboard() {
	const router = useRouter();
	const { isAuthenticated, user } = useSelector((state) => state.auth);
	const [activeTab, setActiveTab] = useState('brackets');
	const [brackets, setBrackets] = useState([]);
	const [models, setModels] = useState([]);

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

	const fetchModels = async () => {
		try {
			const response = await fetch('/api/ai-models');
			if (!response.ok) throw new Error('Failed to fetch models');
			const data = await response.json();
			setModels(data.models);
		} catch (error) {
			console.error('Error fetching models:', error);
		}
	};

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/login');
		} else {
			fetchBrackets();
			fetchModels();
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='tabs tabs-boxed mb-6'>
				<button
					className={`tab ${
						activeTab === 'brackets' ? 'tab-active' : ''
					}`}
					onClick={() => setActiveTab('brackets')}
				>
					Brackets
				</button>
				<button
					className={`tab ${activeTab === 'ai' ? 'tab-active' : ''}`}
					onClick={() => setActiveTab('ai')}
				>
					AI Models
				</button>
			</div>

			{activeTab === 'brackets' ? (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<BracketForm onSubmit={fetchBrackets} />
					<div className='space-y-4'>
						{brackets.map((bracket) => (
							<div
								key={bracket.id}
								className='card'
							>
								<h3>{bracket.name}</h3>
								<p>Status: {bracket.status}</p>
								<p>Score: {bracket.score}</p>
							</div>
						))}
					</div>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<AIModelForm onSubmit={fetchModels} />
					<div className='space-y-4'>
						{models.map((model) => (
							<div
								key={model.id}
								className='card'
							>
								<h3>{model.name}</h3>
								<p>Instruction: {model.instruction_name}</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
