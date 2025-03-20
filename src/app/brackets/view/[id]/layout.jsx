export function generateStaticParams() {
	return [{ id: 'fallback' }];
}

export default function BracketViewLayout({ children }) {
	return children;
}
