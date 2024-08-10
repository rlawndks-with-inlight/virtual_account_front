
import { Button, Card, CardHeader, CircularProgress, Dialog, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList, telComList, virtualAccountUserTypeList } from "src/utils/format";
import BlankLayout from "src/layouts/BlankLayout";
import { useAuthContext } from "src/auth/useAuthContext";
import { Row } from "src/components/elements/styled-components";
import _ from "lodash";
import { commarNumber, onlyNumberText } from "src/utils/function";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const GiftCardBankners = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();
    const { user } = useAuthContext();
    const router = useRouter();

    const [mchtList, setMchtList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [blockPage, setBlockPage] = useState(true);
    const [item, setItem] = useState({
        deposit_bank_code: '',
        deposit_acct_num: '',
        deposit_acct_name: '',
        birth: '',
        phone_num: '',
        type: 0,
        user_type: 0,
        business_num: '',
        company_name: '',
        ceo_name: '',
        company_phone_num: '',
    })
    const [currentTab, setCurrentTab] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [giftTab, setGiftTab] = useState(0);
    const [authItem, setAuthItem] = useState({})
    const [giftCard, setGiftCard] = useState({});
    const [useGiftCard, setUseGiftCard] = useState({});
    const tab_list = [
        {
            value: 0,
            label: '상품권회원발급'
        },
        {
            value: 1,
            label: '상품권회원발급정보'
        },
    ]
    const gift_tab_list = [
        {
            value: 0,
            label: '상품권구매'
        },
        {
            value: 1,
            label: '상품권사용'
        },
    ]
    const step_list = [
        {
            value: 0,
            label: '회원인증'
        },
        {
            value: 1,
            label: '출금계좌등록'
        },
        {
            value: 2,
            label: '상품권구매/사용'
        },
    ]
    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = async () => {
        if (user?.level >= 40) {
            let mcht_list = await apiManager(`users`, 'list', {
                level: 10,
            })
            setMchtList(mcht_list?.content ?? []);
        }
        let data = item;

        data.mid = router.query?.mid || user?.mid;
        if (!(user?.level >= 40) && !router.query?.mid && !user?.mid && !router.query?.id && !router.query.ci) {
            return;
        }
        if (router.query?.id) {
            data = await apiManager('members', 'get', {
                id: router.query.id
            })
            setCurrentStep(data?.step ?? 0)
        }
        if (router.query?.ci) {
            data = await apiManager('members/0', 'list', {
                ci: router.query.ci
            })
            setCurrentStep(data?.step ?? 0)
        }
        if (router.query?.mid) {
            let mcht = await apiManager(`users/mid/${router.query?.mid}`, 'list',)
            if (mcht?.virtual_acct_link_status != 0) {
                return;
            }
        }
        setItem(data);
        setBlockPage(false);
        setLoading(false);
    }
    const onSave = async () => {
        let result = undefined
        result = await apiServer(`${process.env.API_URL}/api/acct/v1/issuance`, 'create', { ...item, api_key: themeDnsData?.api_key, mid: item?.mid, });
        if (result?.tid) {
            toast.success("성공적으로 발급 되었습니다.");
            if (router.asPath.split('/')[1] == 'manager') {
                router.push('/manager/virtual-account');
            } else {
                router.push(`/virtual-account/result?ci=${result?.ci}`);
            }
        }
    }
    const onCheckPhoneNumRequest = async () => {
        let result = await apiServer(`${process.env.API_URL}/api/gift/v1/phone/request`, 'create', {
            ...item,
            api_key: themeDnsData?.api_key,
        });
        console.log(result)
        if (result) {
            toast.success('성공적으로 발송 되었습니다.');
            setAuthItem(result);
        }
    }
    const onCheckPhoneNumCheck = async () => {
        let result = await apiServer(`${process.env.API_URL}/api/gift/v1/phone/check`, 'create', {
            api_key: themeDnsData?.api_key,
            ...item,
            ...authItem,
        });
        if (result) {
            toast.success('성공적으로 인증 되었습니다.');
            setItem({
                ...item,
                phone_check: 1,
                ci: result?.ci
            })
            if (router.asPath.includes('manager')) {
                setCurrentStep(1);
            } else {
                router.push(`/gift-card?ci=${result?.ci}`)
            }
        }
    }
    const oneWonCertification = async () => {
        setLoading(true);
        let result = await apiServer(`${process.env.API_URL}/api/gift/v1/acct/request`, 'create', {
            api_key: themeDnsData?.api_key,
            ...item,
        });
        let data = item;
        data.guid = result?.guid;
        if (result?.tid) {
            toast.success('성공적으로 발송 되었습니다.');
            data = {
                ...data,
                is_send_one_won_check: true,
                tid: result?.tid,
            }
        }
        setItem(data);
        setLoading(false);
    }
    const checkOneWonCertification = async () => {
        let result = await apiServer(`${process.env.API_URL}/api/gift/v1/acct/check`, 'create', {
            mid: item?.mid,
            tid: item?.tid,
            vrf_word: item?.vrf_word,
            guid: item?.guid,
            api_key: themeDnsData?.api_key,
        });
        if (result?.tid) {
            toast.success('성공적으로 인증 되었습니다.');
            setItem({
                ...item,
                is_check_bank: true
            })
            setCurrentStep(2);
        }
    }
    const onRequestGiftOrder = async () => {
        setLoading(true);
        let result = await apiServer(`${process.env.API_URL}/api/gift/v1/gift/order`, 'create', {
            guid: item?.guid,
            api_key: themeDnsData?.api_key,
            ...giftCard,
        });
        if (result) {
            toast.success('성공적으로 발송 되었습니다. 알림톡 확인해 주세요.');

        }
        setLoading(false);
    }
    const onRequestGiftAuth = async () => {
        setLoading(true);
        let result = await apiServer(`${process.env.API_URL}/api/gift/v1/gift/auth`, 'create', {
            guid: item?.guid,
            api_key: themeDnsData?.api_key,
            ...giftCard,
        });
        if (result) {
            setGiftCard({
                ...giftCard,
                tid: 1234,
            })
            toast.success('성공적으로 발송 되었습니다.');
        }
        setLoading(false);
    }
    const onRequestGiftUse = async () => {
        setLoading(true);
        let result = await apiServer(`${process.env.API_URL}/api/gift/v1/gift/use`, 'create', {
            guid: item?.guid,
            api_key: themeDnsData?.api_key,
            ...giftCard,
        });
        if (result?.tid) {
            toast.success('성공적으로 사용 되었습니다.');
            setGiftCard({});
        }
        setLoading(false);
    }
    return (
        <>
            {!blockPage &&
                <>
                    <Dialog
                        open={loading}
                        onClose={() => {
                            setLoading(false)
                        }}
                        PaperProps={{
                            style: {
                                background: 'transparent',
                                overflow: 'hidden'
                            }
                        }}
                    >
                        <CircularProgress />
                    </Dialog>

                    {user?.level == 10 &&
                        <>
                            <Row style={{ margin: '0 0 2rem 0', columnGap: '0.5rem' }}>
                                {tab_list.map((tab) => (
                                    <Button
                                        variant={tab.value == currentTab ? 'contained' : 'outlined'}
                                        onClick={() => {
                                            setCurrentTab(tab.value)
                                        }}
                                    >{tab.label}</Button>
                                ))}
                            </Row>
                        </>}
                    <Grid container spacing={3}>
                        {currentTab == 0 &&
                            <>
                                <Grid item xs={12} md={12}>
                                    <Stepper activeStep={currentStep} alternativeLabel>
                                        {step_list.map((el) => (
                                            <Step key={el?.value}>
                                                <StepLabel>{el?.label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Grid>
                                {currentStep == 0 &&
                                    <>
                                        <Grid item xs={12} md={6}>
                                            <Card sx={{ p: 2, height: '100%' }}>
                                                <Stack spacing={2}>
                                                    {user?.level >= 40 &&
                                                        <>
                                                            <FormControl variant='outlined' size="small">
                                                                <InputLabel>가맹점선택</InputLabel>
                                                                <Select label='가맹점선택' value={item?.mid}
                                                                    onChange={(e) => {
                                                                        setItem({
                                                                            ...item,
                                                                            mid: e.target.value,
                                                                        })
                                                                    }}>
                                                                    {mchtList.map(mcht => {
                                                                        return <MenuItem value={mcht?.mid}>{`${mcht?.nickname}(${mcht?.user_name})`}</MenuItem>
                                                                    })}
                                                                </Select>
                                                            </FormControl>
                                                            <TextField
                                                                size="small"
                                                                label='MID'
                                                                value={item?.mid}
                                                                disabled={true}
                                                            />
                                                        </>}

                                                    <FormControl variant='outlined' size="small">
                                                        <InputLabel>사용자구분</InputLabel>
                                                        <Select label='사용자구분' value={item?.user_type}
                                                            onChange={(e) => {
                                                                let obj = {
                                                                    ...item,
                                                                    user_type: e.target.value,
                                                                }
                                                                if (e.target.value == 0) {
                                                                    obj = {
                                                                        ...obj,
                                                                        business_num: '',
                                                                        company_name: '',
                                                                        ceo_name: '',
                                                                        company_phone_num: '',
                                                                    }
                                                                }
                                                                setItem(obj)
                                                            }}>
                                                            {virtualAccountUserTypeList.map((itm => {
                                                                return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                                            }))}
                                                        </Select>
                                                    </FormControl>
                                                    {(item.user_type == 1 || item.user_type == 2) &&
                                                        <>
                                                            <TextField
                                                                size="small"
                                                                label='사업자등록번호'
                                                                value={item.business_num}
                                                                placeholder=""
                                                                onChange={(e) => {
                                                                    setItem(
                                                                        {
                                                                            ...item,
                                                                            ['business_num']: onlyNumberText(e.target.value)
                                                                        }
                                                                    )
                                                                }} />
                                                            <TextField
                                                                size="small"
                                                                label='회사명(상호)'
                                                                value={item.company_name}
                                                                placeholder=""
                                                                onChange={(e) => {
                                                                    setItem(
                                                                        {
                                                                            ...item,
                                                                            ['company_name']: e.target.value
                                                                        }
                                                                    )
                                                                }} />
                                                            <TextField
                                                                size="small"
                                                                label='대표자명'
                                                                value={item.ceo_name}
                                                                placeholder=""
                                                                onChange={(e) => {
                                                                    setItem(
                                                                        {
                                                                            ...item,
                                                                            ['ceo_name']: e.target.value
                                                                        }
                                                                    )
                                                                }} />
                                                            <TextField
                                                                size="small"
                                                                label='회사 전화번호'
                                                                value={item.company_phone_num}
                                                                placeholder=""
                                                                onChange={(e) => {
                                                                    setItem(
                                                                        {
                                                                            ...item,
                                                                            ['company_phone_num']: onlyNumberText(e.target.value)
                                                                        }
                                                                    )
                                                                }} />

                                                        </>}
                                                    <TextField
                                                        size="small"
                                                        label='생년월일'
                                                        value={item.birth}
                                                        placeholder="19990101"
                                                        onChange={(e) => {
                                                            setItem(
                                                                {
                                                                    ...item,
                                                                    ['birth']: onlyNumberText(e.target.value)
                                                                }
                                                            )
                                                        }} />
                                                    <TextField
                                                        size="small"
                                                        label='주민등록번호 뒷자리 첫번째숫자'
                                                        value={item.acct_back_one_num}
                                                        placeholder="1"
                                                        onChange={(e) => {
                                                            setItem(
                                                                {
                                                                    ...item,
                                                                    ['acct_back_one_num']: onlyNumberText(e.target.value)
                                                                }
                                                            )
                                                        }} />
                                                    <TextField
                                                        size="small"
                                                        label='이름'
                                                        value={item.name}
                                                        placeholder="홍길동(출금계좌 예금주와 일치해야 함)"
                                                        onChange={(e) => {
                                                            setItem(
                                                                {
                                                                    ...item,
                                                                    ['name']: e.target.value
                                                                }
                                                            )
                                                        }} />

                                                </Stack>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Card sx={{ p: 2, height: '100%' }}>
                                                <Stack spacing={2}>
                                                    <FormControl size="small" disabled={item?.phone_check == 1}>
                                                        <InputLabel>통신사</InputLabel>
                                                        <Select label='통신사' value={item?.tel_com}
                                                            onChange={(e) => {
                                                                setItem(
                                                                    {
                                                                        ...item,
                                                                        ['tel_com']: e.target.value,
                                                                    }
                                                                )
                                                            }}>
                                                            {telComList.map((itm) => {
                                                                return <MenuItem value={itm.labelValue}>{itm.label}</MenuItem>
                                                            })}
                                                        </Select>
                                                    </FormControl>
                                                    <TextField
                                                        label='휴대폰번호'
                                                        size="small"
                                                        value={item.phone_num}
                                                        disabled={item?.phone_check == 1}
                                                        placeholder="하이픈(-) 제외 입력"
                                                        onChange={(e) => {
                                                            setItem(
                                                                {
                                                                    ...item,
                                                                    ['phone_num']: onlyNumberText(e.target.value)
                                                                }
                                                            )
                                                        }}
                                                        InputProps={{
                                                            endAdornment: (themeDnsData?.setting_obj?.is_use_auth == 1 ? <Button
                                                                disabled={item?.phone_check == 1}
                                                                variant='contained'
                                                                size='small'
                                                                sx={{ width: '160px', marginRight: '-0.5rem' }}
                                                                onClick={onCheckPhoneNumRequest}>{'인증번호 발송'}</Button> : <div />)
                                                        }}
                                                    />
                                                    <TextField
                                                        label='인증번호'
                                                        size="small"
                                                        value={item.phone_vrf_word}
                                                        placeholder=""
                                                        onChange={(e) => {
                                                            setItem(
                                                                {
                                                                    ...item,
                                                                    ['phone_vrf_word']: e.target.value
                                                                }
                                                            )
                                                        }}
                                                        InputProps={{
                                                            endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                                                                disabled={(!authItem?.tid) || item?.phone_check == 1}
                                                                onClick={onCheckPhoneNumCheck}>{item?.phone_check == 1 ? '확인완료' : '인증번호 확인'}</Button>
                                                        }}
                                                    />
                                                </Stack>
                                            </Card>
                                        </Grid>
                                    </>}
                                {currentStep == 1 &&
                                    <>
                                        <Grid item xs={12} md={6} style={{ margin: 'auto' }}>
                                            <Card sx={{ p: 2, height: '100%' }}>
                                                <Stack spacing={2}>
                                                    <Stack spacing={1}>
                                                        <FormControl>
                                                            <InputLabel>출금은행</InputLabel>
                                                            <Select
                                                                label='출금은행'
                                                                value={item.deposit_bank_code}
                                                                onChange={e => {
                                                                    setItem({
                                                                        ...item,
                                                                        ['deposit_bank_code']: e.target.value
                                                                    })
                                                                }}
                                                            >
                                                                {bankCodeList().map((itm, idx) => {
                                                                    if (itm?.value != '092') {
                                                                        return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                                                    }
                                                                })}
                                                            </Select>
                                                        </FormControl>
                                                    </Stack>
                                                    <TextField
                                                        label='출금계좌번호'
                                                        value={item.deposit_acct_num}
                                                        onChange={(e) => {
                                                            setItem(
                                                                {
                                                                    ...item,
                                                                    ['deposit_acct_num']: onlyNumberText(e.target.value),
                                                                }
                                                            )
                                                        }} />
                                                    <TextField
                                                        label='예금주명'
                                                        value={item.name}
                                                    />
                                                    <Button onClick={oneWonCertification} variant="outlined" style={{ height: '48px', }}>1원인증 발송</Button>
                                                    {item.is_send_one_won_check &&
                                                        <>
                                                            <TextField
                                                                label='인증번호'
                                                                value={item.vrf_word}
                                                                placeholder=""
                                                                onChange={(e) => {
                                                                    setItem(
                                                                        {
                                                                            ...item,
                                                                            ['vrf_word']: e.target.value
                                                                        }
                                                                    )
                                                                }} />
                                                            <Button disabled={item?.is_check_bank} onClick={checkOneWonCertification} variant="outlined" style={{ height: '48px', }}>{item?.is_check_bank ? '확인완료' : '인증확인'}</Button>
                                                        </>}
                                                </Stack>
                                            </Card>
                                        </Grid>
                                    </>}
                                {currentStep == 2 &&
                                    <>

                                        <Grid item xs={12} md={6} style={{ margin: 'auto' }}>
                                            <Grid item xs={12} md={6} style={{ margin: 'auto' }}>
                                                <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem', overflow: 'auto' }}>
                                                    {gift_tab_list.map((tab) => (
                                                        <Button
                                                            variant={tab.value == giftTab ? 'contained' : 'outlined'}
                                                            onClick={() => {
                                                                setGiftCard({});
                                                                setGiftTab(tab.value)
                                                            }}
                                                        >{tab.label}</Button>
                                                    ))}
                                                </Row>
                                            </Grid>
                                            {giftTab == 0 &&
                                                <>
                                                    <Card sx={{ p: 2, height: '100%' }}>
                                                        <Stack spacing={2}>
                                                            <Stack spacing={1}>
                                                                <FormControl>
                                                                    <InputLabel>상품권사</InputLabel>
                                                                    <Select
                                                                        label='상품권사'
                                                                        value={giftCard.gift_biz}
                                                                        onChange={e => {
                                                                            setGiftCard({
                                                                                ...giftCard,
                                                                                ['gift_biz']: e.target.value
                                                                            })
                                                                        }}
                                                                    >
                                                                        <MenuItem value={'PINPLENET'}>핀플넷</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Stack>
                                                            <Stack spacing={1}>
                                                                <FormControl>
                                                                    <InputLabel>상품권 금액 선택</InputLabel>
                                                                    <Select
                                                                        label='상품권 금액 선택'
                                                                        value={giftCard.gift_price}
                                                                        onChange={e => {
                                                                            setGiftCard({
                                                                                ...giftCard,
                                                                                ['gift_price']: e.target.value
                                                                            })
                                                                        }}
                                                                    >
                                                                        <MenuItem value={1}>{commarNumber(10000)}</MenuItem>
                                                                        <MenuItem value={5}>{commarNumber(50000)}</MenuItem>
                                                                        <MenuItem value={10}>{commarNumber(100000)}</MenuItem>
                                                                        <MenuItem value={30}>{commarNumber(300000)}</MenuItem>
                                                                        <MenuItem value={50}>{commarNumber(500000)}</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Stack>
                                                            <Stack spacing={1}>
                                                                <FormControl>
                                                                    <InputLabel>상품권 수량 선택</InputLabel>
                                                                    <Select
                                                                        label='상품권 수량 선택'
                                                                        value={giftCard.gift_count}
                                                                        onChange={e => {
                                                                            setGiftCard({
                                                                                ...giftCard,
                                                                                ['gift_count']: e.target.value
                                                                            })
                                                                        }}
                                                                    >
                                                                        <MenuItem value={1}>1개</MenuItem>
                                                                        <MenuItem value={2}>2개</MenuItem>
                                                                        <MenuItem value={3}>3개</MenuItem>
                                                                        <MenuItem value={4}>4개</MenuItem>
                                                                        <MenuItem value={5}>5개</MenuItem>
                                                                        <MenuItem value={6}>6개</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Stack>
                                                            <Stack spacing={1}>
                                                                총 주문금액: {commarNumber((giftCard?.gift_price ?? 0) * 10000 * (giftCard?.gift_count ?? 0))}원
                                                            </Stack>
                                                            <Stack spacing={1}>
                                                                <Typography variant="body2" style={{ color: '#888' }}>발송된 입금계좌로 선택금액만큼 입금하시면 위에 선택한 내용과 일치한 상품권이 발송됩니다.</Typography>
                                                            </Stack>
                                                            <Button onClick={onRequestGiftOrder} variant="outlined" style={{ height: '48px', }}>입금계좌 발송</Button>
                                                        </Stack>
                                                    </Card>
                                                </>}
                                            {giftTab == 1 &&
                                                <>
                                                    <Card sx={{ p: 2, height: '100%' }}>
                                                        <Stack spacing={2}>
                                                            <Stack spacing={1}>
                                                                <FormControl>
                                                                    <InputLabel>상품권사</InputLabel>
                                                                    <Select
                                                                        label='상품권사'
                                                                        value={giftCard.gift_biz}
                                                                        onChange={e => {
                                                                            setGiftCard({
                                                                                ...giftCard,
                                                                                ['gift_biz']: e.target.value,
                                                                                tid: '',
                                                                            })
                                                                        }}
                                                                    >
                                                                        <MenuItem value={'PINPLENET'}>핀플넷</MenuItem>
                                                                    </Select>
                                                                </FormControl>
                                                            </Stack>
                                                            <TextField
                                                                label='상품권번호 (-포함)'
                                                                value={giftCard.gift_num}
                                                                onChange={(e) => {
                                                                    setGiftCard(
                                                                        {
                                                                            ...giftCard,
                                                                            ['gift_num']: e.target.value,
                                                                            tid: '',
                                                                        }
                                                                    )
                                                                }} />
                                                            <Button onClick={onRequestGiftAuth} variant="outlined" style={{ height: '48px', }}>인증번호 발송</Button>
                                                            {(giftCard?.tid || true) &&
                                                                <>
                                                                    <TextField
                                                                        label='인증번호'
                                                                        value={giftCard.vrf_word}
                                                                        onChange={(e) => {
                                                                            setGiftCard(
                                                                                {
                                                                                    ...giftCard,
                                                                                    ['vrf_word']: e.target.value,
                                                                                }
                                                                            )
                                                                        }} />
                                                                    <Button onClick={onRequestGiftUse} variant="outlined" style={{ height: '48px', }}>상품권 사용 확정</Button>
                                                                </>}
                                                        </Stack>
                                                    </Card>
                                                </>}

                                        </Grid>
                                    </>}
                            </>}
                        {currentTab == 1 &&
                            <>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardHeader title={`가맹점 정보`} sx={{ padding: '0', marginBottom: '2rem' }} />
                                        <Stack spacing={3}>
                                            <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                                                <Typography variant="body2" style={{ width: '150px' }}>가맹점명</Typography>
                                                <Typography variant="subtitle2">{user?.nickname}</Typography>
                                            </Row>
                                            <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                                                <Typography variant="body2" style={{ width: '150px' }}>가맹점 아이디</Typography>
                                                <Typography variant="subtitle2">{user?.user_name}</Typography>
                                            </Row>
                                            <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                                                <Typography variant="body2" style={{ width: '150px' }}>가맹점 mid</Typography>
                                                <Typography variant="subtitle2">{item?.mid}</Typography>
                                            </Row>
                                        </Stack>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <CardHeader title={`발급 정보`} sx={{ padding: '0', marginBottom: '2rem' }} />
                                        <Stack spacing={3}>
                                            <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                                                <Typography variant="body2" style={{ width: '180px' }}>상품권회원발급주소</Typography>
                                                <Typography
                                                    variant="subtitle2"
                                                    style={{ color: 'blue', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        window.open(`/gift-card/${item?.mid}`)
                                                    }}
                                                >{'https://' + themeDnsData?.dns + `/gift-card/${item?.mid}`}</Typography>
                                            </Row>
                                        </Stack>
                                    </Card>
                                </Grid>
                            </>}
                    </Grid>
                </>}
        </>
    )
}
export default GiftCardBankners;