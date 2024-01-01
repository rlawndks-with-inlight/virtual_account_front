
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList } from "src/utils/format";
import BlankLayout from "src/layouts/BlankLayout";
import { Col, Row } from "src/components/elements/styled-components";
import _ from "lodash";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountResult = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();

    const router = useRouter();

    const [mchtList, setMchtList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({})
    useEffect(() => {
        settingPage();
    }, [])

    const settingPage = async () => {
        let data = await apiManager(`virtual-accounts/0`, 'list', {
            ci: router.query?.ci
        })
        setItem(data);
    }
    return (
        <>
            <Row>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={12} style={{ height: '100vh', display: 'flex' }}>
                        <Card sx={{ p: 2, maxWidth: '500px', margin: 'auto', width: '90%' }}>
                            <Col style={{ rowGap: '0.5rem' }}>
                                <Typography>{_.find(bankCodeList(), { value: item?.virtual_bank_code })?.label ?? "---"}</Typography>
                                <Typography>{item?.virtual_acct_num}</Typography>
                                <Typography variant="body2" style={{ color: '#aaa' }}>{item?.virtual_acct_name}</Typography>
                            </Col>
                        </Card>
                    </Grid>
                </Grid>
            </Row>
        </>
    )
}
VirtualAccountResult.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default VirtualAccountResult;