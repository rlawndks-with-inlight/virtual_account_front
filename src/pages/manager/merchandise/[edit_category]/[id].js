
import { Box, Button, Card, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Pagination, Select, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
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
    level: 10,
    user_pw: '',
    withdraw_fee: 0,
    min_withdraw_price: 0,
    max_withdraw_price: 0,
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
      label: '입금수수료정보'
    },
    ...(themeDnsData?.is_use_fee_operator == 1 ? [
      {
        value: 2,
        label: '수수료정보'
      },
    ] : []),
    {
      value: 3,
      label: '정산정보'
    },
    {
      value: 4,
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
    let operator_list = await apiManager(`users`, 'list', {
      level_list: themeDnsData?.operator_list.map(itm => {
        return itm?.value
      }),
    })
    setOperatorList(operator_list?.content ?? []);
    let data = item;

    if (router.query?.edit_category == 'edit') {
      data = await apiManager('users', 'get', {
        id: router.query.id
      })
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
    let data = { ...item };
    if (!data?.mcht_fee && themeDnsData?.is_use_fee_operator == 1) {
      return toast.error('가맹점 요율은 필수값입니다.');
    }
    delete data['ip_logs']
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
      router.push('/manager/merchandise');
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
                      {(themeDnsData?.withdraw_type == 0 || themeDnsData?.withdraw_corp_type == 6) &&
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
                            value={item.daily_withdraw_amount}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['daily_withdraw_amount']: onlyNumberText(e.target.value)
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
                              page={ipData?.page}
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
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label={`입금 수수료`}
                        value={item[`deposit_fee`]}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              [`deposit_fee`]: onlyNumberText(e.target.value)
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: <div>원</div>
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
                {user?.level >= 40 &&
                  <>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, height: '100%' }}>
                        <Stack spacing={3}>
                          {themeDnsData?.is_use_deposit_operator == 1 &&
                            <>
                              <TextField
                                label={`본사 입금수수료`}
                                value={themeDnsData?.deposit_head_office_fee}
                                disabled={true}
                                placeholder=""
                                InputProps={{
                                  endAdornment: <div>원</div>
                                }}
                              />
                              <TextField
                                label={`본사획득 입금수수료`}
                                disabled={true}
                                value={getUserDepositFee(item, 40, themeDnsData?.operator_list, themeDnsData?.deposit_head_office_fee)}
                                InputProps={{
                                  endAdornment: <div>원</div>
                                }}
                              />
                              {themeDnsData?.operator_list.map((itm, idx) => {
                                return <>
                                  <FormControl>
                                    <InputLabel>{`${itm?.label} 선택`}</InputLabel>
                                    <Select
                                      label={`${itm?.label} 선택`}
                                      value={item[`sales${itm?.num}_id`] ?? 0}
                                      onChange={e => {
                                        let obj = {
                                          ...item,
                                          [`sales${itm?.num}_id`]: e.target.value
                                        }
                                        if (!e.target.value) {
                                          obj[`sales${itm?.num}_fee`] = 0;
                                        }
                                        setItem(obj);
                                      }}
                                    >
                                      <MenuItem value={0}>선택안함</MenuItem>
                                      {operatorList && operatorList.map((operator, idx) => {
                                        if (operator?.level == itm?.value) {
                                          return <MenuItem value={operator.id}>{operator.nickname}</MenuItem>
                                        }
                                      })}
                                    </Select>
                                  </FormControl>
                                  <TextField
                                    label={`${itm?.label} 입금수수료`}
                                    value={item[`sales${itm?.num}_deposit_fee`]}
                                    disabled={!(item[`sales${itm?.num}_id`] > 0)}
                                    placeholder=""
                                    onChange={(e) => {
                                      setItem(
                                        {
                                          ...item,
                                          [`sales${itm?.num}_deposit_fee`]: onlyNumberText(e.target.value)
                                        }
                                      )
                                    }}
                                    InputProps={{
                                      endAdornment: <div>원</div>
                                    }}
                                  />
                                  <TextField
                                    type="number"
                                    label={`${itm?.label} 획득 입금수수료`}
                                    value={getUserDepositFee(item, itm.value, themeDnsData?.operator_list, themeDnsData?.deposit_head_office_fee)}
                                    disabled={true}
                                    placeholder=""
                                    InputProps={{
                                      endAdornment: <div>원</div>
                                    }}
                                  />
                                </>
                              })}
                            </>}

                        </Stack>
                      </Card>
                    </Grid>
                  </>}

              </>}
            {currentTab == 2 &&
              <>
                {user?.level >= 40 &&
                  <>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, height: '100%' }}>
                        <Stack spacing={3}>
                          <TextField
                            type="number"
                            label={`본사요율`}
                            disabled={true}
                            value={themeDnsData?.head_office_fee}
                            InputProps={{
                              endAdornment: <div>%</div>
                            }}
                          />
                          <TextField
                            type="number"
                            label={`본사획득요율`}
                            disabled={true}
                            value={getUserFee(item, 40, themeDnsData?.operator_list, themeDnsData?.head_office_fee)}
                            InputProps={{
                              endAdornment: <div>%</div>
                            }}
                          />
                        </Stack>
                      </Card>
                    </Grid>
                    {themeDnsData?.is_use_fee_operator == 1 &&
                      <>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ p: 2, height: '100%' }}>
                            <Stack spacing={3}>
                              {themeDnsData?.operator_list.map((itm, idx) => {
                                return <>
                                  <FormControl>
                                    <InputLabel>{`${itm?.label} 선택`}</InputLabel>
                                    <Select
                                      label={`${itm?.label} 선택`}
                                      value={item[`sales${itm?.num}_id`] ?? 0}
                                      onChange={e => {
                                        let obj = {
                                          ...item,
                                          [`sales${itm?.num}_id`]: e.target.value
                                        }
                                        if (!e.target.value) {
                                          obj[`sales${itm?.num}_fee`] = 0;
                                        }
                                        setItem(obj);
                                      }}
                                    >
                                      <MenuItem value={0}>선택안함</MenuItem>
                                      {operatorList && operatorList.map((operator, idx) => {
                                        if (operator?.level == itm?.value) {
                                          return <MenuItem value={operator.id}>{operator.nickname}</MenuItem>
                                        }
                                      })}
                                    </Select>
                                  </FormControl>
                                  <TextField
                                    type="number"
                                    label={`${itm?.label} 요율`}
                                    value={item[`sales${itm?.num}_fee`]}
                                    disabled={!(item[`sales${itm?.num}_id`] > 0)}
                                    placeholder=""
                                    onChange={(e) => {
                                      setItem(
                                        {
                                          ...item,
                                          [`sales${itm?.num}_fee`]: e.target.value
                                        }
                                      )
                                    }}
                                    InputProps={{
                                      endAdornment: <div>%</div>
                                    }}
                                  />
                                  <TextField
                                    type="number"
                                    label={`${itm?.label} 획득 요율`}
                                    value={getUserFee(item, itm.value, themeDnsData?.operator_list, themeDnsData?.head_office_fee)}
                                    disabled={true}
                                    placeholder=""
                                    InputProps={{
                                      endAdornment: <div>%</div>
                                    }}
                                  />
                                </>
                              })}
                            </Stack>
                          </Card>
                        </Grid>
                      </>}
                  </>}
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        type="number"
                        label={`가맹점 요율`}
                        value={item[`mcht_fee`]}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              [`mcht_fee`]: e.target.value
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: <div>%</div>
                        }}
                      />
                      <TextField
                        type="number"
                        label={`가맹점 획득 요율`}
                        disabled={true}
                        value={getUserFee(item, 10, themeDnsData?.operator_list, themeDnsData?.head_office_fee)}
                        placeholder=""
                        InputProps={{
                          endAdornment: <div>%</div>
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 3 &&
              <>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_withdraw_hold == 1} />} label={`출금보류 여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              is_withdraw_hold: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.can_return == 1} />} label={`반환가능 여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              can_return: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      {themeDnsData?.withdraw_type == 0 &&
                        <>
                          <Stack>
                            <FormControlLabel control={<Switch checked={item.can_return_ago_pay == 1} />} label={`결제를 한 회원에게만 반환가능하게 제한함`}
                              onChange={(e) => {
                                setItem({
                                  ...item,
                                  can_return_ago_pay: e.target.checked ? 1 : 0,
                                })
                              }}
                            />
                          </Stack>
                        </>}
                      {themeDnsData?.withdraw_type == 1 &&
                        <>
                          <Stack>
                            <FormControlLabel control={<Switch checked={item.is_not_same_acct_withdraw_minute == 1} />} label={`1분내 동일계좌 출금불가`}
                              onChange={(e) => {
                                setItem({
                                  ...item,
                                  is_not_same_acct_withdraw_minute: e.target.checked ? 1 : 0,
                                })
                              }}
                            />
                          </Stack>
                        </>}
                      <TextField
                        label='가맹점출금수수료'
                        value={item.withdraw_fee}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['withdraw_fee']: onlyNumberText(e.target.value)
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: (
                            <div>원</div>
                          )
                        }}
                      />

                      <TextField
                        label='최소 출금액'
                        value={item.min_withdraw_price}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['min_withdraw_price']: onlyNumberText(e.target.value)
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: (
                            <div>원</div>
                          )
                        }}
                      />
                      <TextField
                        label='최대 출금액'
                        type="number"
                        value={item.max_withdraw_price}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['max_withdraw_price']: e.target.value
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: (
                            <div>원</div>
                          )
                        }}
                      />
                      <TextField
                        label='최소 출금잔액'
                        value={item.min_withdraw_remain_price}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['min_withdraw_remain_price']: onlyNumberText(e.target.value)
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: (
                            <div>원</div>
                          )
                        }}
                      />
                      <TextField
                        label='최소 출금보류금액'
                        value={item.min_withdraw_hold_price}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['min_withdraw_hold_price']: onlyNumberText(e.target.value)
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: (
                            <div>원</div>
                          )
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
                {user?.level >= 40 &&
                  <>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, height: '100%' }}>
                        <Stack spacing={3}>
                          {themeDnsData?.is_use_withdraw_operator == 1 &&
                            <>
                              <TextField
                                label={`본사 출금수수료`}
                                value={themeDnsData?.withdraw_head_office_fee}
                                disabled={true}
                                placeholder=""
                                InputProps={{
                                  endAdornment: <div>원</div>
                                }}
                              />
                              <TextField
                                label={`본사획득 출금수수료`}
                                disabled={true}
                                value={getUserWithDrawFee(item, 40, themeDnsData?.operator_list, themeDnsData?.withdraw_head_office_fee)}
                                InputProps={{
                                  endAdornment: <div>원</div>
                                }}
                              />
                              {themeDnsData?.operator_list.map((itm, idx) => {
                                return <>
                                  <FormControl>
                                    <InputLabel>{`${itm?.label} 선택`}</InputLabel>
                                    <Select
                                      label={`${itm?.label} 선택`}
                                      value={item[`sales${itm?.num}_id`] ?? 0}
                                      onChange={e => {
                                        let obj = {
                                          ...item,
                                          [`sales${itm?.num}_id`]: e.target.value
                                        }
                                        if (!e.target.value) {
                                          obj[`sales${itm?.num}_fee`] = 0;
                                        }
                                        setItem(obj);
                                      }}
                                    >
                                      <MenuItem value={0}>선택안함</MenuItem>
                                      {operatorList && operatorList.map((operator, idx) => {
                                        if (operator?.level == itm?.value) {
                                          return <MenuItem value={operator.id}>{operator.nickname}</MenuItem>
                                        }
                                      })}
                                    </Select>
                                  </FormControl>
                                  <TextField
                                    label={`${itm?.label} 출금수수료`}
                                    value={item[`sales${itm?.num}_withdraw_fee`]}
                                    disabled={!(item[`sales${itm?.num}_id`] > 0)}
                                    placeholder=""
                                    onChange={(e) => {
                                      setItem(
                                        {
                                          ...item,
                                          [`sales${itm?.num}_withdraw_fee`]: onlyNumberText(e.target.value)
                                        }
                                      )
                                    }}
                                    InputProps={{
                                      endAdornment: <div>원</div>
                                    }}
                                  />
                                  <TextField
                                    type="number"
                                    label={`${itm?.label} 획득 출금수수료`}
                                    value={getUserWithDrawFee(item, itm.value, themeDnsData?.operator_list, themeDnsData?.withdraw_head_office_fee)}
                                    disabled={true}
                                    placeholder=""
                                    InputProps={{
                                      endAdornment: <div>원</div>
                                    }}
                                  />
                                </>
                              })}
                            </>}

                        </Stack>
                      </Card>
                    </Grid>
                  </>}

                {themeDnsData?.withdraw_type == 1 &&
                  <>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, height: '100%' }}>
                        <Stack spacing={3}>
                          <Stack spacing={1}>
                            <FormControl>
                              <InputLabel>출금계좌은행</InputLabel>
                              <Select
                                label='출금계좌은행'
                                value={item.withdraw_bank_code}
                                onChange={e => {
                                  setItem({
                                    ...item,
                                    ['withdraw_bank_code']: e.target.value
                                  })
                                }}
                              >
                                {bankCodeList('withdraw').map((itm, idx) => {
                                  return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                })}
                              </Select>
                            </FormControl>
                          </Stack>
                          <TextField
                            label='출금계좌번호'
                            value={item.withdraw_acct_num}
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_acct_num']: onlyNumberText(e.target.value)
                                }
                              )
                            }} />
                          <TextField
                            label='출금계좌예금주명'
                            value={item.withdraw_acct_name}
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_acct_name']: e.target.value
                                }
                              )
                            }} />
                          {themeDnsData?.withdraw_corp_type == 6 &&
                            <>
                              <TextField
                                label='생년월일 또는 사업자번호'
                                value={item.identity}
                                error={(item?.identity ?? "").length == 8}
                                helperText={<div style={{ color: `${(item?.identity ?? "").length == 8 ? 'red' : ''}` }}>생년월일일시 6자리 입력 ex) 990101</div>}
                                onChange={(e) => {
                                  setItem(
                                    {
                                      ...item,
                                      ['identity']: e.target.value
                                    }
                                  )
                                }} />

                            </>}
                        </Stack>
                      </Card>
                    </Grid>
                  </>}
              </>}
            {currentTab == 4 &&
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
