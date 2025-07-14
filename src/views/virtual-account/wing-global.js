
import { Button, Card, CardHeader, CircularProgress, Dialog, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList, genderList, ntvFrnrList, telComList, virtualAccountUserTypeList } from "src/utils/format";
import BlankLayout from "src/layouts/BlankLayout";
import { useAuthContext } from "src/auth/useAuthContext";
import { Row } from "src/components/elements/styled-components";
import _ from "lodash";
import { onlyNumberText } from "src/utils/function";
import axios from "axios";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountWingGlobal = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();
    const { user } = useAuthContext();
    const router = useRouter();

    const [mchtList, setMchtList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [blockPage, setBlockPage] = useState(true);
    const [item, setItem] = useState({
        deposit_bank_code: '',
        deposit_acct_num: '',
        deposit_acct_name: '',
        birth: '',
        phone_num: '',
        type: 0,
        user_type: 0,
        business_num: '',
        company_name: '',
        ceo_name: '',
        company_phone_num: '',
        user_type: 0,
    })
    const [authItem, setAuthItem] = useState({})
    const [currentTab, setCurrentTab] = useState(0);

    const tab_list = [
        {
            value: 0,
            label: '가상계좌발급'
        },
        {
            value: 1,
            label: '가상계좌발급정보'
        },
    ]
    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = async () => {
        let mcht_list = await apiManager(`users`, 'list', {
            level: 10,
        })
        let data = item;
        setMchtList(mcht_list?.content ?? []);
        data.mid = router.query?.mid || user?.mid;
        if (!(user?.level >= 40) && !router.query?.mid && !user?.mid && !router.query?.id) {
            return;
        }
        if (router.query?.id) {
            data = await apiManager('virtual-accounts', 'get', {
                id: router.query.id
            })
        }
        if (router.query?.mid) {
            let mcht = await apiManager(`users/mid/${router.query?.mid}`, 'list',)
            if (mcht?.virtual_acct_link_status != 0) {
                return;
            }
        }
        if (router?.query?.phone_num) {
            data = {
                ...data,
                ...router?.query
            }
        }
        setItem(data);
        setBlockPage(false);
        setLoading(false);
    }
    const onSave = async () => {
        let result = undefined
        result = await apiServer(`${process.env.API_URL}/api/acct/v5/issuance`, 'create', { ...item, api_key: themeDnsData?.api_key, mid: item?.mid, });
        if (result?.ci) {
            toast.success("성공적으로 발급 되었습니다.");
            if (router.asPath.split('/')[1] == 'manager') {
                router.push('/manager/virtual-account');
            } else {
                router.push(`/virtual-account/result?ci=${result?.ci}`);
            }
        }
    }
    const callNice = async () => {
        let result = undefined
        result = await apiServer(`${process.env.API_URL}/api/acct/v5/nice`, 'create', { ...item, api_key: themeDnsData?.api_key, mid: item?.mid, });
        window.location.href = result?.url;
    }

    return (
        <>
            {!blockPage &&
                <>
                    <Dialog
                        open={loading}
                        onClose={() => {
                            setLoading(false)
                        }}
                        PaperProps={{
                            style: {
                                background: 'transparent',
                                overflow: 'hidden'
                            }
                        }}
                    >
                        <CircularProgress />
                    </Dialog>
                    {user?.level == 10 &&
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
                        </>}
                    <Grid container spacing={3}>
                        {currentTab == 0 &&
                            <>
                                <Grid item xs={12} md={12}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <Stack spacing={2}>
                                            {router?.query?.phone_num ?
                                                <>
                                                    <TextField
                                                        label='전화번호'
                                                        size="small"
                                                        value={item.phone_num}
                                                        placeholder=""
                                                        disabled={true}
                                                    />
                                                    <TextField
                                                        label='생년월일'
                                                        size="small"
                                                        value={item.birth}
                                                        placeholder=""
                                                        disabled={true}
                                                    />
                                                    <TextField
                                                        label='이름(예금주명)'
                                                        size="small"
                                                        value={item.deposit_acct_name}
                                                        placeholder=""
                                                        disabled={true}
                                                    />
                                                    <Stack spacing={1}>
                                                        <FormControl size="small" >
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
                                                        size="small"
                                                        label='입금계좌번호'
                                                        value={item.deposit_acct_num}
                                                        onChange={(e) => {
                                                            setItem(
                                                                {
                                                                    ...item,
                                                                    ['deposit_acct_num']: onlyNumberText(e.target.value),
                                                                }
                                                            )
                                                        }} />
                                                </>
                                                :
                                                <>
                                                    <div style={{ height: '100px' }} />
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => {
                                                            callNice();
                                                        }}
                                                    >
                                                        휴대폰인증하러 가기
                                                    </Button>
                                                    <div style={{ height: '100px' }} />
                                                </>}

                                        </Stack>
                                    </Card>
                                </Grid>
                            </>}
                        {currentTab == 1 &&
                            <>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardHeader title={`가맹점 정보`} sx={{ padding: '0', marginBottom: '2rem' }} />
                                        <Stack spacing={3}>
                                            <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                                                <Typography variant="body2" style={{ width: '150px' }}>가맹점명</Typography>
                                                <Typography variant="subtitle2">{user?.nickname}</Typography>
                                            </Row>
                                            <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                                                <Typography variant="body2" style={{ width: '150px' }}>가맹점 아이디</Typography>
                                                <Typography variant="subtitle2">{user?.user_name}</Typography>
                                            </Row>
                                            <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                                                <Typography variant="body2" style={{ width: '150px' }}>가맹점 mid</Typography>
                                                <Typography variant="subtitle2">{item?.mid}</Typography>
                                            </Row>
                                        </Stack>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardHeader title={`발급 정보`} sx={{ padding: '0', marginBottom: '2rem' }} />
                                        <Stack spacing={3}>
                                            <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                                                <Typography variant="body2" style={{ width: '150px' }}>가상계좌 발급주소</Typography>
                                                <Typography
                                                    variant="subtitle2"
                                                    style={{ color: 'blue', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        window.open('https://' + themeDnsData?.dns + `/virtual-account/${item?.mid}`)
                                                    }}
                                                >{'https://' + themeDnsData?.dns + `/virtual-account/${item?.mid}`}</Typography>
                                            </Row>
                                        </Stack>
                                    </Card>
                                </Grid>
                            </>}
                        <Grid item xs={12} md={12}>
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={1} style={{ display: 'flex' }}>

                                    <Button variant="contained"
                                        disabled={!item?.phone_num}
                                        style={{
                                            height: '48px', width: '120px', marginLeft: 'auto'
                                        }} onClick={() => {
                                            if (window.confirm('발급 하시겠습니까?')) {
                                                onSave()
                                            }
                                        }}>
                                        발급
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
export default VirtualAccountWingGlobal;