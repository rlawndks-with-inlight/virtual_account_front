import { Autocomplete, Button, Card, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Col, Row, themeObj } from "src/components/elements/styled-components";
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
import { Icon } from "@iconify/react";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const WithdrawReturn = () => {

    const { user } = useAuthContext();
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [withdraws, setWithdraws] = useState([]);
    const [virtualAccounts, setVirtualAccounts] = useState([]);
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
        let virtual_accounts = await apiManager('virtual-accounts', 'list', {
            mcht_id: user?.id,
            status: 0,
        });
        setVirtualAccounts(virtual_accounts?.content ?? []);
        setLoading(false);
    }
    const onSave = async () => {
        for (var i = 0; i < withdraws.length; i++) {
            if (withdraws[i]?.is_confirm == 1) {
                continue;
            }
            let result = undefined;
            if (!item?.virtual_account_id && themeDnsData?.withdraw_type == 0) {
                return toast.error('유저를 선택해 주세요.');
            }
            if (themeDnsData?.setting_obj?.api_withdraw_version > 0) {
                if (!withdraws[i]?.withdraw_bank_code) {
                    continue;
                }
                result = await apiServer(`${process.env.API_URL}/api/withdraw/v${themeDnsData?.setting_obj?.api_withdraw_version}`, 'create', {
                    api_key: themeDnsData?.api_key,
                    mid: user?.mid,
                    withdraw_amount: withdraws[i]?.withdraw_amount,
                    note: withdraws[i]?.note,
                    withdraw_bank_code: withdraws[i]?.withdraw_bank_code,
                    withdraw_acct_num: withdraws[i]?.withdraw_acct_num,
                    withdraw_acct_name: withdraws[i]?.withdraw_acct_name,
                    pay_type: 'return',
                    otp_num: item?.otp_num,
                });
            } else {
                result = await apiManager('withdraws', 'create', {
                    withdraw_amount: withdraws[i]?.withdraw_amount,
                    user_id: user?.id,
                    virtual_account_id: withdraws[i]?.id,
                    pay_type: 20,
                    note: withdraws[i]?.note,
                });
            }

            let withdraw_list = [...withdraws];
            if (result) {
                withdraw_list[i].is_error = 0;
                withdraw_list[i].is_confirm = 1;
                if (themeDnsData?.withdraw_type == 0) {
                    toast.success("성공적으로 반환요청 되었습니다.\n" + `${_.find(bankCodeList(), { value: withdraws[i]?.virtual_bank_code })?.label} ${withdraws[i]?.virtual_acct_num} (${withdraws[i]?.virtual_acct_name})\n${_.find(bankCodeList(), { value: withdraws[i]?.deposit_bank_code })?.label} ${withdraws[i]?.deposit_acct_num} (${withdraws[i]?.deposit_acct_name})`);
                } else if (themeDnsData?.withdraw_type == 1) {
                    toast.success("성공적으로 반환요청 되었습니다.\n" + `${_.find(bankCodeList(), { value: withdraws[i]?.withdraw_bank_code })?.label} ${withdraws[i]?.withdraw_acct_num} (${withdraws[i]?.withdraw_acct_name})`);
                }
            } else {
                withdraw_list[i].is_error = 1;
            }
            setWithdraws(withdraw_list);
        }
    }
    const onCheckAcct = async (data, idx) => {
        let {
            withdraw_bank_code,
            withdraw_acct_num,
            withdraw_acct_name,
        } = data;
        let result = undefined;
        result = await apiServer(`${process.env.API_URL}/api/withdraw/v${themeDnsData?.setting_obj?.api_withdraw_version}/check`, 'create', {
            api_key: themeDnsData?.api_key,
            mid: user?.mid,
            withdraw_bank_code: withdraw_bank_code,
            withdraw_acct_num: withdraw_acct_num,
            withdraw_acct_name: withdraw_acct_name,
        });
        let withdraw_list = [...withdraws];
        withdraw_list[idx].withdraw_acct_name = result ? result?.withdraw_acct_name : '';
        setWithdraws(withdraw_list);
        return result;
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
                                            반환 수수료
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
                                            {commarNumber(_.sum(withdraws.map(itm => { return parseInt(itm?.withdraw_amount ?? 0) })) + (themeDnsData?.withdraw_fee_type == 0 ? item?.withdraw_fee : 0) * withdraws.length)} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            반환후 보유정산금
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.settle_amount - (_.sum(withdraws.map(itm => { return parseInt(itm?.withdraw_amount ?? 0) })) + (themeDnsData?.withdraw_fee_type == 0 ? item?.withdraw_fee : 0) * withdraws.length))} 원
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            반환 가능 금액
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {commarNumber(item?.settle_amount - item?.withdraw_fee * withdraws.length)} 원
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    {themeDnsData?.withdraw_type == 0 &&
                                        <>
                                            <Autocomplete
                                                fullWidth
                                                multiple={true}
                                                autoComplete='new-password'
                                                options={virtualAccounts}
                                                style={{
                                                    whiteSpace: 'pre'
                                                }}
                                                getOptionLabel={(option) => `${_.find(bankCodeList(), { value: option?.virtual_bank_code })?.label} ${option?.virtual_acct_num} (${option?.virtual_acct_name})\n${_.find(bankCodeList(), { value: option?.deposit_bank_code })?.label} ${option?.deposit_acct_num} (${option?.deposit_acct_name})`}
                                                value={withdraws}
                                                onChange={(e, value) => {
                                                    let withdraw_list = [...withdraws];
                                                    if (withdraw_list.length > value.length) {//줄어들때
                                                        for (var i = 0; i < withdraw_list.length; i++) {
                                                            let is_exist_item = false;
                                                            for (var j = 0; j < value.length; j++) {
                                                                if (value[j]?.id == withdraw_list[i]?.id) {
                                                                    is_exist_item = true;
                                                                    break;
                                                                }
                                                            }
                                                            if (!is_exist_item) {
                                                                withdraw_list.splice(i, 1);
                                                                break;
                                                            }
                                                        }
                                                    } else {//추가할때
                                                        withdraw_list.push(value[value.length - 1]);
                                                    }
                                                    setWithdraws(withdraw_list);
                                                }}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="유저선택" placeholder="유저선택" autoComplete='new-password' />
                                                )}
                                            />
                                        </>}
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
                                    {/* <FormControl variant='outlined'>
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
                                    </FormControl> */}
                                    {/*
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
                                    */}
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    {withdraws.map(((vir_acct, idx) => (
                                        <>
                                            {vir_acct?.is_confirm != 1 &&
                                                <>
                                                    <Row style={{ columnGap: '1rem' }}>
                                                        {themeDnsData?.withdraw_type == 0 &&
                                                            <>
                                                                <Typography style={{ width: '30%' }}>{`${_.find(bankCodeList(), { value: vir_acct?.virtual_bank_code })?.label} ${vir_acct?.virtual_acct_num} (${vir_acct?.virtual_acct_name})\n${_.find(bankCodeList(), { value: vir_acct?.deposit_bank_code })?.label} ${vir_acct?.deposit_acct_num} (${vir_acct?.deposit_acct_name})`}</Typography>
                                                            </>}
                                                        {themeDnsData?.withdraw_type == 1 &&
                                                            <>
                                                                <Autocomplete
                                                                    style={{ width: '50%' }}
                                                                    autoComplete='new-password'
                                                                    options={bankCodeList()}
                                                                    getOptionLabel={(option) => `${option?.label}`}
                                                                    value={_.find(bankCodeList(), { value: vir_acct.withdraw_bank_code })}
                                                                    onChange={(e, value) => {
                                                                        let withdraw_list = [...withdraws];
                                                                        withdraw_list[idx].withdraw_bank_code = value?.value;
                                                                        setWithdraws(withdraw_list);
                                                                    }}
                                                                    renderInput={(params) => (
                                                                        <TextField {...params} label="출금계좌은행" placeholder="출금계좌은행" autoComplete='new-password' />
                                                                    )}
                                                                />
                                                                <TextField
                                                                    style={{ width: '50%' }}
                                                                    label='출금계좌번호'
                                                                    value={vir_acct.withdraw_acct_num}
                                                                    error={vir_acct?.is_error == 1}
                                                                    onChange={(e) => {
                                                                        let withdraw_list = [...withdraws];
                                                                        withdraw_list[idx].withdraw_acct_num = e.target.value;
                                                                        setWithdraws(withdraw_list);
                                                                    }} />
                                                                {/* <TextField
                                                                    style={{ width: '50%' }}
                                                                    label='출금계좌예금주명'
                                                                    value={vir_acct.withdraw_acct_name}
                                                                    error={vir_acct?.is_error == 1}
                                                                    onChange={(e) => {
                                                                        let withdraw_list = [...withdraws];
                                                                        withdraw_list[idx].withdraw_acct_name = e.target.value;
                                                                        setWithdraws(withdraw_list);
                                                                    }} /> */}
                                                                <Button variant="outlined" onClick={() => {
                                                                    onCheckAcct(vir_acct, idx)
                                                                }}>조회</Button>
                                                                <TextField
                                                                    style={{ width: '50%' }}
                                                                    label='예금주확인'
                                                                    disabled={true}
                                                                    value={vir_acct.withdraw_acct_name}
                                                                    error={vir_acct?.is_error == 1}
                                                                    onChange={(e) => {
                                                                        let withdraw_list = [...withdraws];
                                                                        withdraw_list[idx].withdraw_acct_name = e.target.value;
                                                                        setWithdraws(withdraw_list);
                                                                    }} />
                                                            </>}
                                                        <TextField
                                                            style={{ width: '50%' }}
                                                            label='반환 요청금'
                                                            type="number"
                                                            value={vir_acct?.withdraw_amount}
                                                            placeholder=""
                                                            error={vir_acct?.is_error == 1}
                                                            onChange={(e) => {
                                                                let withdraw_list = [...withdraws];
                                                                withdraw_list[idx].withdraw_amount = e.target.value;
                                                                setWithdraws(withdraw_list);
                                                            }} />
                                                        <TextField
                                                            style={{ width: '50%' }}
                                                            label='메모'
                                                            value={vir_acct?.note}
                                                            placeholder=""
                                                            error={vir_acct?.is_error == 1}
                                                            onChange={(e) => {
                                                                let withdraw_list = [...withdraws];
                                                                withdraw_list[idx].note = e.target.value;
                                                                setWithdraws(withdraw_list);
                                                            }} />
                                                        <IconButton onClick={() => {
                                                            let withdraw_list = [...withdraws];
                                                            withdraw_list.splice(idx, 1);
                                                            setWithdraws(withdraw_list);
                                                        }}>
                                                            <Icon icon='material-symbols:delete-outline' />
                                                        </IconButton>
                                                    </Row>
                                                </>}
                                        </>
                                    )))}
                                </Stack>
                                {themeDnsData?.withdraw_type == 1 &&
                                    <>
                                        <Button style={{ width: '100%', height: '48px', marginTop: '1rem' }} variant="outlined" onClick={() => {
                                            let withdraw_list = [...withdraws];
                                            withdraw_list.push({
                                                withdraw_amount: 0,
                                                note: '',
                                                withdraw_bank_code: '',
                                                withdraw_acct_num: '',
                                                withdraw_acct_name: '',
                                            })
                                            setWithdraws(withdraw_list)
                                        }}>출금회원추가</Button>
                                    </>}
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
                                            title: '반환요청 하시겠습니까?'
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
