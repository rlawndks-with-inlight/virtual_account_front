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
import _ from "lodash";
import { bankCodeList, virtualAccountStatusList } from "src/utils/format";

const VirtualAccountList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const defaultColumns = [
    {
      id: 'user_name',
      label: '가맹점',
      action: (row) => {
        return <div style={{ whiteSpace: 'pre' }}>{`${row[`nickname`]}\n(${row['user_name']})`}</div>
      }
    },
    {
      id: 'virtual_bank_code',
      label: '가상계좌은행',
      action: (row) => {
        return _.find(bankCodeList(), { value: row['virtual_bank_code'] })?.label ?? "---"
      }
    },
    {
      id: 'virtual_acct_num',
      label: '가상계좌번호',
      action: (row) => {
        return row['virtual_acct_num'] ?? "---"
      }
    },
    {
      id: 'status',
      label: '상태',
      action: (row) => {
        return <Chip variant="soft" label={_.find(virtualAccountStatusList, { value: row?.status }).label} color={_.find(virtualAccountStatusList, { value: row?.status }).color} />
      }
    },
    {
      id: 'created_at',
      label: '생성일',
      action: (row) => {
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
          />
        </Card>
      </Stack>
    </>
  )
}
VirtualAccountList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default VirtualAccountList
