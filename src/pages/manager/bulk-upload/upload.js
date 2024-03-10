
import { Box, Button, Card, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Pagination, Select, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager } from "src/utils/api-manager";
import { excelDownload, getMaxPage, getUserDepositFee, getUserFee, getUserWithDrawFee, onlyNumberText, returnMoment, uploadExcel } from "src/utils/function";
import { bankCodeList } from "src/utils/format";
import { Icon } from "@iconify/react";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";
import $ from 'jquery';

const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const BulkUpload = () => {
    const { setModal } = useModal()
    const { themeMode, themeDnsData } = useSettingsContext();
    const { user } = useAuthContext();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [operatorList, setOperatorList] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);

    const [data, setData] = useState([]);
    const [errorList, setErrorList] = useState([]);
    const tab_list = [
        {
            value: 0,
            label: '가맹점등록',
            table: 'merchandise'
        },
    ]
    useEffect(() => {
        console.log(data);
    }, [data])
    const rowColumns = (label, column, placeholder, type = "string", is_require) => {
        return {
            label, column, placeholder, type, is_require
        }
    }
    const tab_row_obj = {
        0: [
            rowColumns('아이디', 'user_name', '', ''),
            rowColumns('비밀번호', 'user_pw', '', ''),
            rowColumns('닉네임', 'nickname', '', ''),
            rowColumns('이름', 'name', '', ''),
            rowColumns('전화번호', 'phone_num', '', ''),
            rowColumns('입금수수료', 'deposit_fee', '', 'number'),
            rowColumns('출금수수료', 'withdraw_fee', '', 'number'),
            rowColumns('최소출금액', 'min_withdraw_price', '', 'number'),
            rowColumns('최소출금잔액', 'min_withdraw_remain_price', '', 'number'),
            rowColumns('최소출금보류금액', 'min_withdraw_hold_price', '', 'number'),
            rowColumns('출금보류여부(0-보류안함,1-보류함)', 'is_withdraw_hold', '', 'number'),
            ...(themeDnsData?.operator_list.map((oper) => {
                return [
                    rowColumns(`${oper?.label}아이디(없을 시 공백)`, `sales${oper?.num}_user_name`, '', ''),
                    ...(themeDnsData?.is_use_deposit_operator == 1 ? [
                        rowColumns(`${oper?.label}입금수수료`, `sales${oper?.num}_deposit_fee`, '', 'number'),
                    ] : []),
                    ...(themeDnsData?.is_use_fee_operator == 1 ? [
                        rowColumns(`${oper?.label}요율%`, `sales${oper?.num}_fee`, '', 'number'),
                    ] : []),
                    ...(themeDnsData?.is_use_withdraw_operator == 1 ? [
                        rowColumns(`${oper?.label}출금수수료`, `sales${oper?.num}_withdraw_fee`, '', 'number'),
                    ] : []),
                ]
            })).flat(),
            rowColumns('가맹점요율%', 'mcht_fee', '', 'number'),
        ]
    }
    useEffect(() => {
        if (router.query?.tab >= 0) {
            setCurrentTab(router.query?.tab ?? 0);
        }
        settingPage();
    }, [])
    const settingPage = async () => {
        //
        setLoading(false);
    }

    const onSave = async () => {
        let result = undefined
        // result = await apiManager('users', 'update', data);
        result = await apiManager(`bulk-upload/${_.find(tab_list, { value: currentTab })?.table}`, 'create', {
            data
        });
        if (result) {
            console.log(result);
            if (result?.error_list.length > 0) {
                setErrorList(result?.error_list)
                toast.error("대량등록에 실패하였습니다.");
            } else {
                toast.success("성공적으로 저장 되었습니다.");
                setData([]);
                setErrorList([]);
            }

        } else {

        }
    }

    const isError = (itm, col, index) => {
        let error_obj = {
            message: '',
        }
        if (errorList.map((error) => { return error?.idx }).includes(`${index}-${col?.column}`)) {
            error_obj.message = _.find(errorList, { idx: `${index}-${col?.column}` })?.message;
        }
        if (col?.type == 'number' && isNaN(parseInt(itm[col?.column])) && itm[col?.column]) {
            error_obj.message = '숫자만 입력해 주세요.';
        }

        return error_obj;
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
                                    <Row style={{ marginLeft: 'auto', columnGap: '0.5rem' }}>
                                        <Button variant="outlined"
                                            startIcon={<Icon icon={'material-symbols:download-sharp'} />}
                                            onClick={() => {
                                                excelDownload([], tab_row_obj[currentTab], `${_.find(tab_list, { value: currentTab }).label}_양식_${returnMoment().substring(0, 10)}`)
                                            }}>엑셀양식추출</Button>
                                        <label htmlFor={'excel_upload'}>
                                            <Button
                                                variant="contained"
                                                component="span"
                                                startIcon={<Icon icon={'icon-park-outline:excel'} />}
                                            >엑셀등록</Button>
                                        </label>
                                        <input type={'file'} onChange={async (e) => {
                                            let excel_list = await uploadExcel(e, 'excel_upload')
                                            excel_list.shift();
                                            if (excel_list.length > 0) {
                                                let list = [];
                                                let cols = tab_row_obj[currentTab];
                                                console.log(excel_list)
                                                for (var i = 0; i < excel_list.length; i++) {
                                                    let obj = {};
                                                    for (var j = 0; j < cols.length; j++) {
                                                        if (excel_list[i][j]) {
                                                            obj[cols[j]?.column] = excel_list[i][j];
                                                        }
                                                    }
                                                    list.push(obj);
                                                }
                                                setData(list);

                                            }
                                            $('#excel_upload').val("")
                                        }} id='excel_upload' style={{ display: 'none' }} />
                                    </Row>

                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Card sx={{ height: '100%' }}>
                                <Stack spacing={3}>
                                    <div style={{ width: '100%', overflow: 'auto' }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ padding: '1rem 0' }}>
                                                    {tab_row_obj[currentTab] && tab_row_obj[currentTab].map((col) => (
                                                        <>
                                                            <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{col?.label}</TableCell>
                                                        </>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data && data.map((itm, index) => (
                                                    <>
                                                        <TableRow sx={{ padding: '1rem 0' }}>
                                                            {tab_row_obj[currentTab] && tab_row_obj[currentTab].map((col) => (
                                                                <>

                                                                    <TableCell style={{ textAlign: 'center', color: `${isError(itm, col, index)?.message ? 'red' : ''}` }}>
                                                                        <Row style={{ alignItems: 'center', columnGap: '0.2rem' }}>
                                                                            {isError(itm, col, index)?.message &&
                                                                                <>
                                                                                    <Tooltip title={isError(itm, col, index)?.message}>
                                                                                        <IconButton size="small">
                                                                                            <Icon icon='gridicons:notice-outline' style={{ color: 'red' }} />
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                </>}
                                                                            <div>{itm[col?.column]}</div>
                                                                        </Row>
                                                                    </TableCell>
                                                                </>
                                                            ))}
                                                        </TableRow>
                                                    </>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Stack>
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
                                            title: '저장 하시겠습니까?'
                                        })
                                    }}>
                                        저장
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
BulkUpload.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default BulkUpload
