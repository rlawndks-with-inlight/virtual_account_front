import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === '/manager/gift-card/member') {
      router.push('/manager/gift-card/member/list');
    }
  });
  return null;
}
