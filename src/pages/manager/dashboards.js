// next
import { Table, TableRow, TableBody, TableCell, TableContainer, Pagination, Divider, Box, TextField, Button, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, CircularProgress, Tooltip, TableHead, Select, MenuItem, Container, Grid, Card, CardContent, CardHeader, Alert, Dialog } from '@mui/material';
// layouts
import ManagerLayout from '../../layouts/manager';
// components
import { useSettingsContext } from '../../components/settings';
import {
    DatePicker,
    StaticDatePicker,
    MobileDatePicker,
    DesktopDatePicker,
} from '@mui/x-date-pickers';
import {
    AppWidget,
    AppWelcome,
    AppFeatured,
    AppNewInvoice,
    AppTopAuthors,
    AppTopRelated,
    AppAreaInstalled,
    AppWidgetSummary,
    AppCurrentDownload,
    AppTopInstalledCountries,
} from 'src/views/@dashboard/general/app';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from 'src/auth/useAuthContext';
import { SeoIllustration } from 'src/assets/illustrations';
import {
    _appFeatured,
    _appAuthors,
    _appInstalled,
    _appRelated,
    _appInvoices,
} from '../../_mock/arrays';
import { useRouter } from 'next/router';
import useResponsive from 'src/hooks/useResponsive';
import Chart, { useChart } from 'src/components/chart';
import { Row } from 'src/components/elements/styled-components';
import { useEffect, useState } from 'react';
import { commarNumber, returnMoment } from 'src/utils/function';
import { apiManager } from 'src/utils/api-manager';
import _ from 'lodash';
import { TableHeadCustom } from 'src/components/table';
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------


