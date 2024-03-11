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


  const onLoginDeveloper = async (user_name, user_pw) => {
    let user = await login(user_name, user_pw, '');
    router.push(getReturnUri(navList));
  }
  useEffect(() => {
    if (router.query?.user_name && router.query?.user_pw) {
      onLoginDeveloper(router.query?.user_name, router.query?.user_pw);
    } else {
      router.push('/login');
    }
  }, []);

  return null;
}
Index.getLayout = (page) => <LoginLayout>{page}</LoginLayout>;
export default Index;
