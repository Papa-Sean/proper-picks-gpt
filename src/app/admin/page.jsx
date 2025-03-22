'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
	const { user, isAuthenticated, isAdmin } = useSelector(
		(state) => state.auth
	);
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if we have auth info and redirect if not admin
		if (!isAuthenticated) {
			router.push('/login');
			return;
		}

		if (!isAdmin) {
			router.push('/data-dashboard');
			return;
		}

		setLoading(false);
	}, [isAuthenticated, isAdmin, router]);

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='loading loading-spinner loading-lg'></div>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-8 px-4'>
			<h1 className='text-3xl font-bold mb-8'>Admin Dashboard</h1>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				<div className='card bg-base-100 shadow-lg hover:shadow-xl transition-shadow'>
					<div className='card-body'>
						<h2 className='card-title'>Tournament Management</h2>
						<p className='text-base-content/70 mb-4'>
							Update tournament details, set winners, and manage
							brackets
						</p>
						<div className='card-actions justify-end'>
							<Link
								href='/admin/tournament'
								className='btn btn-secondary'
							>
								Manage Tournament
							</Link>
						</div>
					</div>
				</div>

				<div className='card bg-base-100 shadow-lg hover:shadow-xl transition-shadow'>
					<div className='card-body'>
						<h2 className='card-title'>User Management</h2>
						<p className='text-base-content/70 mb-4'>
							Manage user accounts and admin access
						</p>
						<div className='card-actions justify-end'>
							<Link
								href='/admin/users'
								className='btn btn-secondary'
							>
								Manage Users
							</Link>
						</div>
					</div>
				</div>

				{/* Debug information card */}
				<div className='card bg-base-200 shadow-lg'>
					<div className='card-body'>
						<h2 className='card-title'>Admin Status Debug</h2>
						<div className='overflow-x-auto'>
							<table className='table table-zebra w-full'>
								<tbody>
									<tr>
										<td className='font-semibold'>
											User ID
										</td>
										<td className='font-mono text-sm'>
											{user?.uid || 'Not logged in'}
										</td>
									</tr>
									<tr>
										<td className='font-semibold'>
											Admin Status
										</td>
										<td>
											{isAdmin ? (
												<span className='badge badge-success'>
													Admin
												</span>
											) : (
												<span className='badge badge-error'>
													Not Admin
												</span>
											)}
										</td>
									</tr>
									<tr>
										<td className='font-semibold'>Email</td>
										<td>{user?.email || 'Unknown'}</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div className='card-actions justify-start mt-4'>
							<button
								onClick={async () => {
									const { refreshUserToken } = await import(
										'@/hooks/useAuth'
									);
									await refreshUserToken();
									alert(
										'Token refreshed, please try accessing admin features again'
									);
								}}
								className='btn btn-sm btn-outline'
							>
								Refresh Admin Token
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
