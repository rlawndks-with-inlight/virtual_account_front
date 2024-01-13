import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, commarNumber, getAllIdsWithParents } from "src/utils/function";
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

    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({
        withdraw_amount: 0,
        note: '',
    })

    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = async () => {
        let data = await apiManager('auth/deposit', 'get',);
        setItem({
            ...item,
            ...data,
        });
        setLoading(false);
    }
    const onSave = async () => {
        let result = undefined
        if (themeDnsData?.setting_obj?.api_withdraw_version > 0) {
            result = await apiServer(`${process.env.API_URL}/api/withdraw/v${themeDnsData?.setting_obj?.api_withdraw_version}`, 'create', {
                api_key: themeDnsData?.api_key,
                mid: user?.mid,
                withdraw_amount: item?.withdraw_amount,
                note: item?.note,
                withdraw_bank_code: user?.withdraw_bank_code,
                withdraw_acct_num: user?.withdraw_acct_num,
                withdraw_acct_name: user?.withdraw_acct_name,
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
                                                        <div>{_.find(bankCodeList(), { value: item?.settle_bank_code })?.label}</div>
                                                        <div>{item?.settle_acct_num}</div>
                                                        <div>{item?.settle_acct_name}</div>
                                                    </Row>
                                                </>}
                                            {themeDnsData?.withdraw_type == 1 &&
                                                <>
                                                    <Row style={{ columnGap: '0.25rem' }}>
                                                        <div>{_.find(bankCodeList(), { value: item?.withdraw_bank_code })?.label}</div>
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
                                            {commarNumber(item?.withdraw_amount + item?.withdraw_fee)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금후 보유정산금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.settle_amount - item?.withdraw_amount - item?.withdraw_fee)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금 가능 금액
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.settle_amount - item?.withdraw_fee)} 원
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
                                        type="number"
                                        value={item?.withdraw_amount}
                                        placeholder=""
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['withdraw_amount']: parseInt(e.target.value)
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
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={1} style={{ display: 'flex' }}>
                                    <Button variant="contained" style={{
                                        height: '48px', width: '120px', marginLeft: 'auto'
                                    }} onClick={() => {
                                        setModal({
                                            func: () => { onSave() },
                                            icon: 'material-symbols:edit-outline',
                                            title: '출금요청 하시겠습니까?'
                                        })
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
