
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, commarNumber, commarNumberInput, getAllIdsWithParents, getNumberByPercent, onlyNumberText } from "src/utils/function";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager } from "src/utils/api-manager";
import { bankCodeList } from "src/utils/format";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";

const ChangePw = () => {

    const { setModal } = useModal()

    const { user } = useAuthContext();

    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState({
        password: '',
        new_password: '',
        new_password_check: '',
    })

    const onSave = async () => {
        if (
            !item.password ||
            !item.new_password ||
            !item.new_password_check
        ) {
            toast.error('필수값을 입력해 주세요.');
            return;
        }
        if (item.new_password != item.new_password_check) {
            toast.error('변경 비밀번호가 일치하지 않습니다.');
            return;
        }
        setModal({
            func: () => { onChangePw() },
            icon: 'material-symbols:edit-outline',
            title: '저장 하시겠습니까?'
        })
    }
    const onChangePw = async () => {
        let result = await apiManager('auth/change-pw', 'update', item);
        if (result) {
            toast.success('성공적으로 저장되었습니다.');
            window.location.reload();
        }
    }
    return (
        <>
            {!loading &&
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            닉네임
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {user?.nickname}
                                        </Typography>
                                    </Stack>

                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            아이디
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {user?.user_name}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    <TextField
                                        label='이전 비밀번호'
                                        value={item?.password}
                                        placeholder=""
                                        type="password"
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['password']: e.target.value
                                                }
                                            )
                                        }} />
                                    <TextField
                                        label='새 비밀번호'
                                        value={item?.new_password}
                                        placeholder=""
                                        type="password"
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['new_password']: e.target.value
                                                }
                                            )
                                        }} />
                                    <TextField
                                        label='새 비밀번호 확인'
                                        value={item?.new_password_check}
                                        placeholder=""
                                        type="password"
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['new_password_check']: e.target.value
                                                }
                                            )
                                        }} />
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={1} style={{ display: 'flex' }}>
                                    <Button variant="contained" style={{
                                        height: '48px', width: '120px', marginLeft: 'auto'
                                    }} onClick={onSave}>
                                        변경하기
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
ChangePw.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ChangePw
