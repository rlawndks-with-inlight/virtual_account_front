import { Autocomplete, Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Col, Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, commarNumber, getAllIdsWithParents } from "src/utils/function";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager } from "src/utils/api-manager";
import { bankCodeList } from "src/utils/format";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const WithdrawReturn = () => {

    const { user } = useAuthContext();
    const { setModal } = useModal()
    const { themeMode } = useSettingsContext();

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [virtualAccounts, setVirtualAccounts] = useState([]);
    const [item, setItem] = useState({
        withdraw_amount: 0,
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
        let virtual_accounts = await apiManager('virtual-accounts', 'list', {
            mcht_id: user?.id,
            status: 0,
        });
        setVirtualAccounts(virtual_accounts?.content ?? []);
        setLoading(false);
    }
    const onSave = async () => {
        let result = undefined
        if (!item?.virtual_account_id) {
            return toast.error('유저를 선택해 주세요.');
        }
        result = await apiManager('withdraws', 'create', {
            withdraw_amount: item?.withdraw_amount,
            user_id: user?.id,
            virtual_account_id: item?.virtual_account_id,
            pay_type: 20,
        });
        if (result) {
            toast.success("성공적으로 저장 되었습니다.");
            router.push('/manager/withdraw');
        }
    }
    return (
        <>
            {!loading &&
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
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
                                            {commarNumber(item?.settle_amount - item?.withdraw_amount)} 원
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
                        <Grid item xs={12} md={6}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    <FormControl variant='outlined'>
                                        <InputLabel>{'유저선택'}</InputLabel>
                                        <Select label={'유저선택'} value={item?.virtual_account_id}
                                            sx={{ fontSize: '0.8rem' }}
                                            onChange={(e) => {
                                                setItem({
                                                    ...item,
                                                    virtual_account_id: e.target.value
                                                })
                                            }}>
                                            {virtualAccounts.map(virtual_account => {
                                                return <MenuItem value={virtual_account?.id} sx={{ fontSize: '0.8rem' }}>
                                                    <Col>
                                                        <div>{`${_.find(bankCodeList(), { value: virtual_account?.virtual_bank_code })?.label} ${virtual_account?.virtual_acct_num} (${virtual_account?.virtual_acct_name})`}</div>
                                                        <div style={{ color: '#aaa' }}>{`${_.find(bankCodeList(), { value: virtual_account?.deposit_bank_code })?.label} ${virtual_account?.deposit_acct_num} (${virtual_account?.deposit_acct_name})`}</div>
                                                    </Col>
                                                </MenuItem>
                                            })}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label='반환 요청금'
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
                                            title: '출금요청 하시겠습니까?'
                                        })
                                    }}>
                                        반환 요청하기
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
WithdrawReturn.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default WithdrawReturn
