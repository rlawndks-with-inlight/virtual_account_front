
import { Button, Card, CardHeader, CircularProgress, Dialog, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList, genderList, ntvFrnrList, telComList, virtualAccountUserTypeList } from "src/utils/format";
import BlankLayout from "src/layouts/BlankLayout";
import { useAuthContext } from "src/auth/useAuthContext";
import { Row } from "src/components/elements/styled-components";
import _ from "lodash";
import { onlyNumberText } from "src/utils/function";
import axios from "axios";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountIcb = () => {
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
        user_type: 0,
    })
    const [authItem, setAuthItem] = useState({})
    const [currentTab, setCurrentTab] = useState(0);

    const tab_list = [
        {
            value: 0,
            label: '가상계좌발급'
        },
        {
            value: 1,
            label: '가상계좌발급정보'
        },
    ]
    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = async () => {
        let mcht_list = await apiManager(`users`, 'list', {
            level: 10,
        })
        let data = item;
        setMchtList(mcht_list?.content ?? []);
        data.mid = router.query?.mid || user?.mid;
        if (!(user?.level >= 40) && !router.query?.mid && !user?.mid && !router.query?.id) {
            return;
        }
        if (router.query?.id) {
            data = await apiManager('virtual-accounts', 'get', {
                id: router.query.id
            })
            console.log(data)
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
        result = await apiServer(`${process.env.API_URL}/api/acct/v4/issuance`, 'create', { ...item, api_key: themeDnsData?.api_key, mid: item?.mid, });
        if (result?.ci) {
            toast.success("성공적으로 발급 되었습니다.");
            if (router.asPath.split('/')[1] == 'manager') {
                router.push('/manager/virtual-account');
            } else {
                router.push(`/virtual-account/result?ci=${result?.ci}`);
            }
        }
    }
    const oneWonCertification = async () => {
        setLoading(true);
        let result = await apiServer(`${process.env.API_URL}/api/acct/v4/request`, 'create', {
            mid: item?.mid,
            deposit_bank_code: item?.deposit_bank_code,
            deposit_acct_num: item?.deposit_acct_num,
            name: item?.deposit_acct_name,
            api_key: themeDnsData?.api_key,
            user_type: item?.user_type,
            virtual_user_name: item?.virtual_user_name,
            business_num: item?.business_num,
            phone_num: item?.phone_num,
        });
        let data = item;
        if (result?.tid) {
            toast.success('성공적으로 발송 되었습니다.');
            data = {
                ...data,
                tid: result?.tid,
                date: result?.date,
            }
        }
        setItem(data);
        setLoading(false);
    }
    const checkOneWonCertification = async () => {
        let result = await apiServer(`${process.env.API_URL}/api/acct/v4/check`, 'create', {
            mid: item?.mid,
            tid: item?.tid,
            date: item?.date,
            vrf_word: item?.vrf_word,
            api_key: themeDnsData?.api_key,
            deposit_bank_code: item?.deposit_bank_code,
            deposit_acct_num: item?.deposit_acct_num,
        });
        if (result?.tid) {
            toast.success('성공적으로 인증 되었습니다.');
            setItem({
                ...item,
                deposit_acct_check: 1,
            })
        }
    }
    const checkDepositNameCertification = async () => {
        setLoading(true);
        let result = await apiServer(`${process.env.API_URL}/api/acct/v4/name`, 'create', {
            mid: item?.mid,
            deposit_bank_code: item?.deposit_bank_code,
            deposit_acct_num: item?.deposit_acct_num,
            name: item?.deposit_acct_name,
            api_key: themeDnsData?.api_key,
            user_type: item?.user_type,
            virtual_user_name: item?.virtual_user_name,
            phone_num: item?.phone_num,
        });
        let data = item;
        if (result?.tid) {
            toast.success('성공적으로 확인 되었습니다.');
            data = {
                ...data,
                tid: result?.tid,
                deposit_acct_check: 1,
            }
        }
        setItem(data);
        setLoading(false);
    }
    const onCheckPhoneNumRequest = async () => {
        let { data: result } = await axios.post(`${process.env.API_URL}/api/acct/v4/phone/request`, {
            ...item,
            api_key: themeDnsData?.api_key,
            name: item?.deposit_acct_name,
        });
        if (result?.result > 0) {
            toast.success('성공적으로 발송 되었습니다.');
            setAuthItem(result?.data);
        } else {
            toast.error(result?.message);
            if (result?.result == -105) {
                setTimeout(() => {
                    alert('발급된 계좌로 이동합니다.');
                    window.location.href = `/virtual-account/result?ci=${result?.data?.ci}`
                }, 500);
            }
        }
    }
    const onCheckPhoneNumCheck = async () => {
        let result = await apiServer(`${process.env.API_URL}/api/acct/v4/phone/check`, 'create', {
            ...item,
            api_key: themeDnsData?.api_key,
            vrf_word: item?.phone_vrf_word,
            name: item?.deposit_acct_name,
            ...authItem,
        });
        if (result) {
            toast.success('성공적으로 인증 되었습니다.');
            setItem({
                ...item,
                ci: result?.ci,
                phone_check: 1,
            })
        }
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
                        </>}
                    <Grid container spacing={3}>
                        {currentTab == 0 &&
                            <>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <Stack spacing={2}>
                                            {/* {user?.level >= 40 &&
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
                                                            <MenuItem value={null}>{`가맹점 선택안함`}</MenuItem>
                                                            {mchtList.map(mcht => {
                                                                return <MenuItem value={mcht?.mid}>{`${mcht?.nickname}(${mcht?.user_name})`}</MenuItem>
                                                            })}
                                                        </Select>
                                                    </FormControl>
                                                    <TextField
                                                        size="small"
                                                        label='MID'
                                                        value={item.mid}
                                                        disabled={true}
                                                    />
                                                </>} */}

                                            {themeDnsData?.setting_obj?.is_use_virtual_user_name == 1 &&
                                                <>
                                                    <TextField
                                                        label='아이디'
                                                        size="small"
                                                        value={item.virtual_user_name}
                                                        placeholder=""
                                                        onChange={(e) => {
                                                            setItem(
                                                                {
                                                                    ...item,
                                                                    ['virtual_user_name']: e.target.value
                                                                }
                                                            )
                                                        }} />
                                                </>}


                                            {themeDnsData?.deposit_process_type == 0 &&
                                                <>
                                                    <FormControl variant='outlined' size="small" disabled={item?.phone_check == 1 || item?.deposit_acct_check == 1}>
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
                                                                label='사업자등록번호'
                                                                size="small"
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
                                                                label='회사명(상호)'
                                                                size="small"
                                                                value={item.company_name}
                                                                placeholder=""
                                                                onChange={(e) => {
                                                                    setItem(
                                                                        {
                                                                            ...item,
                                                                            ['company_name']: e.target.value,
                                                                            ['deposit_acct_name']: e.target.value,
                                                                            ['name']: e.target.value,
                                                                        }
                                                                    )
                                                                }} />
                                                            {/* <TextField
                                                                label='대표자명'
                                                                size="small"
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
                                                                label='회사 전화번호'
                                                                size="small"
                                                                value={item.company_phone_num}
                                                                placeholder=""
                                                                onChange={(e) => {
                                                                    setItem(
                                                                        {
                                                                            ...item,
                                                                            ['company_phone_num']: onlyNumberText(e.target.value)
                                                                        }
                                                                    )
                                                                }} /> */}

                                                        </>}
                                                    {item?.user_type == 0 &&
                                                        <>
                                                            <TextField
                                                                size="small"
                                                                label='생년월일'
                                                                value={item.birth}
                                                                disabled={item?.phone_check == 1}
                                                                placeholder="19990101"
                                                                onChange={(e) => {
                                                                    setItem(
                                                                        {
                                                                            ...item,
                                                                            ['birth']: onlyNumberText(e.target.value)
                                                                        }
                                                                    )
                                                                }} />
                                                            <FormControl size="small" disabled={item?.phone_check == 1}>
                                                                <InputLabel>성별</InputLabel>
                                                                <Select label='성별' value={item?.gender}
                                                                    onChange={(e) => {
                                                                        setItem(
                                                                            {
                                                                                ...item,
                                                                                ['gender']: e.target.value,
                                                                            }
                                                                        )
                                                                    }}>
                                                                    {genderList.map((itm) => {
                                                                        return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                                                    })}
                                                                </Select>
                                                            </FormControl>
                                                            <FormControl size="small" disabled={item?.phone_check == 1}>
                                                                <InputLabel>내외국인</InputLabel>
                                                                <Select label='내외국인' value={item?.ntv_frnr}
                                                                    onChange={(e) => {
                                                                        setItem(
                                                                            {
                                                                                ...item,
                                                                                ['ntv_frnr']: e.target.value,
                                                                            }
                                                                        )
                                                                    }}>
                                                                    {ntvFrnrList.map((itm) => {
                                                                        return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                                                    })}
                                                                </Select>
                                                            </FormControl>
                                                            <TextField
                                                                label='이름'
                                                                size="small"
                                                                value={item.deposit_acct_name}
                                                                disabled={item?.phone_check == 1}
                                                                onChange={(e) => {
                                                                    setItem(
                                                                        {
                                                                            ...item,
                                                                            ['deposit_acct_name']: e.target.value,
                                                                            ['name']: e.target.value,
                                                                        }
                                                                    )
                                                                }} />
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
                                                                        return <MenuItem value={itm.value}>{itm.label}</MenuItem>
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
                                                        </>}
                                                </>}
                                        </Stack>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <Stack spacing={2}>
                                            <Stack spacing={1}>
                                                <FormControl size="small" disabled={item?.deposit_acct_check == 1}>
                                                    <InputLabel>입금은행</InputLabel>
                                                    <Select
                                                        label='입금은행'
                                                        value={item.deposit_bank_code}
                                                        onChange={e => {
                                                            setItem({
                                                                ...item,
                                                                ['deposit_bank_code']: e.target.value
                                                            })
                                                        }}
                                                    >
                                                        {bankCodeList().map((itm, idx) => {
                                                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </Stack>
                                            <TextField
                                                disabled={item?.deposit_acct_check == 1}
                                                size="small"
                                                label='입금계좌번호'
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
                                                size="small"
                                                value={item.deposit_acct_name}
                                                disabled={item?.deposit_acct_check == 1}
                                                onChange={(e) => {
                                                    setItem(
                                                        {
                                                            ...item,
                                                            ['deposit_acct_name']: e.target.value,
                                                            ['name']: e.target.value,
                                                        }
                                                    )
                                                }} />

                                            {
                                                //( (item?.user_type == 1 || item?.user_type == 2) ||themeDnsData?.deposit_process_type == 1) 
                                                true &&
                                                <>
                                                    <Button onClick={oneWonCertification} disabled={item?.deposit_acct_check == 1} variant="outlined" style={{ height: '40px', }}>1원인증 발송</Button>
                                                    {item.tid &&
                                                        <>
                                                            <TextField
                                                                size="small"
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
                                                            <Button
                                                                disabled={item?.deposit_acct_check}
                                                                onClick={checkOneWonCertification} variant="outlined" style={{ height: '40px', }}>{item?.deposit_acct_check ? '확인완료' : '인증확인'}</Button>
                                                        </>}
                                                </>}
                                        </Stack>
                                    </Card>
                                </Grid>
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
                                                <Typography variant="body2" style={{ width: '150px' }}>가상계좌 발급주소</Typography>
                                                <Typography
                                                    variant="subtitle2"
                                                    style={{ color: 'blue', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        window.open('https://' + themeDnsData?.dns + `/virtual-account/${item?.mid}`)
                                                    }}
                                                >{'https://' + themeDnsData?.dns + `/virtual-account/${item?.mid}`}</Typography>
                                            </Row>
                                        </Stack>
                                    </Card>
                                </Grid>
                            </>}
                        <Grid item xs={12} md={12}>
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={1} style={{ display: 'flex' }}>

                                    <Button variant="contained"
                                        disabled={!item?.deposit_acct_check == 1}
                                        style={{
                                            height: '48px', width: '120px', marginLeft: 'auto'
                                        }} onClick={() => {
                                            if (window.confirm('발급 하시겠습니까?')) {
                                                onSave()
                                            }
                                        }}>
                                        발급
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
export default VirtualAccountIcb;