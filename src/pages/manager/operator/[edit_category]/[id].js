
import { Button, Card, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Select, Stack, Switch, TextField, Typography } from "@mui/material";
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
import { bankCodeList, operatorLevelList } from "src/utils/format";
import { useAuthContext } from "src/auth/useAuthContext";
import { onlyNumberText } from "src/utils/function";
import { Icon } from "@iconify/react";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const UserEdit = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ipList, setIpList] = useState([]);
  const [item, setItem] = useState({
    profile_file: undefined,
    user_name: '',
    phone_num: '',
    nickname: '',
    name: '',
    email: '',
    level: 10,
    user_pw: '',
    note: '',
    withdraw_fee: 0,
    min_withdraw_price: 0,
    max_withdraw_price: 0,
    min_withdraw_remain_price: 0,
    min_withdraw_hold_price: 0,
    guid: '',
    is_withdraw_hold: 0,
  })
  const tab_list = [
    {
      value: 0,
      label: '기본정보'
    },
    {
      value: 1,
      label: '정산정보'
    },
    {
      value: 3,
      label: '허용 IP',
    },
  ]
  useEffect(() => {
    if (router.query?.tab >= 0) {
      setCurrentTab(router.query?.tab ?? 0);
    }
    settingPage();
  }, [router.query])
  const settingPage = async () => {
    let data = item;
    if (router.query?.edit_category == 'edit') {
      data = await apiManager('users', 'get', {
        id: router.query.id
      })
      setIpList(data?.ip_list);
    } else {
      data = {};
      for (var i = 0; i < operatorLevelList.length; i++) {
        if (themeDnsData?.level_obj[`is_use_sales${5 - i}`] == 1) {
          data.level = operatorLevelList[i].value;
          break;
        }
      }
    }
    if (router.query?.edit_category == 'add') {
      data['withdraw_fee'] = themeDnsData?.default_withdraw_fee;
      data['deposit_fee'] = themeDnsData?.default_deposit_fee;
    }
    setItem(data);
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined
    if (item?.id) {//수정
      result = await apiManager('users', 'update', { ...item, ip_list: ipList });
    } else {//추가
      result = await apiManager('users', 'create', { ...item, ip_list: ipList });
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push(`/manager/operator/list/${item.level}`);
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

                      {user?.level >= 50 &&
                        <>
                          <TextField
                            label='하위브랜드도메인'
                            value={item.children_brand_dns}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['children_brand_dns']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      <Stack spacing={1}>
                        <FormControl disabled={router.query?.id || router.query?.edit_category != 'add'}>
                          <InputLabel>영업자레벨</InputLabel>
                          <Select
                            label='영업자레벨'
                            value={item.level}
                            onChange={e => {
                              setItem({
                                ...item,
                                ['level']: e.target.value
                              })
                            }}
                          >
                            {operatorLevelList.map((itm, idx) => {
                              if (themeDnsData?.level_obj[`is_use_sales${5 - idx}`] != 1) {
                                return;
                              }
                              return <MenuItem value={itm.value}>{themeDnsData?.level_obj[`sales${5 - idx}_name`]}</MenuItem>
                            })}
                          </Select>
                        </FormControl>
                      </Stack>
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
                      {(
                        //themeDnsData?.is_use_otp &&
                        user?.level >= 40)
                        ?
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
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 1 &&
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
                      <TextField
                        label='출금수수료'
                        type="number"
                        value={item.withdraw_fee}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['withdraw_fee']: e.target.value
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
                        type="number"
                        value={item.min_withdraw_price}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['min_withdraw_price']: e.target.value
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
                        type="number"
                        value={item.min_withdraw_remain_price}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['min_withdraw_remain_price']: e.target.value
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
                        type="number"
                        value={item.min_withdraw_hold_price}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['min_withdraw_hold_price']: e.target.value
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
                                      ['identity']: onlyNumberText(e.target.value)
                                    }
                                  )
                                }} />

                            </>}
                        </Stack>
                      </Card>
                    </Grid>
                  </>}
              </>}
            {currentTab == 3 &&
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
