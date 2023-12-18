// next
import Head from 'next/head';
import { Button, Container, Grid, Stack, Typography } from '@mui/material';
// layouts
import ManagerLayout from '../../layouts/manager';
// components
import { useSettingsContext } from '../../components/settings';
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
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------

const Dashboards = () => {
    const { user } = useAuthContext();
    const { themeStretch } = useSettingsContext();
    const router = useRouter();
    const theme = useTheme();
    return (
        <>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <AppWidgetSummary
                            title="일매출"
                            sx={{ height: '100%' }}
                            percent={0.2}
                            total={4876}
                            total_label={' 원'}
                            chart={{
                                colors: [theme.palette.info.main],
                                series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <AppWidgetSummary
                            title="주매출"
                            sx={{ height: `${window.innerWidth > 900 ? '241px' : '157px'}` }}
                            percent={0.2}
                            total={4876}
                            total_label={' 원'}
                            chart={{
                                colors: [theme.palette.info.main],
                                series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <AppWidgetSummary
                            title="월매출"
                            sx={{ height: `${window.innerWidth > 900 ? '241px' : '157px'}` }}
                            percent={0.2}
                            total={4876}
                            total_label={' 원'}
                            chart={{
                                colors: [theme.palette.info.main],
                                series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <AppAreaInstalled
                            title="일 매출 차트 (단위:원)"
                            subheader="(+43%) 전일 대비"
                            chart={{
                                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                                series: [
                                    {
                                        year: '2019',
                                        data: [
                                            { name: '매출', data: [10, 41, 35, 51, 49, 62, 69, 91, 148] },
                                        ],
                                    },
                                ],
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <AppAreaInstalled
                            title="주 매출 차트 (단위:원)"
                            subheader="(+43%) 전주 대비"
                            chart={{
                                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                                series: [
                                    {
                                        year: '2019',
                                        data: [
                                            { name: '매출', data: [10, 41, 35, 51, 49, 62, 69, 91, 148] },
                                        ],
                                    },
                                ],
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <AppAreaInstalled
                            title="월 매출 차트 (단위:원)"
                            subheader="(+43%) 전월 대비"
                            chart={{
                                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                                series: [
                                    {
                                        year: '2019',
                                        data: [
                                            { name: '매출', data: [10, 41, 35, 51, 49, 62, 69, 91, 148] },
                                        ],
                                    },
                                ],
                            }}
                        />
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
Dashboards.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;

export default Dashboards;
