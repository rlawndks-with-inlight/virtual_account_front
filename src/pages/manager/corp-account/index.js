import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/manager/corp-account') {
      router.push('/manager/corp-account/list');
    }
  });
  return null;
}
