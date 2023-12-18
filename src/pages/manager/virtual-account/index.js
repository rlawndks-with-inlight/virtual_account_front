import { useEffect } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        if (router.pathname === '/manager/virtual-account') {
            router.push('/manager/virtual-account/edit');
        }
    });
    return null;
}
