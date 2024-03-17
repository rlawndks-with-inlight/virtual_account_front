import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Stack,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  IconButton,
  Typography,
  ListItemText,
  ListItemButton,
  FormControlLabel,
  Switch,
} from '@mui/material';
// utils
// _mock_
import { _notifications } from '../../../_mock/arrays';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import MenuPopover from '../../../components/menu-popover';
import { IconButtonAnimate } from '../../../components/animate';
import { socket } from 'src/data/data';
import styled from 'styled-components';
import { apiManager } from 'src/utils/api-manager';
import { useRouter } from 'next/router';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from '../../../components/snackbar';
import { useAuthContext } from 'src/auth/useAuthContext';
import { Col, Row } from 'src/components/elements/styled-components';
import { commarNumber } from 'src/utils/function';
import { Icon } from '@iconify/react';
import { useModal } from 'src/components/dialog/ModalProvider';

// ----------------------------------------------------------------------

const BellMp3 = styled.iframe`
display: none;
`
export default function NotificationsPopover() {
  const { setModal } = useModal()
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();
  const router = useRouter();


  const { themeReadNotifications, onChangeReadNotifications, themeDnsData, themeMode, themeSetting, onChangeSetting } = useSettingsContext();
  const [openPopover, setOpenPopover] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isPlayMp3, setIsPlayMp3] = useState(false);
  const totalUnRead = notifications.filter((item) => !(themeReadNotifications[item?.id])).length;
  const [splitCount, setSplitCount] = useState(4);
  useEffect(() => {

    socket.on('message', (msg) => {
      let { method, data, brand_id, title } = msg;
      if (brand_id == themeDnsData?.id && (user?.level >= 40 || (user?.id == data?.user_id))) {
        let notification_list = [...notifications];
        notification_list.unshift(data);
        let method_list = [`deposit`, 'settle_request']
        if (method_list.includes(method)) {
          if (themeSetting?.is_not_sound_alarm != 1) {
            setIsPlayMp3(true);
          }
          enqueueSnackbar(title, {
            variant: 'success',
          })
          setTimeout(() => {
            setIsPlayMp3(false);
          }, 2000)
        }
      }
    });
    getBellContent();
  }, [])

  useEffect(() => {
    if (openPopover) {
      let read_notifications = { ...themeReadNotifications };
      for (var i = 0; i < notifications.length; i++) {
        read_notifications[notifications[i]?.id] = 1;
      }
      onChangeReadNotifications(read_notifications);
    }
  }, [openPopover])
  const getBellContent = async (is_new) => {
    let result = await apiManager(`bell-contents`, 'list');
    let notification_list = [...notifications];
    notification_list = [...result?.content];
    for (var i = 0; i < notification_list.length; i++) {
      if (themeReadNotifications[notification_list[i]?.id]) {
        notification_list[i].is_read = true;
      }
    }
    setNotifications(notification_list);
  }
  const handleOpenPopover = (event) => {
    getBellContent();
    setOpenPopover(event.currentTarget);
  };
  const handleClosePopover = (idx) => {
    setOpenPopover(null);
    if (idx >= 0) {
      let notification_list = [...notifications];
      notification_list[idx].is_read = true;
      setNotifications(notification_list);
      onChangeReadNotifications({ ...themeReadNotifications, [notifications[idx]?.id]: 1, });
    }
  };
  const deleteItem = async (idx) => {
    let notification_list = [...notifications];
    notification_list.splice(idx, 1);
    setNotifications(notification_list);
    let data = await apiManager('bell-contents', 'delete', { id: notifications[idx]?.id });
  }
  const deleteAllItem = async () => {
    let data = await apiManager('bell-contents/all', 'delete', {
      id: ''
    });
    onChangeReadNotifications({});
    getBellContent();
  }
  return (
    <>

      {isPlayMp3 &&
        <>
          <BellMp3 src={'/bell'} />
        </>}
      <IconButtonAnimate
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={{ width: 40, height: 40 }}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="eva:bell-fill" />
        </Badge>
      </IconButtonAnimate>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 360, p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">알림</Typography>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {notifications.length} 개 메세지가 있습니다.
              </Typography>
              <Stack>
                <FormControlLabel control={<Switch checked={themeSetting?.is_not_sound_alarm != 1} />} label={`알림소리켜기`}
                  onChange={(e) => {
                    onChangeSetting({
                      ...themeSetting,
                      is_not_sound_alarm: e.target.checked ? 0 : 1
                    })
                  }}
                />
              </Stack>
            </Row>
            <Row>
              <Button variant='outlined' startIcon={<Icon icon='material-symbols:delete-outline' />} style={{ margin: "0 0 auto auto" }}
                onClick={() => {
                  setModal({
                    func: () => { deleteAllItem() },
                    icon: 'material-symbols:delete-outline',
                    title: '정말 삭제하시겠습니까?'
                  })
                }}
              >전체지우기</Button>
            </Row>
          </Box>

          {/* {notifications.length - Object.keys(themeReadNotifications).length > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )} */}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          <List
            disablePadding
          >
            {notifications.slice(0, splitCount).map((notification, idx) => (
              <NotificationItem key={notification.id} notification={notification} router={router} handleClosePopover={handleClosePopover} idx={idx} deleteItem={deleteItem} />
            ))}
          </List>
        </div>

        {/* <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Before that
              </ListSubheader>
            }
          >
            {notifications.slice(2, 5).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List> */}

        <Divider sx={{ borderStyle: 'dashed' }} />
        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple onClick={() => {
            setSplitCount(notifications.length)
          }}>
            전체보기
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string,
    avatar: PropTypes.node,
    type: PropTypes.string,
    title: PropTypes.string,
    isUnRead: PropTypes.bool,
    description: PropTypes.string,
    createdAt: PropTypes.instanceOf(Date),
  }),
};

function NotificationItem({ notification, router, handleClosePopover, idx, deleteItem }) {
  const { avatar, title } = renderContent(notification);

  const onClickEvent = () => {
    router.push(notification?.link)
    handleClosePopover(idx);
  }
  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.is_read && {
          bgcolor: 'action.selected',
        }),

      }}
    >
      <ListItemText
        disableTypography
        primary={title}
        secondary={
          <Stack direction="row" style={{ position: 'relative' }} sx={{ mt: 0.5, typography: 'caption', color: 'text.disabled' }} onClick={onClickEvent}>
            <Iconify icon="eva:clock-fill" width={16} sx={{ mr: 0.5 }} />
            <Typography variant="caption" sx={{ mr: 0.5 }}>{notification.created_at}</Typography>
            <Typography variant="caption">{notification.is_read ? '읽음' : ''}</Typography>
            <IconButton
              style={{ marginLeft: 'auto', position: 'absolute', right: '-0.5rem', bottom: '0' }}
              onClick={() => {
                deleteItem(idx);
              }}>
              <Icon icon='material-symbols:delete-outline' />
            </IconButton>
          </Stack>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <br />
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        {notification.message}
      </Typography>
    </Typography>
  );

  if (notification.type === 'order_placed') {
    return {
      title,
    };
  }
  if (notification.type === 'order_shipped') {
    return {
      title,
    };
  }
  if (notification.type === 'mail') {
    return {
      title,
    };
  }
  if (notification.type === 'chat_message') {
    return {
      title,
    };
  }
  return {
    title,
  };
}
