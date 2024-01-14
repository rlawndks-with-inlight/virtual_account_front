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
        result = await apiManager('deposit-requests', 'create', {
            amount: item?.amount,
            note: item?.note,
        });
        if (result) {
            toast.success("성공적으로 저장 되었습니다.");
            router.push('/manager/request-list');
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
                                            현재 보유정산금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.settle_amount)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금 가능 금액
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.settle_amount - (themeDnsData?.withdraw_fee_type == 0 ? item?.withdraw_fee : 0))} 원
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    <TextField
                                        label='충전 요청금'
                                        type="number"
                                        value={item?.amount}
                                        placeholder=""
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['amount']: parseInt(e.target.value)
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
                                            title: '충전요청 하시겠습니까?'
                                        })
                                    }}>
                                        충전 요청하기
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
