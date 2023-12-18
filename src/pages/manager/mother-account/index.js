import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/manager/mother-account') {
      router.push('/manager/mother-account/list');
    }
  });
  return null;
}
