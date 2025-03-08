'use client';

import { Provider } from 'react-redux';
import { store } from '../store/index';

export const metadata = {
	title: 'ProperGPT',
	description: 'Your app description',
	icons: '/papaavatar.svg',
};

export function Providers({ children }) {
	return <Provider store={store}>{children}</Provider>;
}
