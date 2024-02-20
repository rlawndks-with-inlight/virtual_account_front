import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useSettingsContext } from 'src/components/settings';
import navConfig from 'src/layouts/manager/nav/config-navigation';
import LoginLayout from 'src/layouts/login/LoginLayout';
import { getReturnUri } from 'src/utils/function';

// ----------------------------------------------------------------------

const Index = () => {
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const navList = navConfig();
  const { user, login } = useAuthContext();


  const onLoginDeveloper = async () => {
    let user = await login(process.env.DEVELOPER_USER_NAME, process.env.DEVELOPER_USER_PW, '');
    router.push(getReturnUri(navList));
  }
  useEffect(() => {
    if (router.query?.is_developer) {
      onLoginDeveloper();
    } else {
      router.push('/login');
    }
  }, []);

  return null;
}
Index.getLayout = (page) => <LoginLayout>{page}</LoginLayout>;
export default Index;
