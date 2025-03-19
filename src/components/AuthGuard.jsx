import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AuthGuard({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login'); // Redirect to login page if not authenticated
    }
  }, [isAuthenticated, router]);

  // Show nothing while checking authentication or redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}