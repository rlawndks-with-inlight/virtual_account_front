
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
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountPaytus = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();
    const { user } = useAuthContext();
    const router = useRouter();

    const [mchtList, setMchtList] = useState([]);
    const [loading, setLoading] = useState(false);
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
        if (router.query?.id) {
            data = await apiManager('virtual-accounts', 'get', {
                id: router.query.id
            })
        }
        setItem(data);
        setLoading(false);
    }
    const onSave = async () => {
        let result = undefined
        result = await apiServer(`${process.env.API_URL}/api/acct/v2/issuance`, 'create', {
            api_key: themeDnsData?.api_key,
            mid: item?.mid,
            verify_tr_no: item?.verify_tr_no,
            verify_tr_dt: item?.verify_tr_dt,
        });
        if (result?.is_issuance) {
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
        let result = await apiServer(`${process.env.API_URL}/api/acct/v2/account`, 'create', {
            api_key: themeDnsData?.api_key,
            mid: item?.mid,
            bank_code: item?.deposit_bank_code,
            account: item?.deposit_acct_num,
            name: item?.deposit_acct_name,
        });
        let data = item;
        if (result?.verify_tr_no) {
            toast.success('성공적으로 발송 되었습니다.');
            data = {
                ...data,
                is_send_one_won_check: true,
                verify_tr_no: result?.verify_tr_no,
                verify_tr_dt: result?.verify_tr_dt,
            }
        }
        setItem(data);
        setLoading(false);
    }
    const checkOneWonCertification = async () => {
        let result = await apiServer(`${process.env.API_URL}/api/acct/v2/account/check`, 'create', {
            api_key: themeDnsData?.api_key,
            mid: item?.mid,
            vrf_word: item?.vrf_word,
            verify_tr_no: item?.verify_tr_no,
            verify_tr_dt: item?.verify_tr_dt,
        });
        if (result?.is_check) {
            toast.success('성공적으로 인증 되었습니다.');
            setItem({
                ...item,
                is_check_bank: true
            })
        }
    }
    const sendSmsPushVirtualAccount = async () => {
        let result = await apiServer(`${process.env.API_URL}/api/acct/v2/sms`, 'create', {
            api_key: themeDnsData?.api_key,
            mid: item?.mid,
            gender: item?.gender,
            ntv_frnr: item?.ntv_frnr,
            birth: item?.birth,
            tel_com: item?.tel_com,
            phone_num: item?.phone_num,
            verify_tr_no: item?.verify_tr_no,
            verify_tr_dt: item?.verify_tr_dt,
        });
        if (result?.tx_seq_no) {
            toast.success('성공적으로 발송 되었습니다.');
            setItem({
                ...item,
                tx_seq_no: result?.tx_seq_no,
            })
        }
    }
    const checkSmsVerityCodeVirtualAccount = async () => {
        let result = await apiServer(`${process.env.API_URL}/api/acct/v2/sms/check`, 'create', {
            api_key: themeDnsData?.api_key,
            mid: item?.mid,
            phone_vrf_word: item?.phone_vrf_word,
            verify_tr_no: item?.verify_tr_no,
            verify_tr_dt: item?.verify_tr_dt,
            tx_seq_no: item?.tx_seq_no,
        });
        if (result?.is_check) {
            toast.success('성공적으로 인증 되었습니다.');
            setItem({
                ...item,
                is_check_all: true
            })
        }
    }

    return (
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
                                <Stack spacing={3}>
                                    {user?.level >= 40 &&
                                        <>
                                            <FormControl variant='outlined'  >
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
                                        </>}
                                    <TextField
                                        label='MID'
                                        value={item.mid}
                                        disabled={true}
                                    />
                                    <Stack spacing={1}>
                                        <FormControl>
                                            <InputLabel>입금은행</InputLabel>
                                            <Select
                                                label='입금은행'
                                                value={item.deposit_bank_code}
                                                disabled={(item?.is_check_bank || item?.deposit_acct_check == 1)}
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
                                        label='입금계좌번호'
                                        value={item.deposit_acct_num}
                                        disabled={(item?.is_check_bank || item?.deposit_acct_check == 1)}
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['deposit_acct_num']: onlyNumberText(e.target.value),
                                                }
                                            )
                                        }} />
                                    <TextField
                                        label='입금자명'
                                        value={item.deposit_acct_name}
                                        disabled={(item?.is_check_bank || item?.deposit_acct_check == 1)}
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['deposit_acct_name']: e.target.value
                                                }
                                            )
                                        }} />
                                    <Button onClick={oneWonCertification} variant="outlined" style={{ height: '48px', }}
                                        disabled={item?.is_check_bank || item?.deposit_acct_check == 1}
                                    >{(item?.is_check_bank || item?.deposit_acct_check == 1) ? "확인완료" : '1원인증 발송'}</Button>
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
                                            <Button disabled={item?.is_check_bank || item?.deposit_acct_check == 1} onClick={checkOneWonCertification} variant="outlined" style={{ height: '48px', }}>{(item?.is_check_bank || item?.deposit_acct_check == 1) ? '확인완료' : '인증확인'}</Button>
                                        </>}
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    {/* <FormControl variant='outlined' >
                                        <InputLabel>계좌구분</InputLabel>
                                        <Select label='계좌구분' value={item?.expire_type ?? 0}
                                            onChange={(e) => {
                                                let obj = {
                                                    ...item,
                                                    expire_type: e.target.value,
                                                }

                                                setItem(obj)
                                            }}>
                                            <MenuItem value={0}>전용계좌</MenuItem>
                                            <MenuItem value={1}>임시계좌</MenuItem>
                                        </Select>
                                    </FormControl> */}
                                    <FormControl >
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
                                    <FormControl>
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
                                    <FormControl>
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
                                        value={item.phone_num}
                                        placeholder="하이픈(-) 제외 입력"
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['phone_num']: e.target.value
                                                }
                                            )
                                        }}
                                        InputProps={{
                                            endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                                                disabled={!(item?.is_check_bank || item?.deposit_acct_check == 1)}
                                                onClick={sendSmsPushVirtualAccount}>{'인증번호 발송'}</Button>
                                        }}
                                    />
                                    <TextField
                                        label='인증번호'
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
                                                disabled={!item?.tx_seq_no}
                                                onClick={checkSmsVerityCodeVirtualAccount}>{'인증번호 확인'}</Button>
                                        }}
                                    />
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
                                disabled={!item?.is_check_all}
                                style={{
                                    height: '48px', width: '120px', marginLeft: 'auto'
                                }} onClick={() => {
                                    setModal({
                                        func: () => { onSave() },
                                        icon: 'material-symbols:edit-outline',
                                        title: '발급 하시겠습니까?'
                                    })
                                }}>
                                발급
                            </Button>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </>
    )
}
export default VirtualAccountPaytus;