
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
import { getMaxPage, getUserFee, getUserWithDrawFee, onlyNumberText } from "src/utils/function";
import { bankCodeList } from "src/utils/format";
import { Icon } from "@iconify/react";
import { useAuthContext } from "src/auth/useAuthContext";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const DepositAccountEdit = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [mchtList, setMchtList] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [ipPage, setIpPage] = useState(1);
  const [item, setItem] = useState({
    bank_code: '',
    acct_num: '',
    acct_name: '',
  })
  useEffect(() => {
    if (router.query?.tab >= 0) {
      setCurrentTab(router.query?.tab ?? 0);
    }
    settingPage();
  }, [])
  const settingPage = async () => {
    if (user?.level >= 40) {
      let mcht_list = await apiManager(`users`, 'list', {
        level: 10,
      })
      setMchtList(mcht_list?.content ?? []);
    }
    let data = item;

    if (router.query?.edit_category == 'edit') {
      data = await apiManager('deposit-accounts', 'get', {
        id: router.query.id
      })
    }
    setItem(data);
    setLoading(false);
  }
  const onSave = async () => {
    let data = item;
    let result = undefined
    if (data?.id) {//수정
      result = await apiManager('deposit-accounts', 'update', data);
    } else {//추가
      result = await apiManager('deposit-accounts', 'create', data);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/deposit-account');
    }
  }

  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  {user?.level >= 40 &&
                    <>
                      <FormControl variant='outlined'  >
                        <InputLabel>가맹점선택</InputLabel>
                        <Select label='가맹점선택' value={item?.mcht_id}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              mcht_id: e.target.value,
                            })
                          }}>
                          {mchtList.map(mcht => {
                            return <MenuItem value={mcht?.id}>{`${mcht?.nickname}(${mcht?.user_name})`}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                    </>}

                  <Stack spacing={1}>
                    <FormControl>
                      <InputLabel>은행</InputLabel>
                      <Select
                        label='은행'
                        value={item.bank_code}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['bank_code']: e.target.value
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
                    label='계좌번호'
                    value={item.acct_num}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['acct_num']: onlyNumberText(e.target.value)
                        }
                      )
                    }} />
                  <TextField
                    label='예금주명'
                    value={item.acct_name}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['acct_name']: e.target.value
                        }
                      )
                    }} />
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>

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
                          {item?.ip_logs && item?.ip_logs.splice((ipPage - 1) * 10, ipPage * 10).map((itm, idx) => (
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
                          count={getMaxPage(item?.ip_logs.length, 10)}
                          page={ipPage}
                          variant='outlined' shape='rounded'
                          color='primary'
                          onChange={(_, num) => {
                            setIpPage(num)
                          }} />
                      </Box>
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
DepositAccountEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DepositAccountEdit
