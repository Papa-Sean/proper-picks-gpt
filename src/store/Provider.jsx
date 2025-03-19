'use client';

import { Provider } from 'react-redux';
import store from './index'; // Fix the import path

export const metadata = {
	title: 'ProperGPT',
	description: 'Your app description',
	icons: '/papaavatar.svg',
};

export function Providers({ children }) {
	return <Provider store={store}>{children}</Provider>;
}
