
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList, genderList, telComList } from "src/utils/format";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";
import { onlyNumberText } from "src/utils/function";
import { Row } from "src/components/elements/styled-components";


const DepositEdit = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [mchtList, setMchtList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyData, setVerifyData] = useState({
    is_check_phone: false,
    is_check_account: false,

  })
  const [item, setItem] = useState({
    virtual_acct_num: '',
    amount: 0,
    deposit_bank_code: '',
    deposit_acct_num: '',
    deposit_acct_name: '',
  })

  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    let mcht_list = await apiManager(`users`, 'list', {
      level: 10,
    })
    let data = item;
    setMchtList(mcht_list?.content ?? []);
    if (user?.level < 40) {
      let mid = _.find(mcht_list?.content, { id: parseInt(user?.id) })?.mid;
      data.mid = mid;
      data.phone_num = user?.phone_num;
      data.deposit_acct_name = user?.name;

      setItem(data);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = await apiServer(`${process.env.API_URL}/api/deposit/v${themeDnsData?.setting_obj?.api_deposit_version}`, 'create', {
      ...item,
      mid: item?.mid,
      api_key: themeDnsData?.api_key
    });
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/deposit');
    }
  }
  const onCheckPhoneNumRequest = async () => {
    let result = await apiServer(`${process.env.API_URL}/api/auth/v${themeDnsData?.setting_obj?.api_auth_version}/phone/request`, 'create', {
      ...item,
      api_key: themeDnsData?.api_key
    });
  }
  const onCheckPhoneNumCheck = async () => {
    let result = await apiServer(`${process.env.API_URL}/api/auth/v${themeDnsData?.setting_obj?.api_auth_version}/phone/check`, 'create', {
      ...item,
      api_key: themeDnsData?.api_key
    });
  }
  const onCheckAccountRequest = async () => {
    let result = await apiServer(`${process.env.API_URL}/api/auth/v${themeDnsData?.setting_obj?.api_auth_version}/account/request`, 'create', {
      ...item,
      api_key: themeDnsData?.api_key
    });
    if (result) {
      toast.success('성공적으로 발송 되었습니다.');
      setItem({
        ...item,
        mcht_trd_no: result?.mcht_trd_no,
        mcht_cust_id: result?.mcht_cust_id,
      })
    }
  }
  const onCheckAccountCheck = async () => {
    let result = await apiServer(`${process.env.API_URL}/api/auth/v${themeDnsData?.setting_obj?.api_auth_version}/account/check`, 'create', {
      ...item,
      api_key: themeDnsData?.api_key
    });
    if (result) {
      toast.success('성공적으로 인증 되었습니다.');
      setItem({
        ...item,
        is_check_account: true,
      })
    }
  }
  return (
    <>
      {!loading &&
        <>
          <Row style={{ minHeight: '100vh' }}>
            <div style={{ margin: '1rem auto', width: '90%', maxWidth: '800px' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='이름'
                        disabled={true}
                        value={item.deposit_acct_name}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['deposit_acct_name']: e.target.value
                            }
                          )
                        }}

                      />
                      {/*
                        <TextField
                        label='생년월일'
                        value={item.birth}
                        placeholder="19990101"
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['birth']: onlyNumberText(e.target.value)
                            }
                          )
                        }}

                      />
                      <FormControl >
                        <InputLabel>성별</InputLabel>
                        <Select label='성별' value={item?.gender}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['gender']: e.target.value,
                              }
                            )
                          }}>
                          {genderList.map((itm) => {
                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <InputLabel>통신사</InputLabel>
                        <Select label='통신사' value={item?.tel_com}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['tel_com']: e.target.value,
                              }
                            )
                          }}>
                          {telComList.map((itm) => {
                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <TextField
                        label='휴대폰번호'
                        value={item.phone_num}
                        placeholder="하이픈(-) 제외 입력"
                        disabled={true}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['phone_num']: onlyNumberText(e.target.value)
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                            onClick={onCheckPhoneNumRequest}>{'인증번호 발송'}</Button>
                        }}
                      />
                      <TextField
                        label='인증번호'
                        value={item.phone_vrf_word}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['phone_vrf_word']: e.target.value
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                            disabled={!item?.tx_seq_no}
                            onClick={onCheckPhoneNumCheck}>{'인증번호 확인'}</Button>
                        }}
                      />
                      
                      */}
                      <FormControl>
                        <InputLabel>은행선택</InputLabel>
                        <Select label='은행선택' value={item?.deposit_bank_code}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['deposit_bank_code']: e.target.value,
                              }
                            )
                          }}>
                          {bankCodeList().map((itm) => {
                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <TextField
                        label='계좌번호'
                        value={item.deposit_acct_num}
                        placeholder=""
                        disabled={item?.is_check_account}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['deposit_acct_num']: onlyNumberText(e.target.value)
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                            onClick={onCheckAccountRequest}
                            disabled={item?.is_check_account}
                          >{'인증번호 발송'}</Button>
                        }}
                      />
                      {item?.mcht_trd_no &&
                        <>
                          <TextField
                            label='인증번호'
                            value={item.vrf_word}
                            placeholder=""
                            disabled={item?.is_check_account}
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['vrf_word']: e.target.value
                                }
                              )
                            }}
                            InputProps={{
                              endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                                disabled={item?.is_check_account}
                                onClick={onCheckAccountCheck}>{item?.is_check_account ? '확인완료' : '인증번호 확인'}</Button>
                            }}
                          />
                        </>}
                      {(
                        item?.is_check_account
                        //&& item?.is_check_phone
                      ) &&
                        <>
                          {user?.level >= 40 &&
                            <>
                              <FormControl variant='outlined'  >
                                <InputLabel>가맹점선택</InputLabel>
                                <Select label='가맹점선택' value={item?.mid}
                                  onChange={(e) => {
                                    setItem({
                                      ...item,
                                      mid: e.target.value,
                                    })
                                  }}>
                                  {mchtList.map(mcht => {
                                    return <MenuItem value={mcht?.mid}>{`${mcht?.nickname}(${mcht?.user_name})`}</MenuItem>
                                  })}
                                </Select>
                              </FormControl>
                            </>}
                          <TextField
                            label='결제금액'
                            value={item.amount}
                            placeholder="결제금액"
                            type="number"
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['amount']: e.target.value
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
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 3 }}>
                    <Stack spacing={1} style={{ display: 'flex' }}>
                      <Button variant="contained" style={{
                        height: '48px', width: '120px', marginLeft: 'auto'
                      }}
                        disabled={!(item?.is_check_account && item?.is_check_phone)}
                        onClick={() => {
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
            </div>
          </Row>
        </>}
    </>
  )
}
DepositEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DepositEdit
