import { Avatar, Button, Card, Checkbox, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { commarNumber, getReturnUri, getUserDepositFee, getUserFee, getUserStatusByNum, getUserWithDrawFee } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { bankCodeList, operatorLevelList } from "src/utils/format";
import { useSettingsContext } from "src/components/settings";
import _ from "lodash";
import navConfig from "src/layouts/manager/nav/config-navigation";
const UserList = () => {
    const { setModal } = useModal()
    const { user } = useAuthContext();
    const { themeDnsData } = useSettingsContext();
    const defaultColumns = [
        {
            id: 'brand_name',
            label: '브랜드명',
            action: (row, is_excel) => {
                return row['brand_name'] ?? "---"
            }
        },
        {
            id: 'profile_img',
            label: '유저프로필',
            action: (row, is_excel) => {
                if (is_excel) {
                    return row['profile_img']
                }
                return <Avatar src={row['profile_img'] ?? "---"} />
            }
        },
        {
            id: 'user_name',
            label: '유저아이디',
            action: (row, is_excel) => {
                if (is_excel) {
                    return row['user_name']
                }
                return <div style={{ cursor: 'pointer' }} onClick={() => {
                    router.push(`edit/${row?.id}`)
                }}>
                    {row['user_name'] ?? "---"}
                </div>
            }
        },
        {
            id: 'name',
            label: '이름',
            action: (row, is_excel) => {
                return row['name'] ?? "---"
            }
        },
        {
            id: 'created_at',
            label: '가입일',
            action: (row, is_excel) => {
                return row['created_at'] ?? "---"
            }
        },
        {
            id: 'last_login_time',
            label: '마지막로그인시간',
            action: (row, is_excel) => {
                return row['last_login_time'] ?? "---"
            }
        },
        {
            id: 'connected_ip',
            label: '접속아이피',
            action: (row, is_excel) => {
                return row['connected_ip'] ?? "---"
            }
        },
        {
            id: 'status',
            label: '유저상태',
            action: (row, is_excel) => {
                if (is_excel) {
                    return getUserStatusByNum(row?.status)
                }
                return <Select
                    size='small'
                    value={row?.status}
                    disabled={!(user?.level >= 40)}
                    onChange={async (e) => {
                        let result = await apiManager(`users/change-status`, 'update', {
                            id: row?.id,
                            status: e.target.value
                        });
                        if (result) {
                            onChangePage(searchObj)
                        }
                    }}
                >
                    <MenuItem value={'0'}>{'정상'}</MenuItem>
                    <MenuItem value={'1'}>{'가입대기'}</MenuItem>
                    <MenuItem value={'2'}>{'로그인금지'}</MenuItem>
                </Select>
            }
        },
        ...(user?.level >= 50 ? [
            {
                id: 'update_user_deposit',
                label: '해당 유저로 로그인',
                action: (row, is_excel) => {
                    if (is_excel) {
                        return "---";
                    }
                    return <Button variant="outlined" size="small" sx={{ width: '100px' }}
                        onClick={() => {
                            setModal({
                                func: () => { onSignInAnotherUser(row?.id) },
                                icon: 'material-symbols:lock-outline',
                                title: '해당 유저로 로그인 하시겠습니까?'
                            })
                        }}
                    >유저 로그인</Button>
                }
            },
        ] : []),
        ...(user?.level >= 50 ? [
            {
                id: 'edit_password',
                label: '비밀번호 변경',
                action: (row, is_excel) => {
                    if (is_excel) {
                        return "---"
                    }
                    if (user?.level < row?.level) {
                        return "---"
                    }
                    return (
                        <>
                            <IconButton onClick={() => {
                                setDialogObj({ changePassword: true })
                                setChangePasswordObj({
                                    user_pw: '',
                                    id: row?.id
                                })
                            }}>
                                <Icon icon='material-symbols:lock-outline' />
                            </IconButton>
                        </>
                    )
                }
            },
            {
                id: 'edit',
                label: '수정/삭제',
                action: (row, is_excel) => {
                    if (is_excel) {
                        return "---"
                    }
                    return (
                        <>
                            <IconButton>
                                <Icon icon='material-symbols:edit-outline' onClick={() => {
                                    router.push(`edit/${row?.id}`)
                                }} />
                            </IconButton>
                            <IconButton onClick={() => {
                                setModal({
                                    func: () => { deleteUser(row?.id) },
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
        ] : []),
    ]
    const navList = navConfig();
    const router = useRouter();

    const [data, setData] = useState({});
    const [searchObj, setSearchObj] = useState({
        page: 1,
        page_size: 20,
        s_dt: '',
        e_dt: '',
        search: '',
        level: 40,
    })
    const [item, setItem] = useState({});
    const [dialogObj, setDialogObj] = useState({
        changePassword: false,
    })
    const [changePasswordObj, setChangePasswordObj] = useState({
        id: '',
        user_pw: ''
    })
    const [changeUserDepositObj, setChangeUserDepositObj] = useState({
        amount: 0,
    })

    useEffect(() => {
        pageSetting();
    }, [])
    const pageSetting = () => {
        onChangePage({ ...searchObj, page: 1, level: 40, });
    }
    const onChangePage = async (obj) => {
        setSearchObj(obj);
        setData({
            ...data,
            content: undefined
        })
        let data_ = await apiManager('users', 'list', obj);
        if (data_) {
            setData(data_);
        }
    }
    const deleteUser = async (id) => {
        let data = await apiManager('users', 'delete', { id });
        if (data) {
            onChangePage(searchObj);
        }
    }
    const onChangeUserPassword = async () => {
        let result = await apiManager(`users/change-pw`, 'update', changePasswordObj);
        if (result) {
            setDialogObj({
                ...dialogObj,
                changePassword: false
            })
            setChangePasswordObj({
                id: '',
                user_pw: ''
            })
            toast.success("성공적으로 변경 되었습니다.");
        }
    }
    const onSignInAnotherUser = async (user_id) => {
        const result = await apiManager(`auth/sign-in-another-user`, 'create', {
            user_id,
        })
        if (result?.id) {
            window.location.href = getReturnUri(navList);
        }
    }
    const getUser = async (id) => {

    }
    return (
        <>
            <Dialog
                open={dialogObj.changePassword}
                onClose={() => {
                    setDialogObj({
                        ...dialogObj,
                        changePassword: false
                    })
                }}
            >
                <DialogTitle>{`비밀번호 변경`}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        새 비밀번호를 입력 후 확인을 눌러주세요.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        fullWidth
                        value={changePasswordObj.user_pw}
                        type="password"
                        margin="dense"
                        label="새 비밀번호"
                        onChange={(e) => {
                            setChangePasswordObj({
                                ...changePasswordObj,
                                user_pw: e.target.value
                            })
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={onChangeUserPassword}>
                        변경
                    </Button>
                    <Button color="inherit" onClick={() => {
                        setDialogObj({
                            ...dialogObj,
                            changePassword: false
                        })
                    }}>
                        취소
                    </Button>
                </DialogActions>
            </Dialog>
            <Stack spacing={3}>
                <Card>
                    <ManagerTable
                        data={data}
                        columns={defaultColumns}
                        searchObj={searchObj}
                        onChangePage={onChangePage}
                        add_button_text={user?.level >= 50 ? '본사 추가' : ''}
                        head_columns={[]}
                        column_table={'managers'}
                        table={'users'}
                        excel_name={'본사'}
                    />
                </Card>
            </Stack>
        </>
    )
}
UserList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default UserList
