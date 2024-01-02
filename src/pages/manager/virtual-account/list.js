import { Avatar, Button, Card, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { getUserLevelByNumber } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";
import { bankCodeList, virtualAccountStatusList } from "src/utils/format";

const VirtualAccountList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
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
        return row['virtual_acct_num'] ?? "---"
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
    {
      id: 'deposit_bank_code',
      label: '입금은행정보',
      action: (row, is_excel) => {
        if (is_excel) {
          return `${_.find(bankCodeList(), { value: row['deposit_bank_code'] })?.label ?? "---"} ${row['deposit_acct_num']} ${row['deposit_acct_name']}`
        }
        return <Col>
          <div>{_.find(bankCodeList(), { value: row['deposit_bank_code'] })?.label ?? "---"}</div>
          <div>{row['deposit_acct_num']} {row['deposit_acct_name']}</div>
        </Col>
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
    /*
     {
      id: 'delete',
      label: '삭제',
      action: (row, is_excel) => {
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
    */
  ]
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
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
    onChangePage({ ...searchObj, page: 1, level: 10, });
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

  return (
    <>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'가상계좌 발급'}
            head_columns={[]}
            table={'virtual-accounts'}
            excel_name={'가상계좌'}
          />
        </Card>
      </Stack>
    </>
  )
}
VirtualAccountList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default VirtualAccountList
