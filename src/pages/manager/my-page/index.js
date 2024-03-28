import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        if (router.pathname === '/manager/my-page') {
            router.push('/manager/my-page/change-pw');
        }
    });
    return null;
}
