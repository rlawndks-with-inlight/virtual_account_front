
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
import { apiManager } from "src/utils/api-manager";
import { bankCodeList } from "src/utils/format";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const VirtualAccountEdit = () => {
  const { setModal } = useModal()
  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [mchtList, setMchtList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    mcht_user_name: '',
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
    if (item?.id) {//수정
      result = await apiManager('virtual-accounts', 'update', item);
    } else {//추가
      result = await apiManager('virtual-accounts', 'create', item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/virtual-account');
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
                    label='가맹점아이디'
                    value={item.mcht_user_name}
                    disabled={router.query?.edit_category == 'edit'}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['mcht_user_name']: e.target.value
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
                        {bankCodeList.map((itm, idx) => {
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
                  </Stack>
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
