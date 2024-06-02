import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/manager/phone-auth-history') {
      router.push('/manager/phone-auth-history/list');
    }
  });
  return null;
}
