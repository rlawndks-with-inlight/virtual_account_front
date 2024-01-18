
import { Button, Card, CircularProgress, Dialog, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiServer } from "src/utils/api-manager";
import { bankCodeList, virtualAccountUserTypeList } from "src/utils/format";
import BlankLayout from "src/layouts/BlankLayout";
import VirtualAccountBankners from "src/views/virtual-account/bankners";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountAddNoneAuth = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();

    console.log(themeDnsData)
    return (
        <>
            {themeDnsData?.deposit_corp_type == 1 &&
                <>
                    <VirtualAccountBankners />
                </>}
            {themeDnsData?.deposit_corp_type == 3 &&
                <>

                </>}
        </>
    )
}
VirtualAccountAddNoneAuth.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default VirtualAccountAddNoneAuth;