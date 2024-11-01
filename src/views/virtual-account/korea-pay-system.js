
import { Button, Card, CardHeader, CircularProgress, Dialog, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList, genderList, telComList, virtualAccountUserTypeList } from "src/utils/format";
import BlankLayout from "src/layouts/BlankLayout";
import { useAuthContext } from "src/auth/useAuthContext";
import { Row } from "src/components/elements/styled-components";
import _ from "lodash";
import { generateRandomString, onlyNumberText } from "src/utils/function";
import axios from "axios";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountKoreaPaySystem = () => {
    const router = useRouter();

    const { themeDnsData } = useSettingsContext();

    const [item, setItem] = useState({
        birth: '',
        name: '',
        phone_num: '',
    });

    useEffect(() => {
        // KPPayForm 초기화 함수
        const init = () => {
            const script = document.createElement('script');
            script.src = 'https://code.jquery.com/jquery-3.6.4.min.js';
            document.getElementsByTagName('head')[0].appendChild(script);

            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            meta.content = 'upgrade-insecure-requests';
            document.getElementsByTagName('head')[0].appendChild(meta);

            window.addEventListener('message', (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.exec === 'AUTH_RESULT') {
                        authResult(data);
                    }
                } catch (exception) {
                    console.error(exception);
                }
            });
        };

        //init();
    }, []);

    const start = (config) => {
        if (!validation(config)) {
            alert('Validation failed');
            return;
        }
        submit(config);
    };

    const validation = (config) => {
        // 유효성 검사 로직
        if (!config.publicKey) {
            alert('publicKey is required.');
            return false;
        }
        // ... 나머지 유효성 검사
        return true;
    };

    const submit = async (config) => {
        if (!window.confirm(`발급하러 가시겠습니까?`)) {
            return;
        }


        // 제출 로직
        const form = document.createElement('form');
        form.setAttribute('method', 'get');
        form.setAttribute('action', 'https://form.kp-pay.com/form/startPhoneAuth');
        form.setAttribute('target', 'KPPAY_frame');

        Object.keys(config).forEach((key) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', key);
            input.setAttribute('value', config[key]);
            form.appendChild(input);
        });
        try {
            let exist_account = await apiManager(`virtual-accounts/exist-check`, 'create', {
                name: item?.name,
                phone_num: item?.phone_num,
                birth: item?.birth,
            })
            if (!exist_account) {
                return;
            }
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', 'account');
            input.setAttribute('value', exist_account?.virtual_acct_num);
            form.appendChild(input);
        } catch (err) {
            console.log(err);
        }
        document.body.appendChild(form);
        form.submit();
        form.remove();
    };

    const authResult = (data) => {
        // 결과 처리 로직
        console.log(data);
    };

    const cancel = () => {
        if (window.confirm('Are you sure you want to cancel?')) {
            // 취소 처리
        }
    };

    return (
        <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: '100%', maxWidth: '500px', margin: 'auto' }}>
                <CardHeader title={`가상계좌 발급하기`} sx={{ padding: '0', marginBottom: '2rem' }} />
                <Stack spacing={3}>
                    <TextField
                        label='생년월일 6자리'
                        value={item.birth}
                        onChange={(e) => {
                            if (e.target.value.length > 6) {
                                return;
                            }
                            setItem(
                                {
                                    ...item,
                                    ['birth']: onlyNumberText(e.target.value),
                                }
                            )
                        }} />
                    <TextField
                        label='휴대폰번호'
                        value={item.phone_num}
                        onChange={(e) => {
                            if (e.target.value.length > 11) {
                                return;
                            }
                            setItem(
                                {
                                    ...item,
                                    ['phone_num']: onlyNumberText(e.target.value),
                                }
                            )
                        }} />
                    <TextField
                        label='이름'
                        value={item.name}
                        onChange={(e) => {
                            setItem(
                                {
                                    ...item,
                                    ['name']: e.target.value,
                                }
                            )
                        }} />
                    <Button onClick={() => start({
                        publicKey: themeDnsData?.deposit_sign_key,
                        trxType: 0,
                        trackId: `${generateRandomString(20)}${new Date().getTime()}`,
                        identity: item?.birth,
                        phoneNo: item?.phone_num,
                        userAccountName: item?.name,
                        udf1: router.query?.mid,
                        responseFunction: (value) => {
                            console.log(value);
                        }
                        // 나머지 설정
                    })} variant="outlined" style={{ height: '40px', }}>해당 정보로 발급하러 가기</Button>
                </Stack>
            </Card>
        </Grid>

    );
}
export default VirtualAccountKoreaPaySystem;