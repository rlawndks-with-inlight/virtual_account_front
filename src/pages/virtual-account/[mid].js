
import { Button, Card, CircularProgress, Dialog, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiServer } from "src/utils/api-manager";
import { bankCodeList } from "src/utils/format";
import BlankLayout from "src/layouts/BlankLayout";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountAddNoneAuth = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();

    const router = useRouter();

    const [mchtList, setMchtList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState({
        deposit_bank_code: '',
        deposit_acct_num: '',
        deposit_acct_name: '',
        birth: '',
        phone_num: '',
        type: 0,
    })
    const onSave = async () => {
        let result = undefined
        result = await apiServer(`${process.env.API_URL}/api/acct/v1/issuance`, 'create', { ...item, api_key: themeDnsData?.api_key, mid: router.query?.mid, });
        if (result?.tid) {
            toast.success("성공적으로 발급 되었습니다.");
            router.push(`/virtual-account/result?ci=${result?.ci}`);
        }
    }
    const oneWonCertification = async () => {
        setLoading(true);
        let result = await apiServer(`${process.env.API_URL}/api/acct/v1`, 'create', {
            mid: router.query?.mid,
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
        setLoading(false);
    }
    const checkOneWonCertification = async () => {
        let result = await apiServer(`${process.env.API_URL}/api/acct/v1/check`, 'create', {
            mid: router.query?.mid,
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
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <Card sx={{ p: 2, height: '100%' }}>
                        <Stack spacing={3}>
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

                            <Button variant="contained"
                                disabled={!item?.is_check_bank}
                                style={{
                                    height: '48px', width: '120px', marginLeft: 'auto'
                                }} onClick={() => {
                                    setModal({
                                        func: () => { onSave() },
                                        icon: 'material-symbols:edit-outline',
                                        title: '발급 하시겠습니까?'
                                    })
                                }}>
                                발급
                            </Button>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}
VirtualAccountAddNoneAuth.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default VirtualAccountAddNoneAuth;