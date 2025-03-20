'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import NavLink from './NavLink';

export default function Navigation() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();
	const { isAuthenticated } = useSelector((state) => state.auth);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	// Important: Use this to defer client-side rendering until after hydration
	const [isClient, setIsClient] = useState(false);

	// Add this at the beginning of your component
	useEffect(() => {
		// Detect and break redirect loops
		if (typeof window !== 'undefined') {
			const redirectCount = parseInt(
				localStorage.getItem('redirectCount') || '0'
			);

			if (redirectCount > 5) {
				console.log('Breaking potential redirect loop');
				localStorage.removeItem('redirectCount');
				localStorage.removeItem('redirectStarted');
				localStorage.removeItem('auth'); // Force re-authentication
				window.location.href = '/login';
				return;
			}

			localStorage.setItem(
				'redirectCount',
				(redirectCount + 1).toString()
			);

			// Reset the counter after 5 seconds of no redirects
			setTimeout(() => {
				localStorage.setItem('redirectCount', '0');
			}, 5000);
		}
	}, []);

	// Set isClient to true once component mounts on client side
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Close mobile menu when route changes
	useEffect(() => {
		setIsMenuOpen(false);
	}, [pathname]);

	const isActive = (path) => pathname === path;

	const handleSignOut = async () => {
		try {
			setIsLoggingOut(true);
			console.log('Navigation: Starting logout process');

			// Clear localStorage manually as a backup
			if (typeof window !== 'undefined') {
				localStorage.removeItem('auth');
			}

			// Call the logout function from your auth hook
			await logout();

			console.log('Navigation: Logout successful, redirecting');

			// Add a slight delay to ensure state updates
			setTimeout(() => {
				router.push('/login');
			}, 500);
		} catch (error) {
			console.error('Error signing out:', error);
			alert('Failed to sign out. Please try again.');
		} finally {
			setIsLoggingOut(false);
		}
	};

	// Navigation items
	const navItems = [
		{ path: '/', label: 'Home', requiresAuth: false },
		{ path: '/data-dashboard', label: 'Dashboard', requiresAuth: true },
		{
			path: '/brackets/create',
			label: 'Create Bracket',
			requiresAuth: true,
		},
		{
			path: '/brackets/leaderboard',
			label: 'Leaderboard',
			requiresAuth: true,
		},
		{ path: '/brackets/view', label: 'My Brackets', requiresAuth: true },
	];

	// Only render navigation items on the client, after hydration is complete
	const renderNavItems = () => {
		if (!isClient) {
			// During SSR and before hydration on client, return a simplified structure
			return navItems.map((item) => (
				<li
					key={item.path}
					style={{ display: 'none' }}
				></li>
			));
		}

		// Once we're on the client and hydrated, render the full navigation
		return navItems.map(
			(item) =>
				(!item.requiresAuth || isAuthenticated) && (
					<li key={item.path}>
						<NavLink
							href={item.path}
							requiresAuth={item.requiresAuth}
							className={
								isActive(item.path) ? 'active font-bold' : ''
							}
						>
							{item.label}
						</NavLink>
					</li>
				)
		);
	};

	return (
		<div className='sticky top-0 z-50'>
			{/* Main Navbar - Single Row */}
			<div className='navbar bg-base-100 shadow-md'>
				<div className='container mx-auto px-4 flex items-center justify-between'>
					{/* Left section with logo */}
					<div className='flex-none'>
						<Link
							href='/'
							className='btn btn-ghost normal-case text-xl'
						>
							Proper Picks
						</Link>
					</div>

					{/* Middle section with navigation items - desktop only */}
					<div className='hidden md:flex flex-1 justify-center'>
						<ul className='menu menu-horizontal px-1'>
							{renderNavItems()}
						</ul>
					</div>

					{/* Right section with auth buttons */}
					<div className='flex-none flex items-center gap-2'>
						{/* Auth buttons - desktop */}
						<div className='hidden md:flex gap-2'>
							{isClient && isAuthenticated ? (
								<div className='dropdown dropdown-end'>
									<label
										tabIndex={0}
										className='btn btn-ghost btn-circle avatar'
									>
										<div className='w-10 rounded-full'>
											<img
												src={
													user?.photoURL ||
													'/papaavatar.svg'
												}
												alt={
													user?.displayName ||
													'User avatar'
												}
											/>
										</div>
									</label>
									<ul
										tabIndex={0}
										className='mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52 z-10'
									>
										<li>
											<Link href='/profile'>Profile</Link>
										</li>
										<li>
											<Link href='/brackets/view'>
												My Brackets
											</Link>
										</li>
										<li>
											<button
												onClick={handleSignOut}
												disabled={isLoggingOut}
												className='text-error'
											>
												{isLoggingOut
													? 'Signing Out...'
													: 'Sign Out'}
											</button>
										</li>
									</ul>
								</div>
							) : (
								<>
									{isClient && (
										<>
											<Link
												href='/login'
												className='btn btn-ghost'
											>
												Log in
											</Link>
											<Link
												href='/login?signup=true'
												className='btn btn-primary'
											>
												Sign up
											</Link>
										</>
									)}
								</>
							)}
						</div>

						{/* Sign-out button (visible only when logged in) */}
						{isClient && isAuthenticated && (
							<div className='hidden md:block'>
								<button
									onClick={handleSignOut}
									disabled={isLoggingOut}
									className='btn btn-sm btn-error btn-outline'
								>
									{isLoggingOut ? (
										<>
											<span className='loading loading-spinner loading-xs mr-2'></span>
											Signing Out
										</>
									) : (
										'Sign Out'
									)}
								</button>
							</div>
						)}

						{/* Mobile menu button */}
						<div className='md:hidden'>
							<button
								className='btn btn-square btn-ghost'
								onClick={() => setIsMenuOpen(!isMenuOpen)}
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									className='inline-block w-6 h-6 stroke-current'
								>
									{isMenuOpen ? (
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M6 18L18 6M6 6l12 12'
										/>
									) : (
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M4 6h16M4 12h16M4 18h16'
										/>
									)}
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Navigation Menu - Appears below navbar */}
			{isMenuOpen && (
				<div className='md:hidden bg-base-100 shadow-lg border-t border-base-300 z-40'>
					<ul className='menu p-4'>
						{isClient && renderNavItems()}

						{/* Auth Links for Mobile */}
						<div className='divider my-2'></div>
						{isClient && isAuthenticated ? (
							<>
								<li>
									<Link
										href='/profile'
										className='flex items-center gap-2'
									>
										<div className='w-6 h-6 rounded-full overflow-hidden'>
											<img
												src={
													user?.photoURL ||
													'/papaavatar.svg'
												}
												alt={
													user?.displayName ||
													'User avatar'
												}
												className='w-full h-full object-cover'
											/>
										</div>
										Profile
									</Link>
								</li>
								{isAuthenticated && (
									<>
										<li>
											<Link
												href='/brackets/view'
												className='font-medium'
											>
												My Brackets
											</Link>
										</li>
									</>
								)}
								<li>
									<button
										onClick={handleSignOut}
										disabled={isLoggingOut}
										className='flex items-center gap-2 text-error'
									>
										{isLoggingOut ? (
											<>
												<span className='loading loading-spinner loading-xs'></span>
												Signing Out...
											</>
										) : (
											<>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-5 w-5'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
													/>
												</svg>
												Sign Out
											</>
										)}
									</button>
								</li>
							</>
						) : (
							<>
								{isClient && (
									<>
										<li>
											<Link
												href='/login'
												className='btn btn-ghost justify-start'
											>
												Log in
											</Link>
										</li>
										<li>
											<Link
												href='/login?signup=true'
												className='btn btn-primary justify-start mt-2'
											>
												Sign up
											</Link>
										</li>
									</>
								)}
							</>
						)}
					</ul>
				</div>
			)}
		</div>
	);
}
