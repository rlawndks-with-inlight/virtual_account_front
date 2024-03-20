import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { apiManager } from 'src/utils/api-manager';
import toast from 'react-hot-toast';

// ----------------------------------------------------------------------

const Commit = () => {
    const router = useRouter();


    const onSave = async () => {
        let result = await apiManager(`git/commit`, 'create');
        console.log(result);
        if (result) {
            toast.success('성공적으로 저장 되었습니다.');
        }
    }
    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                    <Card sx={{ p: 2, height: '100%' }}>
                        <Stack spacing={3}>
                        </Stack>
                    </Card>
                </Grid>
                <Grid item xs={12} md={12}>
                    <Card sx={{ p: 3 }}>
                        <Stack spacing={1} style={{ display: 'flex' }}>
                            <Button variant="contained" style={{
                                height: '48px', width: '120px', marginLeft: 'auto'
                            }} onClick={() => {
                                if (window.confirm('깃푸시 하시겠습니까?')) {
                                    onSave()
                                }
                            }}>
                                깃 푸시하기
                            </Button>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}
Commit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default Commit