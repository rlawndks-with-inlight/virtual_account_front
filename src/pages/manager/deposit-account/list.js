import { Avatar, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
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
import { bankCodeList, operatorLevelList, virtualAccountStatusList } from "src/utils/format";
import { useSettingsContext } from "src/components/settings";

const DepositAccountList = () => {
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
        let text = row['user_name'] ? `${row[`nickname`]}\n(${row['user_name']})` : "---";
        return <div style={{ whiteSpace: 'pre', cursor: `${user?.level >= 40 ? 'pointer' : ''}` }} onClick={() => {
          if (user?.level >= 40) {
            setDialogObj({
              connectMcht: true,
              virtual_account_id: row?.id,
            })
          }
        }}>{text}</div>
      }
    },
    {
      id: 'bank_code',
      label: '은행',
      action: (row, is_excel) => {
        return _.find(bankCodeList(), { value: row['bank_code'] })?.label
      }
    },
    {
      id: 'acct_num',
      label: '계좌번호',
      action: (row, is_excel) => {
        return row['acct_num']
      }
    },
    {
      id: 'acct_name',
      label: '예금주명',
      action: (row, is_excel) => {
        return row['acct_name']
      }
    },
    {
      id: 'created_at',
      label: '생성일',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      }
    },
    ...(user?.level >= 40 ? [
      {
        id: 'delete',
        label: '삭제',
        action: (row, is_excel) => {
          if (is_excel) {
            return `---`
          }
          if (row?.is_delete == 1) {
            return "---";
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
    if (user?.level >= 40) {
      getAllOperUser();
    }
    onChangePage({ ...searchObj, page: 1, });
  }
  const getAllOperUser = async () => {
    let data = await apiManager('users', 'list', {
      level: 10,
    });
    setOperUserList(data?.content ?? []);
  }
  const onChangePage = async (obj_) => {
    let obj = obj_;
    if (obj) {
      setSearchObj(obj);
    } else {
      obj = { ...searchObj };
    }
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('deposit-accounts', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deleteItem = async (id) => {
    let data = await apiManager('deposit-accounts', 'delete', { id });
    if (data) {
      onChangePage(searchObj);
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
          </Row>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'입금통장 추가'}
            head_columns={[]}
            table={'deposit-accounts'}
            column_table={'deposit_accounts'}
            excel_name={'입금통장'}
          />
        </Card>
      </Stack>
    </>
  )
}
DepositAccountList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DepositAccountList
