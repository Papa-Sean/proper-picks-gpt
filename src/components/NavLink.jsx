'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function NavLink({
	href,
	requiresAuth = false,
	children,
	...props
}) {
	const { isAuthenticated } = useSelector((state) => state.auth);
	const router = useRouter();

	const handleClick = (e) => {
		// If the link requires authentication and user is not authenticated
		if (requiresAuth && !isAuthenticated) {
			e.preventDefault();
			router.push(`/login?callbackUrl=${encodeURIComponent(href)}`);
		}
	};

	return (
		<Link
			href={href}
			onClick={handleClick}
			{...props}
		>
			{children}
		</Link>
	);
}
