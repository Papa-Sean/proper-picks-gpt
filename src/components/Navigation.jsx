'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navigation() {
	const { isAuthenticated } = useSelector((state) => state.auth);

	const navigation = isAuthenticated
		? [
				{ name: 'Home', href: '/' },
				{ name: 'Dashboard', href: '/data-dashboard' },
				{ name: 'Sign Out', href: '/signout' },
		  ]
		: [
				{ name: 'Home', href: '/' },
				{ name: 'Login', href: '/login' },
				{ name: 'Register', href: '/register' },
		  ];

	return (
		<Disclosure
			as='nav'
			className='bg-gray-800'
		>
			{({ open }) => (
				<>
					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
						<div className='flex items-center justify-between h-16'>
							<div className='flex items-center'>
								<div className='flex-shrink-0'>
									<Link
										href='/'
										className='text-white font-bold'
									>
										<Image
											src='/papaavatar.svg'
											alt='Papa Avatar Logo'
											width={40}
											height={40}
											className='h-10 w-auto'
										/>
									</Link>
								</div>
								<div className='hidden md:block'>
									<div className='ml-10 flex items-baseline space-x-4'>
										{navigation.map((item) => (
											<Link
												key={item.name}
												href={item.href}
												className='text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium'
											>
												{item.name}
											</Link>
										))}
									</div>
								</div>
							</div>
							<div className='-mr-2 flex md:hidden'>
								<Disclosure.Button className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'>
									{open ? (
										<XMarkIcon className='h-6 w-6' />
									) : (
										<Bars3Icon className='h-6 w-6' />
									)}
								</Disclosure.Button>
							</div>
						</div>
					</div>

					<Disclosure.Panel className='md:hidden'>
						<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className='text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium'
								>
									{item.name}
								</Link>
							))}
						</div>
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	);
}
