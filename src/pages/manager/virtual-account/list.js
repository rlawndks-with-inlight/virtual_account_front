import { Avatar, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";
import { bankCodeList, operatorLevelList, virtualAccountStatusList, virtualAccountUserTypeList } from "src/utils/format";
import { useSettingsContext } from "src/components/settings";
import { commarNumber } from "src/utils/function";

const VirtualAccountList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const defaultColumns = [
    {
      id: 'user_name',
      label: '가맹점',
      action: (row, is_excel) => {
        if (is_excel) {
          return `${row[`nickname`]} (${row['user_name']})`
        }
        if (row['user_name']) {
          return <div style={{ whiteSpace: 'pre' }}>{`${row[`nickname`]}\n(${row['user_name']})`}</div>
        } else {
          return "---";
        }
      }
    },
    {
      id: 'virtual_bank_code',
      label: '가상계좌은행',
      action: (row, is_excel) => {
        return _.find(bankCodeList(), { value: row['virtual_bank_code'] })?.label ?? "---"
      }
    },
    {
      id: 'virtual_acct_num',
      label: '가상계좌번호',
      action: (row, is_excel) => {
        if (row?.status == 0) {
          return row['virtual_acct_num'] ?? "---"
        } else {
          return "---";
        }
      }
    },
    {
      id: 'virtual_acct_name',
      label: '가상계좌명',
      action: (row, is_excel) => {
        return row['virtual_acct_name'] ?? "---"
      }
    },
    {
      id: 'guid',
      label: 'USER GUID',
      action: (row, is_excel) => {
        return row['guid'] ?? "---"
      }
    },
    {
      id: 'status',
      label: '상태',
      action: (row, is_excel) => {
        if (is_excel) {
          return _.find(virtualAccountStatusList, { value: row?.status })?.label
        }
        return <Chip variant="soft" label={_.find(virtualAccountStatusList, { value: row?.status })?.label} color={_.find(virtualAccountStatusList, { value: row?.status })?.color} />
      }
    },
    ...(themeDnsData?.setting_obj?.is_use_virtual_user_name == 1 ? [
      {
        id: 'virtual_user_name',
        label: '유저아이디',
        action: (row, is_excel) => {
          return row['virtual_user_name'] ?? "---"
        }
      },
    ] : []),
    {
      id: 'deposit_bank_code',
      label: '입금은행정보',
      action: (row, is_excel) => {
        if (is_excel) {
          return `${_.find(bankCodeList(), { value: row['deposit_bank_code'] })?.label ?? "---"} ${row['deposit_acct_num']} ${row['deposit_acct_name']} ${row['birth']}`
        }
        return <Col>
          <div>{_.find(bankCodeList(), { value: row['deposit_bank_code'] })?.label ?? "---"}</div>
          <div>{row['deposit_acct_num']} {row['deposit_acct_name']} {row['birth']}</div>
        </Col>
      }
    },
    ...((user?.level >= 40 && themeDnsData?.deposit_corp_type == 1) ? [
      {
        id: 'balance',
        label: '잔액확인',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Col style={{ alignItems: 'center', rowGap: '0.5rem' }}>
            <Button variant="outlined" size="small" sx={{ width: '100px' }}
              onClick={() => {
                getBalance(row?.id)
              }}
            >잔액확인</Button>
            <Button variant="contained" size="small" sx={{ width: '100px' }}
              onClick={() => {
                moveToMother(row?.id)
              }}
            >모계좌이동</Button>
          </Col>
        }
      },
    ] : []),
    {
      id: 'user_type',
      label: '사용자구분',
      action: (row, is_excel) => {
        let text = `${_.find(virtualAccountUserTypeList, { value: row['user_type'] })?.label ?? "---"}`;
        return text
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
      label: '이어서 생성',
      action: (row, is_excel) => {
        if (is_excel) {
          return `---`
        }
        return row['status'] == 5 ? <>
          <IconButton>
            <Icon icon='material-symbols:edit-outline' onClick={() => {
              router.push(`edit/${row?.id}`)
            }} />
          </IconButton>
        </> : "---"
      }
    },
    ...(user?.level >= 10 ? [
      {
        id: 'delete',
        label: '삭제',
        action: (row, is_excel) => {
          if (is_excel) {
            return `---`
          }
          return (
            <>
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
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [operUserList, setOperUserList] = useState([]);
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
    s_dt: '',
    e_dt: '',
    search: '',
    is_sales_man: true,
  })
  const [dialogObj, setDialogObj] = useState({
    changePassword: false,
  })
  const [changePasswordObj, setChangePasswordObj] = useState({
    id: '',
    user_pw: ''
  })
  useEffect(() => {
    pageSetting();

  }, [])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    getAllOperUser();
    onChangePage({ ...searchObj, page: 1, });
  }
  const getAllOperUser = async () => {
    let data = await apiManager('users', 'list', {
      level: 10,
    });
    setOperUserList(data?.content ?? []);
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('virtual-accounts', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deleteUser = async (id) => {
    let data = await apiManager('virtual-accounts', 'delete', { id });
    if (data) {
      onChangePage(searchObj);
    }
  }
  const getBalance = async (id) => {
    let result = await apiManager('virtual-accounts/balance', 'get', {
      id: id,
    })
    toast.success(`${commarNumber(result?.amount)}원`)
  }
  const moveToMother = async (id) => {
    let result = await apiManager('virtual-accounts/mother', 'create', {
      id: id,
    })
    if (result) {
      toast.success(`성공적으로 이동 되었습니다.`);
    }
  }
  return (
    <>
      <Stack spacing={3}>
        <Card>
          <Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
            {user?.level >= 40 &&
              <>
                <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                  <InputLabel>가맹점</InputLabel>
                  <Select label='가맹점' value={searchObj[`mcht_id`]}
                    onChange={(e) => {
                      onChangePage({ ...searchObj, [`mcht_id`]: e.target.value, page: 1, })
                    }}>
                    <MenuItem value={null}>가맹점 전체</MenuItem>
                    {operUserList.filter(el => el?.level == 10).map(oper => {
                      return <MenuItem value={oper?.id}>{`${oper?.nickname}(${oper?.user_name})`}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </>}
            <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
              <InputLabel>상태</InputLabel>
              <Select label='상태' value={searchObj[`status`]}
                onChange={(e) => {
                  onChangePage({ ...searchObj, [`status`]: e.target.value, page: 1, })
                }}>
                <MenuItem value={null}>상태 전체</MenuItem>
                {virtualAccountStatusList.map(status => {
                  return <MenuItem value={status?.value}>{status.label}</MenuItem>
                })}
              </Select>
            </FormControl>
            <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
              <InputLabel>삭제여부</InputLabel>
              <Select label='삭제여부' value={searchObj[`is_delete`]}
                onChange={(e) => {
                  onChangePage({ ...searchObj, [`is_delete`]: e.target.value })
                }}>
                <MenuItem value={0}>삭제안됨</MenuItem>
                <MenuItem value={1}>삭제됨</MenuItem>
              </Select>
            </FormControl>
          </Row>

          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'가상계좌 발급'}
            head_columns={[]}
            table={'virtual-accounts'}
            column_table={`virtual_accounts`}
            excel_name={'가상계좌'}
            between_content={<Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
              <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                <Typography variant="body2">조회건수</Typography>
                <Typography variant="subtitle2">{commarNumber(data?.total)}</Typography>
              </Row>
            </Row>}
          />
        </Card>
      </Stack>
    </>
  )
}
VirtualAccountList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default VirtualAccountList
