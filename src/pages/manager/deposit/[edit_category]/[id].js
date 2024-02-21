
import { Button, Card, CircularProgress, Dialog, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
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
import { Icon } from "@iconify/react";


const DepositEdit = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [mchtList, setMchtList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyData, setVerifyData] = useState({
    is_check_phone: false,
    is_check_account: false,

  })
  const [item, setItem] = useState({
    virtual_acct_num: '',
    deposit_bank_code: '',
    deposit_acct_num: '',
    deposit_acct_name: '',
  })
  const [deposits, setDeposits] = useState([]);
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
    let deposit_list = [...deposits];
    for (var i = 0; i < deposit_list.length; i++) {
      let result = await apiServer(`${process.env.API_URL}/api/deposit/v${themeDnsData?.setting_obj?.api_deposit_version}`, 'create', {
        ...deposit_list[i],
        mid: deposit_list[i]?.mid,
        api_key: themeDnsData?.api_key
      });
      if (result) {
        deposit_list[i].is_error = 0;
        deposit_list[i].is_confirm = 1;
        toast.success("성공적으로 결제내역 추가 되었습니다.\n" + `${_.find(bankCodeList(), { value: deposit_list[i]?.deposit_bank_code })?.label} ${deposit_list[i]?.deposit_acct_num} (${deposit_list[i]?.deposit_acct_name})`);
      } else {
        deposit_list[i].is_error = 1;
      }
    }
    let is_exist_error = false;
    let deposit_result_list = [];
    for (var i = 0; i < deposit_list.length; i++) {
      if (deposit_list[i]?.is_confirm != 1) {
        deposit_result_list.push(deposit_list[i]);
      }
      if (deposit_list[i]?.is_error == 1) {
        is_exist_error = true;
      }
    }
    setDeposits(deposit_result_list);
    setTimeout(() => {
      setPageLoading(false);
      if (is_exist_error) {
        setErrorAlert(true);
      }
    }, 1000);
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
      <Dialog open={pageLoading}
        PaperProps={{
          style: {
            background: 'transparent',
            overflow: 'hidden'
          }
        }}
      >
        <CircularProgress />
      </Dialog>
      {!loading &&
        <>
          <Row style={{ minHeight: '100vh' }}>
            <div style={{ margin: '1rem auto', width: '90%', maxWidth: '1000px' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Row style={{ marginLeft: 'auto', columnGap: '0.5rem' }}>
                        <Button variant="outlined">엑셀양식추출</Button>
                        <Button variant="contained">엑셀등록</Button>
                      </Row>
                      {deposits.map((deposit, idx) => (
                        <>
                          <Row style={{ columnGap: '1rem' }}>
                            <TextField
                              style={{ width: '50%' }}
                              label='이름'
                              value={deposit.deposit_acct_name}
                              placeholder=""
                              onChange={(e) => {
                                let deposit_list = [...deposits];
                                deposit_list[idx].deposit_acct_name = e.target.value;
                                setDeposits(deposit_list);
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
                            <FormControl style={{ width: '50%' }}>
                              <InputLabel>은행선택</InputLabel>
                              <Select label='은행선택' value={deposit?.deposit_bank_code}
                                onChange={(e) => {
                                  let deposit_list = [...deposits];
                                  deposit_list[idx].deposit_bank_code = e.target.value;
                                  setDeposits(deposit_list);
                                }}>
                                {bankCodeList().map((itm) => {
                                  return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                })}
                              </Select>
                            </FormControl>
                            <TextField
                              style={{ width: '50%' }}
                              label='계좌번호'
                              value={deposit.deposit_acct_num}
                              placeholder=""
                              onChange={(e) => {
                                let deposit_list = [...deposits];
                                deposit_list[idx].deposit_acct_num = onlyNumberText(e.target.value);
                                setDeposits(deposit_list);
                              }}
                            // InputProps={{
                            //   endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                            //     onClick={onCheckAccountRequest}
                            //     disabled={item?.is_check_account}
                            //   >{'인증번호 발송'}</Button>
                            // }}
                            />
                            {/*
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
                      
                      */}
                            {user?.level >= 40 &&
                              <>
                                <FormControl variant='outlined' style={{ width: '50%' }}>
                                  <InputLabel>가맹점선택</InputLabel>
                                  <Select label='가맹점선택' value={deposit?.mid}
                                    onChange={(e) => {
                                      let deposit_list = [...deposits];
                                      deposit_list[idx].mid = e.target.value;
                                      setDeposits(deposit_list);
                                    }}>
                                    {mchtList.map(mcht => {
                                      return <MenuItem value={mcht?.mid}>{`${mcht?.nickname}(${mcht?.user_name})`}</MenuItem>
                                    })}
                                  </Select>
                                </FormControl>
                              </>}
                            <TextField
                              style={{ width: '50%' }}
                              label='결제금액'
                              value={deposit.amount}
                              placeholder="결제금액"
                              onChange={(e) => {
                                let deposit_list = [...deposits];
                                deposit_list[idx].amount = onlyNumberText(e.target.value);
                                setDeposits(deposit_list);
                              }}
                              InputProps={{
                                endAdornment: (
                                  <div>원</div>
                                )
                              }}
                            />
                            <IconButton onClick={() => {
                              let deposit_list = [...deposits];
                              deposit_list.splice(idx, 1);
                              setDeposits(deposit_list);
                            }}>
                              <Icon icon='material-symbols:delete-outline' />
                            </IconButton>
                          </Row>
                        </>
                      ))}

                      <Button style={{ width: '100%', height: '48px', marginTop: '1rem' }} variant="outlined" onClick={() => {
                        let deposit_list = [...deposits];
                        deposit_list.push({
                          mid: user?.level == 10 ? user?.mid : '',
                        })
                        setDeposits(deposit_list)
                      }}>결제내역추가</Button>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 3 }}>
                    <Stack spacing={1} style={{ display: 'flex' }}>
                      <Button variant="contained" style={{
                        height: '48px', width: '120px', marginLeft: 'auto'
                      }}
                        // disabled={!(
                        //   item?.is_check_account
                        //   // && item?.is_check_phone
                        // )}
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
