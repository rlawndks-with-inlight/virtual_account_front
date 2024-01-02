import { Avatar, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { commarNumber, getUserLevelByNumber } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { payTypeList } from "src/utils/format";
const MotherAccountList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const defaultColumns = [
    {
      id: 'trx_id',
      label: '거래번호',
      action: (row) => {
        return row['trx_id'] ?? "---"
      }
    },
    {
      id: 'level',
      label: '유저레벨',
      action: (row) => {
        if (row?.pay_type == 5) {
          return getUserLevelByNumber(row['level'])
        } else {
          return '가맹점'
        }
      }
    },
    {
      id: 'nickname',
      label: '상호',
      action: (row) => {
        return `${row[`nickname`]}\n(${row['user_name']})`
      }
    },
    {
      id: 'pay_type',
      label: '거래구분',
      action: (row) => {
        return _.find(payTypeList, { value: row['pay_type'] })?.label
      }
    },
    {
      id: 'amount',
      label: '금액',
      action: (row) => {
        let amount = 0;
        if (row['pay_type'] == 0) {
          amount = row['amount'];
        } else if (row['pay_type'] == 5) {
          amount = row['amount'] + row['withdraw_fee'];
        } else if (row['pay_type'] == 10) {
          amount = row['amount'];
        } else if (row['pay_type'] == 15) {
          amount = row['amount'];
        }
        return (amount > 0 ? '+' : '') + commarNumber(amount)
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
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
    is_mother: 1,
  })

  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, page: 1, is_mother: 1, });
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('deposits', 'list', obj);
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
            add_button_text={''}
            head_columns={[]}
          />
        </Card>
      </Stack>
    </>
  )
}
MotherAccountList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default MotherAccountList
