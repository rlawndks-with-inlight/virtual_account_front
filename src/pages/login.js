import { Stack, TextField, InputAdornment, IconButton, Card, CardContent, Link, Typography, Button } from '@mui/material';
import LoginLayout from 'src/layouts/login/LoginLayout';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import Iconify from 'src/components/iconify/Iconify';
import $ from 'jquery';
import { useRouter } from 'next/router';
import { logoSrc } from 'src/data/data';
import { useSettingsContext } from 'src/components/settings';
import NextLink from 'next/link';
import { StyledContent, StyledSection, StyledSectionBg } from 'src/layouts/login/styles';
import Image from 'src/components/image/Image';
import dynamic from 'next/dynamic';
import { PATH_MANAGER } from 'src/routes/paths';
import { Row } from 'src/components/elements/styled-components';
import { apiManager } from 'src/utils/api-manager';
import navConfig from 'src/layouts/manager/nav/config-navigation';
import { getReturnUri } from 'src/utils/function';
const Tour = dynamic(
  () => import('reactour'),
  { ssr: false },
);
const Login = () => {
  const { login, user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const navList = navConfig();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [optNum, setOptNum] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    if (user?.level >= 10) {
      console.log(user)
      router.push(getReturnUri(navList));
    }
    setLoading(false);
  }, [user])

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const onSubmit = async () => {
    let user = await login(username, password, optNum);
    if (user) {
      console.log(user)
      router.push(getReturnUri(navList));
    }
  };
  const [tourOpen, setTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);

  const openTour = (class_name, text,) => {
    setTourSteps([
      {
        selector: `.${class_name}`,
        content: text,
      },
    ])
    setTourOpen(true);
  }
  const closeTour = () => {
    setTourOpen(false);
    setTourSteps([]);
  };
  return (
    <>

      <Row style={{ height: '100vh', width: '100vw' }}>
        <Card style={{ margin: 'auto', maxWidth: '450px', width: '90%' }}>
          <CardContent>

            <Stack>
              <img src={logoSrc()} style={{ maxWidth: '200px', margin: '1rem auto' }} />
              <Stack spacing={3}>
                <TextField
                  name="username"
                  label="아이디를 입력해 주세요."
                  autoComplete='new-password'
                  onChange={(e) => {
                    setUsername(e.target.value)
                  }}
                  onKeyPress={(e) => {
                    if (e.key == 'Enter') {
                      $('#id').focus();
                    }
                  }}
                />
                <TextField
                  name="password"
                  id="password"
                  label="패스워드를 입력해 주세요."
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  onKeyPress={(e) => {
                    if (e.key == 'Enter') {
                      onSubmit();
                    }
                  }}
                  onChange={(e) => {
                    setPassword(e.target.value)
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {themeDnsData?.is_use_otp == 1 &&
                  <>
                    <TextField
                      name="otp"
                      label="OTP번호"
                      autoComplete='new-password'
                      onChange={(e) => {
                        setOptNum(e.target.value)
                      }}
                      onKeyPress={(e) => {
                        if (e.key == 'Enter') {
                          onSubmit();
                        }
                      }}
                    />
                  </>}
              </Stack>
              <LoadingButton
                fullWidth
                color="inherit"
                size="large"
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: 'text.primary',
                  color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                  '&:hover': {
                    bgcolor: 'text.primary',
                    color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                  },
                  margin: '24px 0'
                }}
                onClick={onSubmit}
              >
                로그인
              </LoadingButton>
            </Stack>
          </CardContent>
        </Card>
      </Row>
      <Tour
        steps={tourSteps}
        isOpen={tourOpen}
        disableInteraction={false}
        onRequestClose={closeTour} />
    </>
  );
}
Login.getLayout = (page) => <LoginLayout>{page}</LoginLayout>;
export default Login;
