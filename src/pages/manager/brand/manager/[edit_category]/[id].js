
import { Box, Button, Card, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Pagination, Select, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager } from "src/utils/api-manager";
import { getMaxPage, getUserDepositFee, getUserFee, getUserWithDrawFee, onlyNumberText } from "src/utils/function";
import { bankCodeList } from "src/utils/format";
import { Icon } from "@iconify/react";
import { useAuthContext } from "src/auth/useAuthContext";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const UserEdit = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [operatorList, setOperatorList] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [ipPage, setIpPage] = useState(1);
  const [item, setItem] = useState({
    profile_file: undefined,
    user_name: '',
    phone_num: '',
    nickname: '',
    name: '',
    email: '',
    level: 40,
    user_pw: '',
    withdraw_fee: 0,
    min_withdraw_price: 0,
    min_withdraw_remain_price: 0,
    min_withdraw_hold_price: 0,
    is_send_one_won_check: false,
    vrf_bank_code: '',
    guid: '',
    is_withdraw_hold: 0,
    withdraw_bank_code: '',
    withdraw_acct_num: '',
    withdraw_acct_name: '',

  })
  const [ipData, setIpData] = useState({});
  const [ipList, setIpList] = useState([]);
  const [ipSearchObj, setIpSearchObj] = useState({
    page: 1,
    page_size: 20,
    id: router.query?.id
  })
  const tab_list = [
    {
      value: 0,
      label: '기본정보'
    },
    {
      value: 1,
      label: '허용 IP',
    },
  ]
  useEffect(() => {
    if (router.query?.tab >= 0) {
      setCurrentTab(router.query?.tab ?? 0);
    }
    settingPage();
  }, [])
  const settingPage = async () => {
    let data = item;
    if (router.query?.edit_category == 'edit') {
      data = await apiManager('users', 'get', {
        id: router.query.id
      })
      console.log(data)
      setIpList(data?.ip_list);
      onChangePage(ipSearchObj)
    }
    if (router.query?.edit_category == 'add') {
      data['withdraw_fee'] = themeDnsData?.default_withdraw_fee;
      data['deposit_fee'] = themeDnsData?.default_deposit_fee;
      data['mcht_fee'] = themeDnsData?.head_office_fee;
    }
    setItem(data);
    setLoading(false);

  }
  const onChangePage = async (obj) => {
    setIpSearchObj(obj);
    setIpData({
      ...ipData,
      content: undefined
    })
    let data_ = await apiManager('users/ip-logs', 'list', obj);
    if (data_) {
      setIpData(data_);
    }
  }
  const onSave = async () => {
    let data = item;

    let result = undefined
    if (data?.telegram_chat_ids) {
      data['telegram_chat_ids'] = JSON.stringify((data?.telegram_chat_ids ?? "").split(','));
    } else {
      data['telegram_chat_ids'] = '[]';
    }
    if (data?.id) {//수정
      result = await apiManager('users', 'update', { ...data, ip_list: ipList });
    } else {//추가
      result = await apiManager('users', 'create', { ...data, ip_list: ipList });
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/brand/manager/list');
    } else {

    }
  }

  return (
    <>
      {!loading &&
        <>
          <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem' }}>
            {tab_list.map((tab) => (
              <Button
                variant={tab.value == currentTab ? 'contained' : 'outlined'}
                onClick={() => {
                  setCurrentTab(tab.value)
                }}
              >{tab.label}</Button>
            ))}
          </Row>
          <Grid container spacing={3}>
            {currentTab == 0 &&
              <>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          프로필사진
                        </Typography>
                        <Upload file={item.profile_file || item.profile_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['profile_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['profile_img']: '',
                              ['profile_file']: undefined,
                            }
                          )
                        }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='아이디'
                        value={item.user_name}
                        disabled={router.query?.edit_category == 'edit'}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['user_name']: e.target.value
                            }
                          )
                        }} />
                      {router.query?.edit_category == 'add' &&
                        <>
                          <TextField
                            label='패스워드'
                            value={item.user_pw}

                            type='password'
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['user_pw']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      <TextField
                        label='닉네임'
                        value={item.nickname}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['nickname']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='이름'
                        value={item.name}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['name']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='전화번호'
                        value={item.phone_num}
                        placeholder="하이픈(-) 제외 입력"

                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['phone_num']: onlyNumberText(e.target.value)
                            }
                          )
                        }} />

                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {themeDnsData?.withdraw_type == 0 &&
                        <>
                          <TextField
                            label='guid'
                            value={item.guid}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['guid']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      <TextField
                        label='mid'
                        value={item.mid}
                        disabled={true}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['mid']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='입금노티url'
                        value={item.deposit_noti_url}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['deposit_noti_url']: e.target.value
                            }
                          )
                        }} />
                      {themeDnsData?.is_use_telegram_bot == 1 &&
                        <>
                          <TextField
                            label='텔레그램 chat id (,콤마로 구분)'
                            value={item.telegram_chat_ids}
                            placeholder=""
                            helperText={<Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                              <div>텔레그램 봇 이름: </div>
                              <div style={{ color: 'blue', cursor: 'pointer' }} onClick={() => {
                                window.open(`https://t.me/${themeDnsData?.telegram_bot_id}`)
                              }}>@{themeDnsData?.telegram_bot_id}</div>
                            </Row>}
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['telegram_chat_ids']: e.target.value
                                }
                              )
                            }} />
                        </>}

                      {(themeDnsData?.is_use_otp && user?.level >= 40) ?
                        <>
                          <TextField
                            label='OTP 키'
                            value={item.otp_token}
                            placeholder="OTP 키"
                            disabled={true}
                            InputProps={{
                              endAdornment: <IconButton onClick={async () => {
                                let result = await apiManager(`brands/otp`, 'create');
                                setItem({
                                  ...item,
                                  ['otp_token']: result?.base32,
                                })
                              }}>
                                <Icon icon='gg:redo' />
                              </IconButton>
                            }}
                          />
                        </>
                        :
                        <>
                        </>}
                      {(themeDnsData?.is_use_sign_key && user?.level >= 40) ?
                        <>
                          <TextField
                            label='SIGN KEY'
                            value={item.sign_key}
                            placeholder="SIGN KEY"
                            disabled={true}
                            InputProps={{
                              endAdornment: <IconButton onClick={async () => {
                                let result = await apiManager(`brands/sign-key`, 'create');
                                setItem({
                                  ...item,
                                  ['sign_key']: result?.rand_text,
                                })
                              }}>
                                <Icon icon='gg:redo' />
                              </IconButton>
                            }}
                          />
                        </>
                        :
                        <>
                        </>}
                      {themeDnsData?.setting_obj?.is_use_daily_withdraw == 1 &&
                        <>
                          <TextField
                            label='일일 이체한도'
                            type="number"
                            value={item.daily_withdraw_amount}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['daily_withdraw_amount']: e.target.value
                                }
                              )
                            }}
                            InputProps={{
                              endAdornment: (
                                <div>원</div>
                              )
                            }}
                          />
                        </>}
                    </Stack>
                  </Card>
                </Grid>
                {router.query?.edit_category == 'edit' &&
                  <>
                    <Grid item xs={12} md={12}>
                      <Card sx={{ height: '100%' }}>
                        <Stack spacing={3}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ padding: '1rem 0' }}>
                                <TableCell style={{ textAlign: 'center' }}>접속시간</TableCell>
                                <TableCell style={{ textAlign: 'center' }}>접속 아이피</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {ipData?.content && ipData?.content.map((itm, idx) => (
                                <>
                                  <TableRow sx={{ padding: '1rem 0' }}>
                                    <TableCell style={{ textAlign: 'center' }}>{itm?.created_at}</TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>{itm?.ip}</TableCell>
                                  </TableRow>
                                </>
                              ))}
                            </TableBody>
                          </Table>
                          <Box sx={{ padding: '0.75rem', display: 'flex', alignItems: 'center', columnGap: '0.5rem' }}>
                            <Pagination
                              style={{ margin: 'auto' }}
                              size={'medium'}
                              count={getMaxPage(ipData?.total, 10)}
                              page={ipPage}
                              variant='outlined' shape='rounded'
                              color='primary'
                              onChange={(_, num) => {
                                onChangePage({ ...ipSearchObj, page: num })
                              }} />
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  </>}
              </>}
            {currentTab == 1 &&
              <>
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={2} style={{ maxWidth: '500px', margin: 'auto' }}>
                      {ipList.map((ip, idx) => (
                        <>
                          {ip?.is_delete != 1 &&
                            <>
                              <Row>
                                <TextField
                                  sx={{ flexGrow: 1 }}
                                  size='small'
                                  label='IP'
                                  value={ip?.ip}
                                  onChange={(e) => {
                                    let ip_list = [...ipList];
                                    ip_list[idx]['ip'] = e.target.value.replaceAll(' ', '');
                                    setIpList(ip_list);
                                  }}
                                />
                                <IconButton onClick={() => {
                                  let ip_list = [...ipList];
                                  ip_list[idx].is_delete = 1;
                                  setIpList(ip_list);
                                }}>
                                  <Icon icon='material-symbols:delete-outline' />
                                </IconButton>
                              </Row>
                            </>}
                        </>
                      ))}
                      <Button variant="outlined" onClick={() => {
                        setIpList([
                          ...ipList,
                          ...[{ ip: '' }]
                        ])
                      }}>추가</Button>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1} style={{ display: 'flex' }}>
                  <Button variant="contained" style={{
                    height: '48px', width: '120px', marginLeft: 'auto'
                  }} onClick={() => {
                    setModal({
                      func: () => { onSave() },
                      icon: 'material-symbols:edit-outline',
                      title: '저장 하시겠습니까?'
                    })
                  }}>
                    저장
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </>}
    </>
  )
}
UserEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default UserEdit
