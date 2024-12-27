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

const WithdrawCheck = () => {

    const { user } = useAuthContext();
    const { setModal } = useModal()
    const { themeMode, themeDnsData } = useSettingsContext();

    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState({
        note: '',
    })

    const onCheckAcct = async () => {

        let result = undefined;
        result = await apiManager(`withdraws/check`, 'create', {
            api_key: themeDnsData?.api_key,
            mid: user?.mid,
            withdraw_bank_code: item?.withdraw_bank_code,
            withdraw_acct_num: item?.withdraw_acct_num,
        });
        /*
        result = await apiServer(`${process.env.API_URL}/api/withdraw/v${themeDnsData?.setting_obj?.api_withdraw_version}/check`, 'create', {
            api_key: themeDnsData?.api_key,
            mid: user?.mid,
            withdraw_bank_code: withdraw_bank_code,
            withdraw_acct_num: withdraw_acct_num,
            withdraw_acct_name: withdraw_acct_name,
        });
        */
        if (result) {
            setItem({
                ...item,
                withdraw_acct_name: result?.withdraw_acct_name,
            })
        }
    }
    return (
        <>
            {!loading &&
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4} style={{ margin: 'auto' }}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    <Stack spacing={1}>
                                        <FormControl>
                                            <InputLabel>은행</InputLabel>
                                            <Select
                                                label='은행'
                                                value={item.withdraw_bank_code}
                                                onChange={e => {
                                                    setItem({
                                                        ...item,
                                                        ['withdraw_bank_code']: e.target.value
                                                    })
                                                }}
                                            >
                                                {bankCodeList('withdraw').map((itm, idx) => {
                                                    return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                                })}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                    <TextField
                                        label='계좌번호'
                                        value={item.withdraw_acct_num}
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['withdraw_acct_num']: onlyNumberText(e.target.value)
                                                }
                                            )
                                        }} />
                                    <TextField
                                        label='출금계좌예금주명'
                                        value={item.withdraw_acct_name}
                                        disabled={true}
                                        placeholder=""
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['withdraw_acct_name']: e.target.value
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
                                        if (window.confirm('조회 하시겠습니까?')) {
                                            onCheckAcct()
                                        }
                                    }}>
                                        예금주조회
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
WithdrawCheck.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default WithdrawCheck
