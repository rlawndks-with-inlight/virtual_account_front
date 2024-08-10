import { Avatar, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager, apiUtil } from "src/utils/api-manager";
import { commarNumber, getUserLevelByNumber } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { bankCodeList, operatorLevelList, payTypeList, withdrawStatusList } from "src/utils/format";
import _ from "lodash";
import { useSettingsContext } from "src/components/settings";
const SettleRequestList = () => {
    const { setModal } = useModal()
    const { user } = useAuthContext();
    const { themeDnsData } = useSettingsContext();
    const defaultColumns = [
        {
            id: 'level',
            label: '유저레벨',
            action: (row, is_excel) => {
                return getUserLevelByNumber(row['level'])
            }
        },
        {
            id: 'nickname',
            label: '상호',
            action: (row, is_excel) => {
                if (is_excel) {
                    return `${row[`nickname`]} (${row['user_name']})`
                }
                return <div style={{ textAlign: 'center' }}>{`${row[`nickname`]}\n(${row['user_name']})`}</div>
            }
        },
        {
            id: 'new_amount',
            label: '요청충전금액',
            action: (row, is_excel) => {
                let amount = row['amount'];
                return commarNumber(amount)
            },
        },
        {
            id: 'note',
            label: '메모',
            action: (row, is_excel) => {
                return row['note']
            }
        },
        {
            id: 'status',
            label: '완료여부',
            action: (row, is_excel) => {
                if (is_excel) {
                    return getUserStatusByNum(row?.status)
                }
                return <Select
                    size='small'
                    value={row?.is_confirm}
                    disabled={!(user?.level >= 40)}
                    onChange={async (e) => {
                        let result = await apiUtil(`deposit_requests/is_confirm`, 'update', {
                            id: row?.id,
                            value: e.target.value
                        })
                        if (result) {
                            onChangePage(searchObj)
                        }
                    }}
                >
                    <MenuItem value={'0'}>{'확인전'}</MenuItem>
                    <MenuItem value={'1'}>{'확인완료'}</MenuItem>
                </Select>
            }
        },
        {
            id: 'created_at',
            label: '생성일',
            action: (row, is_excel) => {
                return row['created_at'] ?? "---"
            }
        },
        {
            id: 'edit',
            label: '삭제',
            action: (row, is_excel) => {
                if (is_excel) {
                    return "---"
                }
                return (
                    <>
                        <IconButton onClick={() => {
                            setModal({
                                func: () => { deleteItem(row?.id) },
                                icon: 'material-symbols:delete-outline',
                                title: '정말 삭제하시겠습니까?'
                            })
                        }}>
                            <Icon icon='material-symbols:delete-outline' />
                        </IconButton>
                    </>
                )
            }
        },
    ]

    const [data, setData] = useState({});
    const [operUserList, setOperUserList] = useState([]);
    const [searchObj, setSearchObj] = useState({
        page: 1,
        page_size: 20,
        s_dt: '',
        e_dt: '',
        search: '',
        level: 10,
    })

    useEffect(() => {
        pageSetting();
    }, [])
    const pageSetting = () => {
        getAllOperUser();
        onChangePage({ ...searchObj, page: 1 });
    }
    const getAllOperUser = async () => {
        let data = await apiManager('users', 'list', {
            level_list: [10, ...operatorLevelList.map(itm => { return itm.value })],
        });
        setOperUserList(data?.content ?? []);
    }
    const onChangePage = async (obj) => {
        setSearchObj(obj);
        setData({
            ...data,
            content: undefined
        })
        let data_ = await apiManager('deposit-requests', 'list', obj);
        if (data_) {
            setData(data_);
        }
    }
    const deleteItem = async (id) => {
        let data = await apiManager('deposit-requests', 'delete', { id });
        if (data) {
            onChangePage(searchObj);
        }
    }
    return (
        <>
            <Stack spacing={3}>

                <Card>
                    {user?.level >= 40 &&
                        <>
                            <Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
                                <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                                    <InputLabel>유저레벨구분</InputLabel>
                                    <Select label='유저레벨구분' value={searchObj[`level`]}
                                        onChange={(e) => {
                                            onChangePage({
                                                ...searchObj,
                                                [`level`]: e.target.value,

                                            })
                                        }}>
                                        <MenuItem value={10}>가맹점</MenuItem>
                                        {themeDnsData?.operator_list.map(oper => {
                                            return <MenuItem value={oper?.value}>{`${oper?.label}`}</MenuItem>
                                        })}
                                    </Select>
                                </FormControl>
                                {(themeDnsData?.operator_list ?? []).map(operator => {
                                    if (searchObj.level == operator.value) {
                                        return <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                                            <InputLabel>{operator?.label}</InputLabel>
                                            <Select label={operator?.label} value={searchObj[`sales${operator?.num}_id`]}
                                                onChange={(e) => {
                                                    onChangePage({ ...searchObj, [`sales${operator?.num}_id`]: e.target.value })
                                                }}>
                                                <MenuItem value={null}>{operator?.label} 전체</MenuItem>
                                                {operUserList.filter(el => el?.level == operator?.value).map(oper => {
                                                    return <MenuItem value={oper?.id}>{`${oper?.nickname}(${oper?.user_name})`}</MenuItem>
                                                })}
                                            </Select>
                                        </FormControl>
                                    }
                                })}
                                {searchObj.level == 10 &&
                                    <>
                                        <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                                            <InputLabel>가맹점</InputLabel>
                                            <Select label='가맹점' value={searchObj[`mcht_id`]}
                                                onChange={(e) => {
                                                    onChangePage({ ...searchObj, [`mcht_id`]: e.target.value })
                                                }}>
                                                <MenuItem value={null}>가맹점 전체</MenuItem>
                                                {operUserList.filter(el => el?.level == 10).map(oper => {
                                                    return <MenuItem value={oper?.id}>{`${oper?.nickname}(${oper?.user_name})`}</MenuItem>
                                                })}
                                            </Select>
                                        </FormControl>
                                    </>}
                            </Row>
                        </>}
                    <ManagerTable
                        data={data}
                        columns={defaultColumns}
                        searchObj={searchObj}
                        onChangePage={onChangePage}
                        head_columns={[]}
                        table={'deposit-requests'}
                        column_table={`deposit_requests`}
                        excel_name={'요청내역'}
                    />
                </Card>
            </Stack>
        </>
    )
}
SettleRequestList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default SettleRequestList
