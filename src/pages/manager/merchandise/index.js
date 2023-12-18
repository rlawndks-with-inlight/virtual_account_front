import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/manager/merchandise') {
      router.push('/manager/merchandise/list');
    }
  });
  return null;
}
