
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList } from "src/utils/format";
import ApiV1 from "src/views/api/v1";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountApi = () => {
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
            {!loading &&
                <>
                    {themeDnsData?.deposit_corp_type == 1 &&
                        <>
                            <ApiV1 />
                        </>}

                </>}
        </>
    )
}
VirtualAccountApi.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default VirtualAccountApi
