
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import VirtualAccountApiV1 from "src/views/api/virtual-account/v1";
import WithdrawApiV1 from "src/views/api/withdraw/v1";
import DepositApiV1 from "src/views/api/deposit/v1";
import BlankLayout from "src/layouts/BlankLayout";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})
const ApiDocs = () => {
    const { setModal } = useModal()
    const { themeMode, themeDnsData } = useSettingsContext();

    const router = useRouter();

    const [mchtList, setMchtList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({
        mid: '',
        deposit_bank_code: '',
        deposit_acct_num: '',
        deposit_acct_name: '',
        birth: '',
        phone_num: '',
        type: 0,
    })

    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = async () => {
        let mcht_list = await apiManager(`users`, 'list', {
            level: 10,
        })
        setMchtList(mcht_list?.content ?? []);
        if (router.query?.edit_category == 'edit') {
            let data = await apiManager('virtual-accounts', 'get', {
                id: router.query.id
            })
            setItem(data);
        }
        setLoading(false);
    }

    return (
        <>
            <Grid style={{ margin: '1rem' }}>
                {!loading &&
                    <>
                        {themeDnsData?.setting_obj?.api_virtual_account_version == 1 &&
                            <>
                                <VirtualAccountApiV1 />
                            </>}
                        {themeDnsData?.setting_obj?.api_withdraw_version == 1 &&
                            <>
                                <WithdrawApiV1 />
                            </>}
                        {themeDnsData?.setting_obj?.api_deposit_version == 1 &&
                            <>
                                <DepositApiV1 />
                            </>}
                    </>}
            </Grid>
        </>
    )
}

ApiDocs.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default ApiDocs;