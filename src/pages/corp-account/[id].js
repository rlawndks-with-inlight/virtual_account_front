
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
import _ from "lodash";
import { commarNumber } from "src/utils/function";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const CorpAccount = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();

    const router = useRouter();

    const [mchtList, setMchtList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({})
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
        setLoading(true);
        let data = await apiManager('corp-accounts', 'get', {
            id: router.query.id
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
            toast.success("성공적으로 저장 되었습니다.");
            setDialogObj({});
            onChangePage(searchObj);
        }
    }
    if (loading) {
        return <></>
    }
    return (
        <>
            <Col style={{ height: '100vh' }}>
                <Col style={{ marginTop: '2rem' }}>
                    <Card sx={{ p: 2, maxWidth: '500px', margin: 'auto', width: '90%' }}>
                        <Col style={{ rowGap: '0.5rem' }}>
                            ✓유의사항
                            <Typography variant="body2">• 아래 입금금액 만큼 법인통장에 입금하시면 확인후 30분 내로 결제완료 처리됩니다.</Typography>
                            <Typography variant="body2">• 실제 정보와 다르게 입력할시 상품결제가 취소됩니다.</Typography>
                            <Typography variant="body2" style={{ color: '#aaa' }}>{item?.virtual_acct_name}</Typography>
                        </Col>
                        <Col style={{ rowGap: '0.5rem' }}>
                            <Row style={{ alignItems: 'center' }}>
                                <Typography variant="body2" style={{ width: '100px' }}>은행명</Typography>
                                <Typography>{_.find(bankCodeList(), { value: item?.bank_code })?.label ?? "---"}</Typography>
                            </Row>
                            <Row style={{ alignItems: 'center' }}>
                                <Typography variant="body2" style={{ width: '100px' }}>계좌번호</Typography>
                                <Typography>{item?.acct_num}</Typography>
                            </Row>
                            <Row style={{ alignItems: 'center' }}>
                                <Typography variant="body2" style={{ width: '100px' }}>입금자명</Typography>
                                <Typography>{item?.acct_name}</Typography>
                            </Row>
                            <Row style={{ alignItems: 'center' }}>
                                <Typography variant="body2" style={{ width: '100px' }}>입금금액</Typography>
                                <Typography>{commarNumber(router.query?.amount)} 원</Typography>
                            </Row>
                        </Col>
                    </Card>
                </Col>
            </Col>
        </>
    )
}
CorpAccount.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default CorpAccount;