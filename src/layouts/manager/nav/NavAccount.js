// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Typography } from '@mui/material';
// auth
import { useAuthContext } from '../../../auth/useAuthContext';
// components
import { CustomAvatar } from '../../../components/custom-avatar';
import { getUserLevelByNumber } from 'src/utils/function';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter,
  }),
}));

// ----------------------------------------------------------------------

export default function NavAccount() {
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  return (
    <Link underline="none" color="inherit">
      <StyledRoot>
        <CustomAvatar src={user?.profile_img} alt={user?.nickname} name={user?.nickname} />

        <Box sx={{ ml: 2, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.nickname}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {themeDnsData?.id == 106 ?
              <>
                {(user?.level >= 40 || user?.level == 10) &&
                  <>
                    {getUserLevelByNumber(user?.level)}
                  </>}
              </>
              :
              <>
                {getUserLevelByNumber(user?.level)}
              </>}

          </Typography>
        </Box>
      </StyledRoot>
    </Link>
  );
}
