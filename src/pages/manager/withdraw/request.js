import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, commarNumber, commarNumberInput, getAllIdsWithParents, onlyNumberText } from "src/utils/function";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList } from "src/utils/format";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const WithdrawRequest = () => {

    const { user } = useAuthContext();
    const { setModal } = useModal()
    const { themeMode, themeDnsData } = useSettingsContext();

    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({
        note: '',
    })
    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = async () => {
        let api_sign_val = '';
        if (themeDnsData?.is_use_sign_key == 1) {
            api_sign_val = await apiManager('auth/sign-key', 'get',);
            api_sign_val = api_sign_val?.api_sign_val;
        }
        let data = await apiManager('auth/deposit', 'get',);
        console.log(data)
        setItem({
            ...item,
            ...data,
            api_sign_val: api_sign_val,
        });
        setLoading(false);
    }
    const onSave = async () => {
        let result = undefined
        if (themeDnsData?.setting_obj?.api_withdraw_version > 0) {
            result = await apiManager(`withdraws/request`, 'create', {
                api_key: themeDnsData?.api_key,
                mid: user?.mid,
                withdraw_amount: item?.withdraw_amount,
                note: item?.note,
                withdraw_bank_code: item?.withdraw_bank_code,
                withdraw_acct_num: item?.withdraw_acct_num,
                withdraw_acct_name: item?.withdraw_acct_name,
                identity: item?.identity,
                pay_type: 'withdraw',
                otp_num: item?.otp_num,
                guid: item?.guid,
                api_sign_val: item?.api_sign_val,
            });
        } else {
            result = await apiManager('withdraws', 'create', {
                withdraw_amount: item?.withdraw_amount,
                user_id: user?.id,
                note: item?.note,
                pay_type: 5,
            });
        }
        if (result) {
            toast.success("성공적으로 저장 되었습니다.");
            // router.push('/manager/withdraw');
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
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            입금계좌
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {themeDnsData?.withdraw_type == 0 &&
                                                <>
                                                    <Row style={{ columnGap: '0.25rem' }}>
                                                        <div>{_.find(bankCodeList('withdraw'), { value: item?.settle_bank_code })?.label}</div>
                                                        <div>{item?.settle_acct_num}</div>
                                                        <div>{item?.settle_acct_name}</div>
                                                    </Row>
                                                </>}
                                            {themeDnsData?.withdraw_type == 1 &&
                                                <>
                                                    <Row style={{ columnGap: '0.25rem' }}>
                                                        <div>{_.find(bankCodeList('withdraw'), { value: item?.withdraw_bank_code })?.label}</div>
                                                        <div>{item?.withdraw_acct_num}</div>
                                                        <div>{item?.withdraw_acct_name}</div>
                                                    </Row>
                                                </>}
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            현재 보유정산금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.settle_amount)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금 수수료
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.withdraw_fee)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            차감 보유정산금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(parseInt(item?.withdraw_amount) + (themeDnsData?.withdraw_fee_type == 0 ? item?.withdraw_fee : 0))} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금후 보유정산금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.settle_amount - item?.withdraw_amount - (themeDnsData?.withdraw_fee_type == 0 ? item?.withdraw_fee : 0))} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금 보류 금액
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.min_withdraw_hold_price)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금 가능 금액
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.settle_amount - (themeDnsData?.withdraw_fee_type == 0 ? item?.withdraw_fee : 0) - item?.min_withdraw_hold_price)} 원
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    <TextField
                                        label='출금 요청금'
                                        value={commarNumberInput(item?.withdraw_amount)}
                                        placeholder=""
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['withdraw_amount']: onlyNumberText(e.target.value)
                                                }
                                            )
                                        }} />
                                    <TextField
                                        multiline
                                        rows={5}
                                        label='메모'
                                        value={item?.note}
                                        placeholder=""
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['note']: e.target.value
                                                }
                                            )
                                        }} />
                                    {themeDnsData?.is_use_otp == 1 &&
                                        <>
                                            <TextField
                                                label='OTP번호'
                                                value={item?.otp_num}
                                                placeholder=""
                                                onChange={(e) => {
                                                    setItem(
                                                        {
                                                            ...item,
                                                            ['otp_num']: e.target.value
                                                        }
                                                    )
                                                }} />
                                        </>}
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={1} style={{ display: 'flex' }}>
                                    <Button variant="contained" style={{
                                        height: '48px', width: '120px', marginLeft: 'auto'
                                    }} onClick={() => {
                                        if (window.confirm('출금요청 하시겠습니까?')) {
                                            onSave()
                                        }
                                    }}>
                                        출금 요청하기
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
WithdrawRequest.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default WithdrawRequest
