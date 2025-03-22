'use client';

/**
 * BracketConnector - Renders a connector line between games
 */
export default function BracketConnector({ type = 'vertical' }) {
	if (type === 'vertical') {
		return (
			<div
				className='absolute right-0 w-[50%] border-t border-red-900'
				style={{ top: '50%', transform: 'translateY(-50%)' }}
			/>
		);
	}
	return <div className='absolute left-0 h-full border-none' />;
}
