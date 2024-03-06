
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useRouter } from "next/router";
import { Row, themeObj, Col } from "src/components/elements/styled-components";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager, apiServer } from "src/utils/api-manager";
import VirtualAccountApiV1 from "src/views/api/virtual-account/v1";
import WithdrawApiV1 from "src/views/api/withdraw/v1";
import DepositApiV1 from "src/views/api/deposit/v1";
import BlankLayout from "src/layouts/BlankLayout";
import VirtualAccountApiV2 from "src/views/api/virtual-account/v2";
import styled from "styled-components";

export const Title2 = styled.h2`
margin: 1rem auto;
font-size:${themeObj.font_size.size3};
font-weight:bold;
@media (max-width:1000px) {
  font-size:${themeObj.font_size.size5};
}
`

export const Title3 = styled.h3`
margin: 1rem auto 1rem 0;
font-size:${themeObj.font_size.size6};
font-weight:bold;
white-space: pre;
@media (max-width:1000px) {
  font-size:${themeObj.font_size.size7};
}
`
const ApiDocs = () => {
    const { themeDnsData } = useSettingsContext();

    const [tableObj, setTableObj] = useState({});
    const [loading, setLoading] = useState(true);
    const tab_list = [
        ...(themeDnsData?.setting_obj?.api_virtual_account_version == 1 ? [...VirtualAccountApiV1().tab_list.map(itm => { return { ...itm, value: `${VirtualAccountApiV1().tab_key}_${itm.value}` } })] : []),
        ...(themeDnsData?.setting_obj?.api_virtual_account_version == 2 ? [...VirtualAccountApiV2().tab_list.map(itm => { return { ...itm, value: `${VirtualAccountApiV2().tab_key}_${itm.value}` } })] : []),
        ...(themeDnsData?.setting_obj?.api_withdraw_version == 1 ? [...WithdrawApiV1().tab_list.map(itm => { return { ...itm, value: `${WithdrawApiV1().tab_key}_${itm.value}` } })] : []),
        ...(themeDnsData?.setting_obj?.api_deposit_version == 1 ? [...DepositApiV1().tab_list.map(itm => { return { ...itm, value: `${DepositApiV1().tab_key}_${itm.value}` } })] : []),
    ]
    const [currentTab, setCurrentTab] = useState(tab_list[0]?.value);

    useEffect(() => {
        settingTableObj();
    }, [])

    const settingTableObj = () => {
        try {
            let result = {};
            if (themeDnsData?.setting_obj?.api_virtual_account_version == 1) {
                result = { ...result, ...settingKeyObj(VirtualAccountApiV1().table_obj, VirtualAccountApiV1().tab_key) };
            }
            if (themeDnsData?.setting_obj?.api_virtual_account_version == 2) {
                result = { ...result, ...settingKeyObj(VirtualAccountApiV2().table_obj, VirtualAccountApiV2().tab_key) };
            }
            if (themeDnsData?.setting_obj?.api_withdraw_version == 1) {
                result = { ...result, ...settingKeyObj(WithdrawApiV1().table_obj, WithdrawApiV1().tab_key) };
            }
            if (themeDnsData?.setting_obj?.api_deposit_version == 1) {
                result = { ...result, ...settingKeyObj(DepositApiV1().table_obj, DepositApiV1().tab_key) };
            }
            setTableObj(result);
            setLoading(false);
        } catch (err) {
            console.log(err);
        }
    }
    const settingKeyObj = (table_obj = {}, key_name) => {
        try {
            console.log(table_obj)
            let key_list = Object.keys(table_obj);
            let result = {};
            for (var i = 0; i < key_list.length; i++) {
                result[`${key_name}_${key_list[i]}`] = table_obj[key_list[i]];
            }
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    const returnTable = (table_head = [], table_body = []) => {
        if (table_head.length > 0 && table_body.length > 0) {
            return <Table style={{ border: '1px solid #ccc' }}>
                <TableHead>
                    <TableRow sx={{ padding: '1rem 0' }}>
                        {table_head.map(text => (
                            <>
                                <TableCell style={{ textAlign: 'center' }}>
                                    {text}
                                </TableCell>
                            </>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {table_body.map(col => (
                        <>
                            <TableRow sx={{ padding: '1rem 0' }}>
                                {col && col.map(row => (
                                    <>
                                        <TableCell style={{ textAlign: 'center' }}>
                                            {row}
                                        </TableCell>
                                    </>
                                ))}
                            </TableRow>
                        </>
                    ))}
                </TableBody>
            </Table>
        }
    }
    return (
        <>
            {!loading &&
                <>
                    <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem' }}>
                        {tab_list.map((tab) => (
                            <Button
                                variant={tab.value == currentTab ? 'contained' : 'outlined'}
                                onClick={() => {
                                    setCurrentTab(tab.value)
                                }}
                            >{tab.label}</Button>
                        ))}
                    </Row>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    {tab_list.map((itm, idx) => (
                                        <>
                                            {currentTab == itm.value &&
                                                <>
                                                    <Title3 style={{ fontWeight: 'normal', color: '#777' }}>
                                                        {tableObj[itm.value].explain}
                                                    </Title3>
                                                    {tableObj[itm.value].uri &&
                                                        <>
                                                            <Title3>
                                                                [ Request ]
                                                            </Title3>
                                                            <Col style={{ padding: '2rem', background: '#222', rowGap: '0.5rem' }}>
                                                                <Row style={{ columnGap: '0.5rem' }}>
                                                                    <div style={{ color: '#fff' }}>POST</div>
                                                                    <div style={{ color: 'yellow' }}>{process.env.API_URL}{tableObj[itm.value].uri}</div>
                                                                    <div style={{ color: '#fff' }}>HTTP/1.1</div>
                                                                </Row>
                                                                <Row style={{ columnGap: '0.5rem' }}>
                                                                    <div style={{ color: '#fff' }}>Host:</div>
                                                                    <div style={{ color: 'orange' }}>{process.env.API_URL}</div>
                                                                </Row>
                                                                <Row style={{ columnGap: '0.5rem' }}>
                                                                    <div style={{ color: '#fff' }}>Service Port:</div>
                                                                    <div style={{ color: 'orange' }}>443</div>
                                                                </Row>
                                                            </Col>
                                                        </>}
                                                    {tableObj[itm.value].req_head?.length > 0 && tableObj[itm.value].req_body?.length > 0 &&
                                                        <>
                                                            <Title3 style={{ fontWeight: 'normal', color: '#777' }}>
                                                                요청 바디는 JSON 객체로 구성됩니다.
                                                            </Title3>
                                                            {returnTable(tableObj[itm.value].req_head, tableObj[itm.value].req_body,)}
                                                        </>}
                                                    <Title3>
                                                        [ Response ]
                                                    </Title3>
                                                    <Title3 style={{ fontWeight: 'normal', color: '#777' }}>
                                                        응답 바디는 JSON 객체로 구성됩니다.
                                                    </Title3>
                                                    {returnTable(tableObj[itm.value].res_head, tableObj[itm.value].res_body,)}
                                                    {tableObj[itm.value]?.res_head && tableObj[itm.value]?.data_res_body &&
                                                        <>
                                                            <Title3 style={{ fontWeight: 'normal', color: '#777' }}>
                                                                data 구성요소 입니다.
                                                            </Title3>
                                                        </>}
                                                    {returnTable(tableObj[itm.value].res_head, tableObj[itm.value].data_res_body,)}
                                                </>}
                                        </>
                                    ))}
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}

ApiDocs.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default ApiDocs;