const Dashboards = () => {
    const { user } = useAuthContext();
    const { themeStretch, themeDnsData } = useSettingsContext();
    const router = useRouter();
    const theme = useTheme();
    const [currentTab, setCurrentTab] = useState(undefined);
    const [searchObj, setSearchObj] = useState({
        s_dt: returnMoment().substring(0, 10),
        e_dt: returnMoment().substring(0, 10),
    })
    const [sDt, setSDt] = useState(new Date());
    const [eDt, setEDt] = useState(new Date());
    const [deposits, setDeposits] = useState([]);

    const onClickDateButton = (num) => {
        let s_dt = 0;
        let e_dt = 0;

        if (num == 1) {
            s_dt = returnMoment().substring(0, 10);
            e_dt = returnMoment().substring(0, 10);
        } else if (num == -1) {
            s_dt = returnMoment(-1).substring(0, 10);
            e_dt = returnMoment(-1).substring(0, 10);
        } else if (num == 3) {
            s_dt = returnMoment(-3).substring(0, 10);
            e_dt = returnMoment(-1).substring(0, 10);
        } else if (num == 30) {
            let moment = returnMoment().substring(0, 10);
            moment = moment.split('-');
            if (moment[1] == '01') {
                moment[1] = '12';
                moment[0] = moment[0] - 1;
            } else {
                moment[1] = moment[1] - 1;
            }
            s_dt = `${moment[0]}-${moment[1] >= 10 ? moment[1] : `0${moment[1]}`}-01`;
            e_dt = returnMoment(undefined, new Date(moment[0], moment[1], 0)).substring(0, 10);
        }

        setSDt(new Date(s_dt));
        setEDt(new Date(e_dt));
        onChangePage({
            ...searchObj,
            s_dt: s_dt,
            e_dt: e_dt,
        });

    }
    const tab_list = [
        ...(themeDnsData?.withdraw_corp_type == 1 ? [
            {
                value: 0,
                label: '기간별(가맹점)',
                title: '가맹점별 입금액',
                columns: [
                    {
                        label: 'No.',
                        action: (row, idx) => {
                            return idx + 1
                        }
                    },
                    {
                        label: '가맹점상호',
                        action: (row, idx) => {
                            return row['label'] ?? "---"
                        }
                    },
                    {
                        label: 'MID',
                        action: (row, idx) => {
                            return row['mid'] ?? "---"
                        }
                    },
                    {
                        label: '입금액',
                        action: (row, idx) => {
                            return commarNumber(row['amount'])
                        },
                        sx: (row) => {
                            return {
                                color: 'blue'
                            }
                        },
                    },
                    {
                        label: '입금건',
                        action: (row, idx) => {
                            return commarNumber(row['count'])
                        }
                    },
                    {
                        label: '가맹점 정산금',
                        action: (row, idx) => {
                            return commarNumber(row['mcht_amount'])
                        },
                        sx: (row) => {
                            return {
                                color: 'red'
                            }
                        },
                    },

                ],
            },
        ] : []),
        {
            value: 1,
            label: '시간별입금액',
            title: '시간별 입금액',
            columns: [
                {
                    label: 'No.',
                    action: (row, idx) => {
                        return idx + 1
                    }
                },
                {
                    label: '시간',
                    action: (row, idx) => {
                        return row['label'] ?? "---"
                    }
                },
                {
                    label: '입금액',
                    action: (row, idx) => {
                        return commarNumber(row['amount'])
                    },
                    sx: (row) => {
                        return {
                            color: 'blue'
                        }
                    },
                },
                {
                    label: '입금건',
                    action: (row, idx) => {
                        return commarNumber(row['count'])
                    }
                },
            ],
        },
        {
            value: 2,
            label: '일별입금액',
            title: '일별 입금액',
            columns: [
                {
                    label: 'No.',
                    action: (row, idx) => {
                        return idx + 1
                    }
                },
                {
                    label: '일자',
                    action: (row, idx) => {
                        return row['label'] ?? "---"
                    }
                },
                {
                    label: '입금액',
                    action: (row, idx) => {
                        return commarNumber(row['amount'])
                    },
                    sx: (row) => {
                        return {
                            color: 'blue'
                        }
                    },
                },
                {
                    label: '입금건',
                    action: (row, idx) => {
                        return commarNumber(row['count'])
                    }
                },
            ],
        },
        {
            value: 3,
            label: '월별입금액',
            title: '월별 입금액',
            columns: [
                {
                    label: 'No.',
                    action: (row, idx) => {
                        return idx + 1
                    }
                },
                {
                    label: '월별',
                    action: (row, idx) => {
                        return row['label'] ?? "---"
                    }
                },
                {
                    label: '입금액',
                    action: (row, idx) => {
                        return commarNumber(row['amount'])
                    },
                    sx: (row) => {
                        return {
                            color: 'blue'
                        }
                    },
                },
                {
                    label: '입금건',
                    action: (row, idx) => {
                        return commarNumber(row['count'])
                    }
                },
            ],
        },
        {
            value: 4,
            label: '시간별출금액',
            title: '시간별 출금액',
            columns: [
                {
                    label: 'No.',
                    action: (row, idx) => {
                        return idx + 1
                    }
                },
                {
                    label: '시간',
                    action: (row, idx) => {
                        return row['label'] ?? "---"
                    }
                },
                {
                    label: '출금액',
                    action: (row, idx) => {
                        return commarNumber(row['amount'])
                    },
                    sx: (row) => {
                        return {
                            color: 'blue'
                        }
                    },
                },
                {
                    label: '출금건',
                    action: (row, idx) => {
                        return commarNumber(row['count'])
                    }
                },
            ],
        },
        {
            value: 5,
            label: '일별출금액',
            title: '일별 출금액',
            columns: [
                {
                    label: 'No.',
                    action: (row, idx) => {
                        return idx + 1
                    }
                },
                {
                    label: '일자',
                    action: (row, idx) => {
                        return row['label'] ?? "---"
                    }
                },
                {
                    label: '출금액',
                    action: (row, idx) => {
                        return commarNumber(row['amount'])
                    },
                    sx: (row) => {
                        return {
                            color: 'blue'
                        }
                    },
                },
                {
                    label: '출금건',
                    action: (row, idx) => {
                        return commarNumber(row['count'])
                    }
                },
            ],
        },
        {
            value: 6,
            label: '월별출금액',
            title: '월별 출금액',
            columns: [
                {
                    label: 'No.',
                    action: (row, idx) => {
                        return idx + 1
                    }
                },
                {
                    label: '월별',
                    action: (row, idx) => {
                        return row['label'] ?? "---"
                    }
                },
                {
                    label: '출금액',
                    action: (row, idx) => {
                        return commarNumber(row['amount'])
                    },
                    sx: (row) => {
                        return {
                            color: 'blue'
                        }
                    },
                },
                {
                    label: '출금건',
                    action: (row, idx) => {
                        return commarNumber(row['count'])
                    }
                },
            ],
        },
    ]

    useEffect(() => {
        setCurrentTab(tab_list[0].value)
    }, [])
    const series = [
        {
            data: deposits.map(i => { return i?.amount }),
        },
    ]
    function ChartBar() {
        const chartOptions = useChart({
            tooltip: {
                marker: { show: false },
                y: {
                    formatter: (value) => `${commarNumber(value)} 원`,
                    title: {
                        formatter: () => '',
                    },
                },
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '50%'
                },
            },
            xaxis: {
                categories: deposits.map(i => { return `${i?.label}` }),
            },
        });
        return <Chart type="bar" series={series} options={chartOptions} height={deposits.length * 70 + 70} />;
    }
    useEffect(() => {
        onChangePage(searchObj);
    }, [currentTab])
    const getDepositByMcht = async (search_obj) => {
        setSearchObj(search_obj);
        let result = await apiManager('dashboard/mcht-deposit', 'list', search_obj);
        setDeposits(result ?? []);
    }
    const getDepositByTime = async (time_type, search_obj) => {
        setSearchObj(search_obj);
        let result = await apiManager('dashboard/amount', 'list', { ...search_obj, time_type });
        setDeposits(result ?? []);
    }
    const onChangePage = (search_obj_ = {}) => {
        let search_obj = search_obj_;
        if (currentTab == 0) {
            getDepositByMcht(search_obj);
        }
        if (currentTab == 1) {
            search_obj['pay_type'] = 'deposit';
            getDepositByTime('time', search_obj);
        }
        if (currentTab == 2) {
            search_obj['pay_type'] = 'deposit';
            getDepositByTime('date', search_obj);
        }
        if (currentTab == 3) {
            search_obj['pay_type'] = 'deposit';
            getDepositByTime('month', search_obj);
        }
        if (currentTab == 4) {
            search_obj['pay_type'] = 'withdraw';
            getDepositByTime('time', search_obj);
        }
        if (currentTab == 5) {
            search_obj['pay_type'] = 'withdraw';
            getDepositByTime('date', search_obj);
        }
        if (currentTab == 6) {
            search_obj['pay_type'] = 'withdraw';
            getDepositByTime('month', search_obj);
        }
    }

    return (
        <>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem', overflow: 'auto' }}>
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
                        <Card>
                            <CardContent>
                                <Row style={{ rowGap: '1rem', flexWrap: 'wrap', columnGap: '0.75rem' }}>
                                    {window.innerWidth > 1000 ?
                                        <>
                                            <DesktopDatePicker
                                                label="시작일 선택"
                                                value={sDt}
                                                format='yyyy-MM-dd'
                                                onChange={(newValue) => {
                                                    setSDt(newValue);
                                                    onChangePage({ ...searchObj, s_dt: returnMoment(false, new Date(newValue)).substring(0, 10), page: 1 })
                                                }}
                                                renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                                                sx={{ width: '180px', height: '32px' }}
                                                slotProps={{ textField: { size: 'small' } }}
                                            />
                                            <DesktopDatePicker
                                                label="종료일 선택"
                                                value={eDt}
                                                format='yyyy-MM-dd'
                                                onChange={(newValue) => {
                                                    setEDt(newValue);
                                                    onChangePage({ ...searchObj, e_dt: returnMoment(false, new Date(newValue)).substring(0, 10), page: 1 })
                                                }}
                                                renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                                                sx={{ width: '180px' }}
                                                slotProps={{ textField: { size: 'small' } }}
                                            />
                                        </>
                                        :
                                        <>
                                            <Row style={{ columnGap: '0.5rem' }}>
                                                <MobileDatePicker
                                                    label="시작일 선택"
                                                    value={sDt}
                                                    format='yyyy-MM-dd'
                                                    onChange={(newValue) => {
                                                        setSDt(newValue);
                                                        onChangePage({ ...searchObj, s_dt: returnMoment(false, new Date(newValue)).substring(0, 10), page: 1 })
                                                    }}
                                                    renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                                                    sx={{ flexGrow: 1 }}
                                                    slotProps={{ textField: { size: 'small' } }}
                                                />
                                                <MobileDatePicker
                                                    label="종료일 선택"
                                                    value={eDt}
                                                    format='yyyy-MM-dd'
                                                    onChange={(newValue) => {
                                                        setEDt(newValue);
                                                        onChangePage({ ...searchObj, e_dt: returnMoment(false, new Date(newValue)).substring(0, 10), page: 1 })
                                                    }}
                                                    renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                                                    sx={{ flexGrow: 1 }}
                                                    slotProps={{ textField: { size: 'small' } }}
                                                />
                                            </Row>
                                        </>}
                                    <Row style={{ columnGap: '0.5rem' }}>
                                        <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(-1)}>어제</Button>
                                        <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(1)}>당일</Button>
                                        <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(3)}>3일전</Button>
                                        <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(30)}>1개월</Button>
                                    </Row>
                                </Row>
                                <CardHeader title={_.find(tab_list, { value: currentTab })?.title} />
                                <ChartBar />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <Card>
                            <Table>
                                <TableHeadCustom headLabel={_.find(tab_list, { value: currentTab })?.columns} column_table={'dashboards'} />
                                <TableBody>
                                    {deposits.map((row, index) => {
                                        let columns = _.find(tab_list, { value: currentTab })?.columns;
                                        return <TableRow key={index}>
                                            {columns.map((col, idx) => (
                                                <>
                                                    <TableCell align="left" sx={{ ...(col?.sx ? col.sx(row) : {}), fontSize: '0.8rem', padding: '16px 0' }}>
                                                        <Row style={{ alignItems: 'center' }}>
                                                            <div style={{ borderLeft: `${idx != 0 ? '1px solid #ccc' : ''}`, paddingLeft: '16px', height: '2rem' }} />
                                                            {col.action(row, index)}
                                                            <div style={{ paddingLeft: '16px' }} />
                                                        </Row>
                                                    </TableCell>
                                                </>
                                            ))}
                                        </TableRow>
                                    })}
                                </TableBody>
                            </Table>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
Dashboards.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;

export default Dashboards;
