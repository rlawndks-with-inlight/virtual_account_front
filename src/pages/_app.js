

import Head from 'next/head';
import '../styles/globals.css'
import { SettingsProvider, useSettingsContext } from 'src/components/settings';
import ThemeColorPresets from 'src/components/settings/ThemeColorPresets';
import ThemeProvider from 'src/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { Provider as ReduxProvider } from 'react-redux'
// editor
import 'react-quill/dist/quill.snow.css';

// slick-carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
//react-cards
import 'react-credit-cards/es/styles-compiled.css'

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from 'src/auth/JwtContext';
import { useEffect } from 'react';
import ThemeContrast from 'src/components/settings/ThemeContrast';
import { MotionLazyContainer } from 'src/components/animate';
import { ModalProvider } from 'src/components/dialog/ModalProvider';
import { useState } from 'react';
import { store } from '../redux/store'
import { useRouter } from 'next/router';
import SnackbarProvider from '../components/snackbar';
import Script from 'next/script';
import { getLocalStorage } from 'src/utils/local-storage';

const App = (props) => {
  const { Component, pageProps, head_data = {}, host, host_data } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
  const router = useRouter();
  const [headData, setHeadData] = useState({});
  useEffect(() => {
    if (Object.keys(head_data).length > 0) {
      setHeadData(head_data)
    } else {
      let themeDnsData = getLocalStorage('themeDnsData');
      setHeadData(JSON.parse(themeDnsData ?? "{}"))
    }
  }, [router.asPath])
  return (
    <>
      <Head>
        <title>{head_data?.name || headData?.name}</title>
        <meta
          name='description'
          content={head_data?.og_description || headData?.og_description}
        />
        <link rel='shortcut icon' href={`/brand-logo/${head_data?.id || headData?.id}.png`} />
        <link rel="apple-touch-icon" sizes="180x180" href={head_data?.favicon_img || headData?.favicon_img} />
        <meta name='keywords' content={head_data?.name || headData?.name} />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={head_data?.name || headData?.name} />
        <meta property="og:image" content={head_data?.og_img || headData?.og_img} />
        <meta property="og:url" content={'https://' + head_data?.dns || headData?.dns} />
        <meta property="og:description" content={head_data?.og_description || headData?.og_description} />
        <meta name="author" content="purplevery" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={head_data?.name || headData?.name} />
        <meta name="theme-color" content={head_data?.theme_css?.main_color || headData?.theme_css?.main_color} />
      </Head>
      <AuthProvider>
        <ReduxProvider store={store}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <ThemeColorPresets>
              <ThemeContrast>
                <SettingsProvider>
                  <MotionLazyContainer>
                    <ThemeProvider>
                      <ModalProvider>
                        <SnackbarProvider>
                          {getLayout(<Component {...pageProps} key={router.asPath} />)}
                        </SnackbarProvider>
                      </ModalProvider>
                      <Toaster position={'right-top'} toastOptions={{ className: 'react-hot-toast' }} />
                    </ThemeProvider>
                  </MotionLazyContainer>
                </SettingsProvider>
              </ThemeContrast>
            </ThemeColorPresets>
          </LocalizationProvider>
        </ReduxProvider>
      </AuthProvider>
    </>
  );
}
/*
App.getInitialProps = async (context) => {
  const { ctx } = context;
  try {
    let head_data = {}
    let host = '';
    host = ctx?.req?.headers.host.split(':')[0];
    const url = `${process.env.BACK_URL}/api/domain?dns=${process.env.FRONT_URL || host}`;
    const res = await fetch(url);
    head_data = await res.json();
    return {
      head_data: head_data?.data,
    }
  } catch (err) {
    return {
      head_data: {},
    }
  }
};
*/

export default App
