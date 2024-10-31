
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
import { onlyNumberText } from "src/utils/function";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountKoreaPaySystem = () => {
    const router = useRouter();

    const { themeDnsData } = useSettingsContext();

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

        init();
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

    const submit = (config) => {
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

                    <Button onClick={() => start({
                        publicKey: 'pk_8a10-2389ba-8f4-09d73',
                        trxType: 0,
                        trackId: `${new Date().getTime()}${router.query?.mid}`,
                        udf1: router.query?.mid,
                        // 나머지 설정
                    })} variant="outlined" style={{ height: '40px', }}>발급하러 가기</Button>
                </Stack>
            </Card>
        </Grid>

    );
}
export default VirtualAccountKoreaPaySystem;