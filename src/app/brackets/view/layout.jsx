export function generateStaticParams() {
    // During static build, return a fallback ID that will be used
    // for the static placeholder - actual bracket will be loaded client-side
    return [{ id: 'fallback' }];
}

export default function BracketViewLayout({ children }) {
    return children;
}
