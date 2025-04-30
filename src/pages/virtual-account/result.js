
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
import _, { set } from "lodash";
import { commarNumber, differenceSecondTwoDate, returnMoment } from "src/utils/function";
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
    const [authItem, setAuthItem] = useState({});
    const [currentTab, setCurrentTab] = useState(0);
    const [amount, setAmount] = useState(0);

    const tab_list = [
        {
            value: 0,
            label: '가상계좌발급정보'
        },
        {
            value: 1,
            label: '입금신청'
        },
    ]
    useEffect(() => {
        settingPage();
    }, [])

    const settingPage = async () => {
        if (themeDnsData?.deposit_process_type == 1) {
            setCurrentTab(1);
        }
        setLoading(true);
        let data = await apiManager(`virtual-accounts/0`, 'list', {
            ci: router.query?.ci
        })
        setItem(data);
        setLoading(false);
    }
    const addDepositItem = async () => {
        let result = undefined
        result = await apiManager('virtual-accounts/request-deposit', 'create', {
            virtual_account_id: item?.id,
            amount: amount
        });
        if (result) {
            setCurrentTab(0);
            toast.success("성공적으로 저장 되었습니다.");
        }
    }

    const onCheckPhoneNumRequest = async () => {
        let result = undefined
        if (window.confirm('인증번호 발송 하시겠습니까?')) {
            result = await apiManager('virtual-accounts/daily-auth-request', 'create', { id: item?.id });
            if (result) {
                toast.success('성공적으로 발송 되었습니다.');
                setAuthItem(result);
            }
        }

    }
    const onCheckPhoneNumCheck = async () => {
        let result = undefined;
        result = await apiManager('virtual-accounts/daily-auth-check', 'create', { ...authItem, id: item?.id });
        if (result) {
            toast.success('성공적으로 인증 완료 되었습니다.');
            settingPage();
        }
    }
    const oneWonCertification = async () => {
        let result = undefined
        if (window.confirm('인증번호 발송 하시겠습니까?')) {
            result = await apiManager('virtual-accounts/acct-auth-request', 'create', { id: item?.id });
            if (result) {
                toast.success('성공적으로 발송 되었습니다.');
                setAuthItem(result);
            }
        }
    }
    const checkOneWonCertification = async () => {
        let result = undefined;
        result = await apiManager('virtual-accounts/acct-auth-check', 'create', { ...authItem, id: item?.id });
        if (result) {
            toast.success('성공적으로 인증 완료 되었습니다.');
            settingPage();
        }
    }
    if (loading) {
        return <></>
    }

    const getVirtualAccountRequest = () => {
        return <>
            <Typography variant="body2">• 1회 최대입금금액은 200만원입니다.</Typography>
            <Typography variant="body2">• 1일 최대 입금금액은 1000만원 까지 입니다.</Typography>
            <Typography variant="body2">• 신청한 입금금액과 실 입금액의 오차가 있을시 입금처리 되지 않습니다.</Typography>
            <Typography variant="body2">• 타명의 입금, 간편송금어플, ATM, 수표 입금은 불가합니다.</Typography>
            <Row style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                {[1, 3, 5, 10, 30, 50, 100, 200].map(num => (
                    <>
                        <Button variant="outlined" onClick={() => {
                            setAmount(amount + num * 10000)
                        }}>{commarNumber(num * 10000)}원</Button>
                    </>
                ))}
                <Button variant="outlined" onClick={() => {
                    setAmount(0);
                }}>초기화</Button>
            </Row>
            <TextField
                size="small"
                value={commarNumber(amount)}
                label={'입금금액'}
                style={{ margin: '1rem 0' }}
            />
            <Button style={{ marginLeft: 'auto' }} variant="contained" onClick={() => {
                if (window.confirm(`${commarNumber(amount)}원을 입금 신청하겠습니까?`)) {
                    addDepositItem();
                }
            }}>확인</Button>
        </>
    }
    return (
        <>
            <Col style={{ height: '100vh' }}>
                <Col style={{ marginTop: '2rem' }}>
                    {(themeDnsData?.deposit_corp_type == 7 && themeDnsData?.deposit_process_type == 0) &&
                        <>
                            <Grid item xs={12} md={6} style={{ margin: 'auto' }}>
                                <Grid item xs={12} md={6} style={{ margin: 'auto' }}>
                                    <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem', overflow: 'auto' }}>
                                        {tab_list.map((tab) => (
                                            <Button
                                                variant={tab.value == currentTab ? 'contained' : 'outlined'}
                                                onClick={() => {
                                                    setCurrentTab(tab.value)
                                                    setAmount(0)
                                                }}
                                            >{tab.label}</Button>
                                        ))}
                                    </Row>
                                </Grid>
                            </Grid>
                        </>}

                    {currentTab == 0 &&
                        <>
                            <Card sx={{ p: 2, maxWidth: '500px', margin: 'auto', width: '90%' }}>
                                <Col style={{ rowGap: '0.5rem' }}>
                                    <Col style={{ margin: '1rem auto' }}>
                                        {/* 개인결제 P2P 플랫폼 */}
                                    </Col>
                                    <Row style={{ alignItems: 'center' }}>
                                        <Typography variant="body2" style={{ width: '100px' }}>은행명</Typography>
                                        <Typography>{_.find(bankCodeList(), { value: item?.virtual_bank_code })?.label ?? "---"}</Typography>
                                    </Row>
                                    <Row style={{ alignItems: 'center' }}>
                                        <Typography variant="body2" style={{ width: '100px' }}>계좌번호</Typography>
                                        <Typography>{item?.virtual_acct_num}</Typography>
                                    </Row>
                                    <Row style={{ alignItems: 'center' }}>
                                        <Typography variant="body2" style={{ width: '100px' }}>입금자명</Typography>
                                        <Typography>{item?.deposit_acct_name}</Typography>
                                    </Row>
                                </Col>
                            </Card>
                        </>}
                    {currentTab == 1 &&
                        <>
                            <Card sx={{ p: 2, maxWidth: '500px', margin: 'auto', width: '90%' }}>
                                <Col style={{ rowGap: '0.5rem' }}>
                                    {themeDnsData?.deposit_corp_type == 7 ?
                                        <>
                                            {item?.last_auth_date.substring(0, 10) != returnMoment().substring(0, 10) ?
                                                <>
                                                    <Col style={{ margin: '1rem auto' }}>
                                                        데일리 인증
                                                    </Col>
                                                    <TextField
                                                        label='휴대폰번호'
                                                        autoFocus
                                                        fullWidth
                                                        size="small"
                                                        margin="dense"
                                                        value={item.phone_num}
                                                        placeholder="하이픈(-) 제외 입력"
                                                        onChange={(e) => {

                                                        }}
                                                        InputProps={{
                                                            endAdornment: <Button
                                                                variant='contained'
                                                                size='small'
                                                                sx={{ width: '160px', marginRight: '-0.5rem' }}
                                                                onClick={onCheckPhoneNumRequest}>{'인증번호 발송'}</Button>
                                                        }}
                                                    />
                                                    <TextField
                                                        label='인증번호'
                                                        fullWidth
                                                        size="small"
                                                        margin="dense"
                                                        value={authItem.vrf_word}
                                                        placeholder=""
                                                        onChange={(e) => {
                                                            setAuthItem(
                                                                {
                                                                    ...authItem,
                                                                    ['vrf_word']: e.target.value
                                                                }
                                                            )
                                                        }}
                                                        InputProps={{
                                                            endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                                                                onClick={onCheckPhoneNumCheck}>{'인증번호 확인'}</Button>
                                                        }}
                                                    />
                                                </>
                                                :
                                                <>
                                                    {differenceSecondTwoDate(returnMoment(), item?.last_acct_auth_date) < 300 && item?.last_acct_auth_date ?
                                                        <>
                                                            {getVirtualAccountRequest()}
                                                        </>
                                                        :
                                                        <>
                                                            <Col style={{ margin: '1rem auto' }}>
                                                                5분 계좌인증
                                                            </Col>
                                                            <Stack spacing={2}>
                                                                <Stack spacing={1}>
                                                                    <FormControl size="small" disabled={true} fullWidth>
                                                                        <InputLabel>입금은행</InputLabel>
                                                                        <Select
                                                                            label='입금은행'
                                                                            value={item.deposit_bank_code}
                                                                        >
                                                                            {bankCodeList().map((itm, idx) => {
                                                                                return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                                                            })}
                                                                        </Select>
                                                                    </FormControl>
                                                                </Stack>
                                                                <TextField
                                                                    fullWidth
                                                                    disabled={true}
                                                                    size="small"
                                                                    label='입금계좌번호'
                                                                    value={item.deposit_acct_num}
                                                                />
                                                                <TextField
                                                                    fullWidth
                                                                    label='예금주명'
                                                                    size="small"
                                                                    value={item.deposit_acct_name}
                                                                    disabled={true}
                                                                />
                                                                <Button onClick={oneWonCertification} variant="outlined" style={{ height: '40px', }}>1원인증 발송</Button>
                                                                {authItem.tid &&
                                                                    <>
                                                                        <TextField
                                                                            size="small"
                                                                            label='인증번호'
                                                                            value={authItem.vrf_word}
                                                                            placeholder=""
                                                                            onChange={(e) => {
                                                                                setAuthItem(
                                                                                    {
                                                                                        ...authItem,
                                                                                        ['vrf_word']: e.target.value
                                                                                    }
                                                                                )
                                                                            }} />
                                                                        <Button
                                                                            fullWidth
                                                                            onClick={checkOneWonCertification} variant="outlined" style={{ height: '40px', }}>인증확인</Button>
                                                                    </>}
                                                            </Stack>
                                                        </>}
                                                </>}
                                        </>
                                        :
                                        <>
                                            {getVirtualAccountRequest()}
                                        </>}
                                </Col>
                            </Card>
                        </>}
                </Col>
            </Col>
        </>
    )
}
VirtualAccountResult.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default VirtualAccountResult;