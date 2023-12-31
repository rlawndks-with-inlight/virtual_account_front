
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList } from "src/utils/format";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const VirtualAccountEdit = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();

  const router = useRouter();

  const [mchtList, setMchtList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    mid: '',
    deposit_bank_code: '',
    deposit_acct_num: '',
    deposit_acct_name: '',
    birth: '',
    phone_num: '',
    type: 0,
  })

  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    let mcht_list = await apiManager(`users`, 'list', {
      level: 10,
    })
    setMchtList(mcht_list?.content ?? []);
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('virtual-accounts', 'get', {
        id: router.query.id
      })
      setItem(data);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined
    result = await apiServer(`${process.env.API_URL}/api/acct/v1/issuance`, 'create', { ...item, api_key: themeDnsData?.api_key, });
    if (result?.tid) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/virtual-account');
    }
  }
  const oneWonCertification = async () => {
    let result = await apiServer(`${process.env.API_URL}/api/acct/v1`, 'create', {
      mid: item?.mid,
      bank_code: item?.deposit_bank_code,
      account: item?.deposit_acct_num,
      name: item?.deposit_acct_name,
      birth: item?.birth,
      phone_num: item?.phone_num,
      guid: item?.guid,
      api_key: themeDnsData?.api_key,
    });
    let data = item;
    data.guid = result?.guid;
    if (result?.tid) {
      toast.success('성공적으로 발송 되었습니다.');
      data = {
        ...data,
        is_send_one_won_check: true,
        tid: result?.tid,
      }
    }
    setItem(data);
  }
  const checkOneWonCertification = async () => {
    let result = await apiServer(`${process.env.API_URL}/api/acct/v1/check`, 'create', {
      mid: item?.mid,
      tid: item?.tid,
      vrf_word: item?.vrf_word,
      guid: item?.guid,
      api_key: themeDnsData?.api_key,
    });
    if (result?.tid) {
      toast.success('성공적으로 인증 되었습니다.');
      setItem({
        ...item,
        is_check_bank: true
      })
    }
  }
  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <TextField
                    label='MID'
                    value={item.mid}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['mid']: e.target.value
                        }
                      )
                    }} />
                  <TextField
                    label='생년월일'
                    value={item.birth}
                    placeholder="19990101"
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['birth']: e.target.value
                        }
                      )
                    }} />
                  <TextField
                    label='휴대폰번호'
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
                  <Stack spacing={1}>
                    <FormControl>
                      <InputLabel>입금은행</InputLabel>
                      <Select
                        label='입금은행'
                        value={item.deposit_bank_code}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['deposit_bank_code']: e.target.value
                          })
                        }}
                      >
                        {bankCodeList().map((itm, idx) => {
                          return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                        })}
                      </Select>
                    </FormControl>
                  </Stack>
                  <TextField
                    label='입금계좌번호'
                    value={item.deposit_acct_num}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['deposit_acct_num']: e.target.value
                        }
                      )
                    }} />
                  <TextField
                    label='입금자명'
                    value={item.deposit_acct_name}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['deposit_acct_name']: e.target.value
                        }
                      )
                    }} />
                  <Button onClick={oneWonCertification} variant="outlined" style={{ height: '48px', }}>1원인증 발송</Button>
                  {item.is_send_one_won_check &&
                    <>
                      <TextField
                        label='인증번호'
                        value={item.vrf_word}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['vrf_word']: e.target.value
                            }
                          )
                        }} />
                      <Button disabled={item?.is_check_bank} onClick={checkOneWonCertification} variant="outlined" style={{ height: '48px', }}>{item?.is_check_bank ? '확인완료' : '인증확인'}</Button>
                    </>}
                </Stack>
              </Card>
            </Grid>
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
VirtualAccountEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default VirtualAccountEdit
