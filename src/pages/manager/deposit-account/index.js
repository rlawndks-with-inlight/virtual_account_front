import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/manager/deposit-account') {
      router.push('/manager/deposit-account/list');
    }
  });
  return null;
}
