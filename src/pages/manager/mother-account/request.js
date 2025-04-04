import { Button, Card, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, commarNumber, commarNumberInput, getAllIdsWithParents, getNumberByPercent, onlyNumberText, returnMoment } from "src/utils/function";
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

const MotherAccountRequest = () => {

    const { user } = useAuthContext();
    const { setModal } = useModal();
    const { themeDnsData } = useSettingsContext();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({
        withdraw_amount: 0,
    })

    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = async () => {
        let data = await apiManager('withdraws/mother', 'get',);
        setItem({
            ...item,
            ...data,
        });
        setLoading(false);
    }
    const onSave = async () => {
        let result = undefined
        result = await apiManager('withdraws/mother', 'create', {
            withdraw_amount: item?.withdraw_amount,
            user_id: user?.id,
            pay_type: 10,
            note: item?.note,
            is_deposit: item?.is_deposit ?? 0,
        });

        if (result) {
            toast.success("성공적으로 저장 되었습니다.");
            router.push('/manager/withdraw');
        }
    }
    const getManagerAmount = () => {
        let real_amount = item?.real_amount;
        real_amount -= item?.sum?.total_mcht_amount;
        real_amount -= item?.sum?.total_oper_amount;
        real_amount -= (_.sum(item?.childrens.map(children => { return children?.real_amount })) ?? 0);

        if (returnMoment().split(' ')[1] <= '23:55:00') {
            real_amount += (_.sum(item?.childrens.map(children => { return ((children?.brand?.deposit_head_office_fee ?? 330) * children?.sum?.total_deposit_count + (children?.brand?.deposit_head_office_fee ?? 330) * children?.sum?.total_withdraw_count) })) ?? 0);
            real_amount += (_.sum(item?.childrens.map(children => { return getNumberByPercent(children?.sum?.total_deposit_amount, (children?.brand?.head_office_fee)) })) ?? 0);
        }
        return real_amount;
    }

    return (
        <>
            {loading &&
                <>
                    <Row>
                        <CircularProgress sx={{ margin: 'auto' }} />
                    </Row>
                </>}
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
                                            <Row style={{ columnGap: '0.25rem' }}>
                                                <div>{_.find(bankCodeList('withdraw'), { value: item?.brand?.settle_bank_code })?.label}</div>
                                                <div>{item?.brand?.settle_acct_num}</div>
                                                <div>{item?.brand?.settle_acct_name}</div>
                                            </Row>
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            모계좌 잔액
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.real_amount)} 원
                                        </Typography>
                                    </Stack>
                                    {item?.hold_deposit_amount > 0 &&
                                        <>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                                    모계좌 보류금액
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {commarNumber(item?.hold_deposit_amount)} 원
                                                </Typography>
                                            </Stack>
                                        </>}
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금 수수료
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            0 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금후 잔액
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.real_amount - item?.withdraw_amount)} 원
                                        </Typography>
                                    </Stack>
                                    {item?.childrens && item?.childrens.map((children, idx) => (
                                        <>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                                    하위전산 {children?.brand?.name} 모계좌 잔액
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {commarNumber(children?.real_amount)} 원
                                                </Typography>
                                            </Stack>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                                    하위전산 {children?.brand?.name} 지불 입금 요율
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {commarNumber(getNumberByPercent(children?.sum?.total_deposit_amount, (children?.brand?.head_office_fee)))} 원
                                                </Typography>
                                            </Stack>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                                    하위전산 {children?.brand?.name} 지불 입금수수료
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {commarNumber((children?.brand?.deposit_head_office_fee ?? 330) * children?.sum?.total_deposit_count)} 원
                                                </Typography>
                                            </Stack>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                                    하위전산 {children?.brand?.name} 지불 출금수수료
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {commarNumber((children?.brand?.withdraw_head_office_fee ?? 330) * children?.sum?.total_withdraw_count)} 원
                                                </Typography>
                                            </Stack>
                                        </>
                                    ))}
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            가맹점 보유정산금총합
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.sum?.total_mcht_amount)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            가맹점 관리자지급금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.sum?.total_manager_mcht_give_amount)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            가맹점 출금요청금 및 출금실패 및 출금반려금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.sum?.total_attempt_mcht_withdraw_amount)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            영업자 보유정산금총합
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.sum?.total_oper_amount)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            영업자 관리자지급금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.sum?.total_manager_oper_give_amount)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            영업자 출금요청금 및 출금실패 및 출금반려금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.sum?.total_attempt_oper_withdraw_amount)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            관리자 지급금 & 출금요청 및 실패 및 출금반려금 차액
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.sum?.total_manager_mcht_give_amount + item?.sum?.total_manager_oper_give_amount + item?.sum?.total_attempt_mcht_withdraw_amount + item?.sum?.total_attempt_oper_withdraw_amount)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            차액 (본사 보유정산금)
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(getManagerAmount())} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            출금 가능 금액
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(parseInt(item?.real_amount ?? 0) + parseInt(item?.hold_deposit_amount ?? 0))} 원
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    {(themeDnsData?.withdraw_corp_type == 7 && themeDnsData?.deposit_process_type == 0) &&
                                        <>
                                            <Stack spacing={1}>
                                                <FormControl>
                                                    <InputLabel>출금 타입</InputLabel>
                                                    <Select
                                                        label='출금 타입'
                                                        value={item.is_deposit ?? 0}
                                                        onChange={e => {
                                                            setItem({
                                                                ...item,
                                                                ['is_deposit']: e.target.value
                                                            })
                                                        }}
                                                    >
                                                        <MenuItem value={0}>잔액</MenuItem>
                                                        <MenuItem value={1}>보류금액</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Stack>
                                        </>}
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
MotherAccountRequest.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default MotherAccountRequest
