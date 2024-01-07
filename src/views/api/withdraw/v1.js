import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useState } from "react";
import { Row, themeObj, Col } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
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

const WithdrawApiV1 = () => {

    const { themeDnsData } = useSettingsContext();
    const [currentTab, setCurrentTab] = useState(0);
    const tab_list = [
        {
            value: 0,
            label: '출금요청'
        },

    ]

    const table_obj = {
        0: {
            uri: '/api/withdraw/v1',
            explain: `출금 요청 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['withdraw_amount', '출금금액', 'O', 'Integer'],

            ],
            res_head: [
                '키',
                '설명',
                '타입',
            ],
            res_body: [
                ['result', '결과코드 (100 이외 에러)', 'Integer'],
                ['message', '결과 메시지', 'String'],
                ['data', '리턴값', 'Object'],
            ],
            data_res_body: [
                ['guid', '생성된유저 guid', 'String'],
                ['tid', '입금은행 1원인증 요청 tid', 'String'],
            ],
        },
    }
    const returnTable = (table_head, table_body) => {
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
    return (
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
                                                {table_obj[itm.value].explain}
                                            </Title3>
                                            <Title3>
                                                [ Request ]
                                            </Title3>
                                            <Col style={{ padding: '2rem', background: '#222', rowGap: '0.5rem' }}>
                                                <Row style={{ columnGap: '0.5rem' }}>
                                                    <div style={{ color: '#fff' }}>POST</div>
                                                    <div style={{ color: 'yellow' }}>{process.env.API_URL}{table_obj[itm.value].uri}</div>
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
                                            <Title3 style={{ fontWeight: 'normal', color: '#777' }}>
                                                요청 바디는 JSON 객체로 구성됩니다.
                                            </Title3>
                                            {returnTable(table_obj[itm.value].req_head, table_obj[itm.value].req_body,)}
                                            <Title3>
                                                [ Response ]
                                            </Title3>
                                            <Title3 style={{ fontWeight: 'normal', color: '#777' }}>
                                                응답 바디는 JSON 객체로 구성됩니다.
                                            </Title3>
                                            {returnTable(table_obj[itm.value].res_head, table_obj[itm.value].res_body,)}
                                            <Title3 style={{ fontWeight: 'normal', color: '#777' }}>
                                                data 구성요소 입니다.
                                            </Title3>
                                            {returnTable(table_obj[itm.value].res_head, table_obj[itm.value].data_res_body,)}
                                        </>}
                                </>
                            ))}
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}
export default WithdrawApiV1;