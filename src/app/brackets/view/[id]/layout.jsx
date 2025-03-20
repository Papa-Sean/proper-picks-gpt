// This file is necessary for Next.js static export to work with dynamic routes
export function generateStaticParams() {
	return [{ id: 'fallback' }];
}

export default function BracketViewLayout({ children }) {
	return children;
}
