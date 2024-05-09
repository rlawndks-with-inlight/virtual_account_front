import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/manager/black-lst') {
      router.push('/manager/black-lst/list');
    }
  });
  return null;
}
