
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
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
    level: 10,
    user_pw: '',
    settle_bank_code: '',
    settle_acct_num: '',
    settle_acct_name: '',
    withdraw_fee: 0,
    min_withdraw_price: 0,
    min_withdraw_remain_price: 0,
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
    settingPage();
  }, [])
  const settingPage = async () => {
    let operator_list = await apiManager(`users`, 'list', {
      level_list: themeDnsData?.operator_list.map(itm => {
        return itm?.value
      }),
    })
    setOperatorList(operator_list?.content ?? []);
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('users', 'get', {
        id: router.query.id
      })
      setItem(data);
    }
    setLoading(false);
  }
  const onSave = async () => {
    if (!item.settle_bank_code) {
      return toast.error('정산 입금은행을 선택해 주세요.');
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
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
              </>}
            {currentTab == 1 &&
              <>
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {operatorLevelList.map((itm, idx) => {
                        if (themeDnsData?.level_obj[`is_use_sales${5 - idx}`] == 1) {
                          return <Row style={{ columnGap: '1rem' }}>
                            <FormControl style={{ width: '50%' }}>
                              <InputLabel>{`${themeDnsData?.level_obj[`sales${5 - idx}_name`]} 선택`}</InputLabel>
                              <Select
                                label={`${themeDnsData?.level_obj[`sales${5 - idx}_name`]} 선택`}
                                value={item[`sales${5 - idx}_id`] ?? 0}
                                onChange={e => {
                                  let obj = {
                                    ...item,
                                    [`sales${5 - idx}_id`]: e.target.value
                                  }
                                  if (!e.target.value) {
                                    obj[`sales${5 - idx}_fee`] = 0;
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
                              style={{ width: '50%' }}
                              type="number"
                              label={`${themeDnsData?.level_obj[`sales${5 - idx}_name`]} 수수료`}
                              value={item[`sales${5 - idx}_fee`]}
                              placeholder=""
                              onChange={(e) => {
                                setItem(
                                  {
                                    ...item,
                                    [`sales${5 - idx}_fee`]: e.target.value
                                  }
                                )
                              }}
                              InputProps={{
                                endAdornment: <div>%</div>
                              }}
                            />
                          </Row>
                        }
                      })}
                      <Row>

                      </Row>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 2 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <FormControl>
                          <InputLabel>정산 입금은행</InputLabel>
                          <Select
                            label='정산 입금은행'
                            value={item.settle_bank_code}
                            onChange={e => {
                              setItem({
                                ...item,
                                ['settle_bank_code']: e.target.value
                              })
                            }}
                          >
                            {bankCodeList.map((itm, idx) => {
                              return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                            })}
                          </Select>
                        </FormControl>
                      </Stack>
                      <TextField
                        label='정산 계좌번호'
                        value={item.settle_acct_num}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['settle_acct_num']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='정산 예금주'
                        value={item.settle_acct_name}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['settle_acct_name']: e.target.value
                            }
                          )
                        }} />
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
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
                        }} />
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
                        }} />
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
                        }} />
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
