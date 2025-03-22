'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
	collection,
	getDocs,
	doc,
	getDoc,
	setDoc,
	updateDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function AdminUsersPage() {
	const { user, isAuthenticated, isAdmin } = useSelector(
		(state) => state.auth
	);
	const router = useRouter();
	const [users, setUsers] = useState([]);
	const [adminIds, setAdminIds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [newAdminEmail, setNewAdminEmail] = useState('');
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Redirect if not authenticated or not admin
				if (!isAuthenticated) {
					router.push('/login');
					return;
				}

				if (!isAdmin) {
					router.push('/data-dashboard');
					return;
				}

				// Fetch admin IDs from Firestore
				const adminDocRef = doc(db, 'settings', 'admins');
				const adminDoc = await getDoc(adminDocRef);

				if (adminDoc.exists()) {
					setAdminIds(adminDoc.data().adminIds || []);
				} else {
					// Create the admin document with current user as admin if it doesn't exist
					const initialAdmins = [user.uid];
					await setDoc(adminDocRef, { adminIds: initialAdmins });
					setAdminIds(initialAdmins);
				}

				// Fetch users
				const usersSnapshot = await getDocs(collection(db, 'users'));
				const usersList = [];

				usersSnapshot.forEach((doc) => {
					usersList.push({
						id: doc.id,
						...doc.data(),
					});
				});

				setUsers(usersList);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching data:', err);
				setError('Failed to load users data');
				setLoading(false);
			}
		};

		fetchData();
	}, [isAuthenticated, isAdmin, router, user]);

	const handleAddAdmin = async () => {
		if (!newAdminEmail) return;

		try {
			setIsUpdating(true);

			// Find user by email
			const matchingUser = users.find((u) => u.email === newAdminEmail);

			if (!matchingUser) {
				alert('No user found with this email address');
				setIsUpdating(false);
				return;
			}

			// Check if already an admin
			if (adminIds.includes(matchingUser.id)) {
				alert('This user is already an admin');
				setIsUpdating(false);
				return;
			}

			// Update admin list
			const updatedAdmins = [...adminIds, matchingUser.id];
			await updateDoc(doc(db, 'settings', 'admins'), {
				adminIds: updatedAdmins,
			});

			setAdminIds(updatedAdmins);
			setNewAdminEmail('');
			alert('Admin added successfully');
		} catch (err) {
			console.error('Error adding admin:', err);
			alert('Failed to add admin: ' + err.message);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleRemoveAdmin = async (adminId) => {
		try {
			setIsUpdating(true);

			// Don't allow removing yourself
			if (adminId === user.uid) {
				alert('You cannot remove yourself as admin');
				setIsUpdating(false);
				return;
			}

			// Don't allow removing the last admin
			if (adminIds.length <= 1) {
				alert('Cannot remove the last admin');
				setIsUpdating(false);
				return;
			}

			// Update admin list
			const updatedAdmins = adminIds.filter((id) => id !== adminId);
			await updateDoc(doc(db, 'settings', 'admins'), {
				adminIds: updatedAdmins,
			});

			setAdminIds(updatedAdmins);
			alert('Admin removed successfully');
		} catch (err) {
			console.error('Error removing admin:', err);
			alert('Failed to remove admin: ' + err.message);
		} finally {
			setIsUpdating(false);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='loading loading-spinner loading-lg'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container mx-auto py-8 px-4'>
				<div className='alert alert-error'>
					<span>{error}</span>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-8 px-4'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
				<div>
					<h1 className='text-3xl font-bold'>User Management</h1>
					<p className='text-base-content/70'>Manage admin access</p>
				</div>
				<Link
					href='/admin'
					className='btn btn-outline mt-4 md:mt-0'
				>
					Back to Admin Dashboard
				</Link>
			</div>

			{/* Add admin form */}
			<div className='bg-base-200 p-6 rounded-lg mb-8'>
				<h2 className='text-xl font-semibold mb-4'>Add New Admin</h2>
				<div className='flex flex-col md:flex-row gap-3'>
					<input
						type='email'
						placeholder='Enter user email'
						className='input input-bordered w-full md:w-80'
						value={newAdminEmail}
						onChange={(e) => setNewAdminEmail(e.target.value)}
					/>
					<button
						className='btn btn-secondary'
						onClick={handleAddAdmin}
						disabled={isUpdating}
					>
						{isUpdating ? (
							<>
								<span className='loading loading-spinner loading-xs'></span>
								Adding...
							</>
						) : (
							'Add Admin'
						)}
					</button>
				</div>
			</div>

			{/* Current admins list */}
			<div className='bg-base-100 shadow-lg rounded-lg overflow-hidden'>
				<div className='p-4 border-b'>
					<h2 className='text-lg font-semibold'>Current Admins</h2>
				</div>
				<div className='overflow-x-auto'>
					<table className='table w-full'>
						<thead>
							<tr>
								<th>User ID</th>
								<th>Email</th>
								<th>Name</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{adminIds.map((adminId) => {
								const adminUser = users.find(
									(u) => u.id === adminId
								) || {
									id: adminId,
									email: 'Unknown',
									displayName: 'Unknown User',
								};
								return (
									<tr key={adminId}>
										<td className='font-mono text-xs'>
											{adminId}
										</td>
										<td>{adminUser.email || 'Unknown'}</td>
										<td>
											{adminUser.displayName ||
												adminUser.email?.split(
													'@'
												)[0] ||
												'Unknown'}
										</td>
										<td>
											<button
												className='btn btn-sm btn-error btn-outline'
												onClick={() =>
													handleRemoveAdmin(adminId)
												}
												disabled={
													isUpdating ||
													adminId === user?.uid
												}
											>
												Remove
											</button>
										</td>
									</tr>
								);
							})}
							{adminIds.length === 0 && (
								<tr>
									<td
										colSpan='4'
										className='text-center py-4'
									>
										No admins found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* All users list */}
			<div className='mt-8 bg-base-100 shadow-lg rounded-lg overflow-hidden'>
				<div className='p-4 border-b'>
					<h2 className='text-lg font-semibold'>All Users</h2>
				</div>
				<div className='overflow-x-auto'>
					<table className='table w-full'>
						<thead>
							<tr>
								<th>Email</th>
								<th>Name</th>
								<th>Status</th>
								<th>ID</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id}>
									<td>{user.email || 'Unknown'}</td>
									<td>
										{user.displayName ||
											user.email?.split('@')[0] ||
											'Unknown'}
									</td>
									<td>
										{adminIds.includes(user.id) ? (
											<span className='badge badge-success'>
												Admin
											</span>
										) : (
											<span className='badge'>User</span>
										)}
									</td>
									<td className='font-mono text-xs'>
										{user.id}
									</td>
								</tr>
							))}
							{users.length === 0 && (
								<tr>
									<td
										colSpan='4'
										className='text-center py-4'
									>
										No users found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
