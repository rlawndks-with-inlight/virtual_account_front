
import { Button, Card, CardHeader, CircularProgress, Dialog, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList, virtualAccountUserTypeList } from "src/utils/format";
import BlankLayout from "src/layouts/BlankLayout";
import { useAuthContext } from "src/auth/useAuthContext";
import { Col, Row } from "src/components/elements/styled-components";
import _ from "lodash";
import { commarNumber, onlyNumberText } from "src/utils/function";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountCoocon = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();
    const { user } = useAuthContext();
    const router = useRouter();

    return (
        <>
            <Row>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12} style={{ height: '100vh', display: 'flex' }}>
                        <Card sx={{ p: 2, maxWidth: '500px', margin: 'auto', width: '90%' }}>
                            <Col style={{ rowGap: '0.5rem' }}>
                                <Typography>{_.find(bankCodeList(), { value: themeDnsData?.withdraw_virtual_bank_code })?.label ?? "---"}</Typography>
                                <Typography>{themeDnsData?.withdraw_virtual_acct_num}</Typography>
                                <Typography>{commarNumber(router.query?.amount)}원</Typography>
                            </Col>
                        </Card>
                    </Grid>
                </Grid>
            </Row>
        </>
    )
}
export default VirtualAccountCoocon;