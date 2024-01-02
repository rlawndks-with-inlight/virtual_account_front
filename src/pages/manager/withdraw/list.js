import { Avatar, Button, Card, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { getUserLevelByNumber } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { bankCodeList, payTypeList, withdrawStatusList } from "src/utils/format";
import _ from "lodash";
const WithdrawList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const defaultColumns = [
    {
      id: 'trx_id',
      label: '거래번호',
      action: (row, is_excel) => {
        return row['trx_id'] ?? "---"
      }
    },
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
      id: 'settle_bank_code',
      label: '은행',
      action: (row, is_excel) => {
        return _.find(bankCodeList(), { value: row['settle_bank_code'] })?.label ?? "---"
      }
    },
    {
      id: 'settle_acct_num',
      label: '계좌번호',
      action: (row, is_excel) => {
        return row['settle_acct_num'] ?? "---"
      }
    },
    {
      id: 'settle_acct_name',
      label: '예금주명',
      action: (row, is_excel) => {
        return row['settle_acct_name'] ?? "---"
      }
    },
    {
      id: 'status',
      label: '상태',
      action: (row, is_excel) => {
        if (is_excel) {
          return _.find(withdrawStatusList, { value: row?.withdraw_status })?.label
        }
        return <Chip variant="soft" label={_.find(withdrawStatusList, { value: row?.withdraw_status })?.label} color={_.find(withdrawStatusList, { value: row?.withdraw_status })?.color} />
      }
    },
    {
      id: 'user_name',
      label: '출금구분',
      action: (row, is_excel) => {
        return _.find(payTypeList, { value: row?.pay_type }).label
      }
    },
    {
      id: 'amount',
      label: '이체금',
      action: (row, is_excel) => {
        return row['amount'] * (-1) - row['withdraw_fee']
      }
    },
    {
      id: 'withdraw_fee',
      label: '이체 수수료',
      action: (row, is_excel) => {
        return row['withdraw_fee'] ?? "---"
      }
    },
    {
      id: 'minus_amount',
      label: '차감 보유정산금',
      action: (row, is_excel) => {
        return row['amount'] * (-1)
      }
    },
    {
      id: 'created_at',
      label: '생성일',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      }
    },
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
    onChangePage({ ...searchObj, page: 1 });
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('withdraws', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deleteUser = async (id) => {
    let data = await apiManager('withdraws', 'delete', { id });
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
            head_columns={[]}
            table={'withdraws'}
            excel_name={'출금'}
          />
        </Card>
      </Stack>
    </>
  )
}
WithdrawList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default WithdrawList
