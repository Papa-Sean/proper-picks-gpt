import { Providers } from '../store/Provider';
import Navigation from '../components/Navigation';
import './globals.css';

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<head>
				<link
					rel='icon'
					href='/papaavatar.svg'
				/>
			</head>
			<body>
				<Providers>
					<Navigation />
					<main>{children}</main>
				</Providers>
			</body>
		</html>
	);
}
