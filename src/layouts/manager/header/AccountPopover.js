import { useEffect, useState } from 'react';
// next
import { useRouter } from 'next/router';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem } from '@mui/material';
// routes
import { PATH_AUTH } from '../../../routes/paths';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// components
import { CustomAvatar } from '../../../components/custom-avatar';
import { useSnackbar } from '../../../components/snackbar';
import MenuPopover from '../../../components/menu-popover';
import { IconButtonAnimate } from '../../../components/animate';
import { commarNumber, getUserLevelByNumber } from 'src/utils/function';
import { deleteCookie } from 'src/utils/react-cookie';
import { socket } from 'src/data/data';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api-manager';
import { Col, Row } from 'src/components/elements/styled-components';

// ----------------------------------------------------------------------

const OPTIONS = [
  {
    label: 'Home',
    linkTo: '/',
  },
  {
    label: 'Profile',
    linkTo: '/',
  },
  {
    label: 'Settings',
    linkTo: '/',
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {

  const router = useRouter();
  const { replace, push } = useRouter();

  const { themeDnsData, themeMode } = useSettingsContext();
  const { user, logout } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const [openPopover, setOpenPopover] = useState(null);
  const [userDeposit, setUserDeposit] = useState({});
  useEffect(() => {
    getUserDeposit();
    socket.on('message', (msg) => {
      let { method, data, brand_id, title } = msg;
      if (brand_id == themeDnsData?.id && (user?.level >= 40 || (user?.id == data?.user_id))) {
        getUserDeposit();
      }

    });
  }, [])
  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };
  const getUserDeposit = async () => {
    if (user?.level < 40) {
      let data = await apiManager('auth/deposit', 'get',);
      console.log(data)
      setUserDeposit(data);
    }
  }
  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const handleLogout = async () => {
    try {
      await deleteCookie('token');
      let result = await logout();
      router.push('/')
      handleClosePopover();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  const handleClickItem = (path) => {
    handleClosePopover();
    push(path);
  };

  return (
    <>
      <IconButtonAnimate
        onClick={handleOpenPopover}
        sx={{
          p: 0,
          ...(openPopover && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <CustomAvatar src={user?.profile_img} alt={user?.nickname} name={user?.nickname} />
      </IconButtonAnimate>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 200, p: 0 }}>
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.nickname}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {getUserLevelByNumber(user?.level)}
          </Typography>
          {user?.level < 40 &&
            <>
              <Col>
                <Row style={{ color: (themeMode == 'dark' ? '#fff' : '#333'), columnGap: '0.2rem', alignItems: 'center' }}>
                  <Typography variant='body2'>보유정산금:</Typography>
                  <Typography variant='body2'>{commarNumber(userDeposit?.settle_amount)}원</Typography>
                </Row>
                <Row style={{ color: (themeMode == 'dark' ? '#fff' : '#333'), columnGap: '0.2rem', alignItems: 'center' }}>
                  <Typography variant='body2'>지급보류금액:</Typography>
                  <Typography variant='body2'>{commarNumber(userDeposit?.min_withdraw_hold_price)}원</Typography>
                </Row>
                <Row style={{ color: (themeMode == 'dark' ? '#fff' : '#333'), columnGap: '0.2rem', alignItems: 'center' }}>
                  <Typography variant='body2'>출금가능금액:</Typography>
                  <Typography variant='body2'>{commarNumber(userDeposit?.settle_amount - userDeposit?.min_withdraw_hold_price)}원</Typography>
                </Row>
              </Col>
            </>}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </MenuPopover>
    </>
  );
}
