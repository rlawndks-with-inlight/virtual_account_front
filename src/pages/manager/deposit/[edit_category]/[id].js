
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

const DepositEdit = () => {
  const { setModal } = useModal()
  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [mchtList, setMchtList] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setMchtList(mcht_list?.content ?? []);
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('deposits', 'get', {
        id: router.query.id
      })
      setItem(data);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined
    if (item?.id) {//수정
      result = await apiManager('deposits', 'update', item);
    } else {//추가
      result = await apiManager('deposits', 'create', item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/deposit');
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
                    label='가상계좌번호'
                    value={item.virtual_acct_num}
                    placeholder="가상계좌번호"
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['virtual_acct_num']: e.target.value
                        }
                      )
                    }} />
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
DepositEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DepositEdit
