
import { Button, Card, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Stack, Switch, TextField, Typography } from "@mui/material";
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
import { getUserFee } from "src/utils/function";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const UserEdit = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [operatorList, setOperatorList] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
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
    min_withdraw_remain_price: 0,
    min_withdraw_hold_price: 0,
    is_send_one_won_check: false,
    vrf_bank_code: '',
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
      label: '수수료정보'
    },
    {
      value: 2,
      label: '정산정보'
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
    }
    if (router.query?.edit_category == 'add') {
      data['withdraw_fee'] = themeDnsData?.default_withdraw_fee;
      data['deposit_fee'] = themeDnsData?.default_deposit_fee;
    }
    setItem(data);
    setLoading(false);
  }
  const onSave = async () => {
    if (!item?.mcht_fee) {
      return toast.error('가맹점 요율은 필수값입니다.');
    }
    let result = undefined
    if (item?.id) {//수정
      result = await apiManager('users', 'update', item);
    } else {//추가
      result = await apiManager('users', 'create', item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/merchandise');
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
                              ['phone_num']: e.target.value
                            }
                          )
                        }} />

                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
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
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 1 &&
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
                      <TextField
                        type="number"
                        label={`입금 수수료`}
                        value={item[`deposit_fee`]}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              [`deposit_fee`]: e.target.value
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
              </>}
            {currentTab == 2 &&
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
                        <FormControlLabel control={<Switch checked={item.can_return_ago_pay == 1} />} label={`결제를 한 회원에게만 반환가능하게 제한함`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              can_return_ago_pay: e.target.checked ? 1 : 0,
                            })
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
