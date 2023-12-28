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
import { useSettingsContext } from "src/components/settings";
import { bankCodeList } from "src/utils/format";
import _ from "lodash";
const DepositList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const defaultHeadColumns = [
    {
      title: '기본정보',
      count: 7,
    },
    {
      title: '유저정보',
      count: 3
    },

    {
      title: '영업자정보',
      count: 1 + (themeDnsData?.operator_list.length ?? 0) * 3
    },
  ]
  const defaultColumns = [
    {
      id: 'trx_id',
      label: '거래번호',
      action: (row) => {
        return row['trx_id'] ?? "---"
      }
    },
    {
      id: 'user_name',
      label: '가맹점',
      action: (row) => {
        return <div style={{ textAlign: 'center' }}>{`${row[`mcht_nickname`]}\n(${row['mcht_user_name']})`}</div>
      }
    },
    {
      id: 'user_name',
      label: '입금은행',
      action: (row) => {
        return _.find(bankCodeList(), { value: row['deposit_bank_code'] })?.label
      }
    },
    {
      id: 'user_name',
      label: '가상계좌번호',
      action: (row) => {
        return row['virtual_acct_num'] ?? "---"
      }
    },
    {
      id: 'user_name',
      label: '상태',
      action: (row) => {
        return row['user_name'] ?? "---"
      }
    },
    {
      id: 'user_name',
      label: '입금예정금액',
      action: (row) => {
        return commarNumber(row['amount'])
      }
    },
    {
      id: 'user_name',
      label: '실제입금금액',
      action: (row) => {
        return commarNumber(row['amount'])
      }
    },
    {
      id: 'user_name',
      label: '가맹점 정산금액',
      action: (row) => {
        return commarNumber(row['mcht_amount'])
      }
    },
    {
      id: 'user_name',
      label: '입금수수료',
      action: (row) => {
        return commarNumber(row['deposit_fee'])
      }
    },
    {
      id: 'user_name',
      label: '가맹점 수수료율',
      action: (row) => {
        return row['mcht_fee'] + '%'
      }
    },
    {
      id: 'user_name',
      label: '본사 수수료율',
      action: (row) => {
        return row['head_office_fee'] + '%'
      }
    },
    ...(themeDnsData?.operator_list ?? []).map(operator => {
      return [
        {
          id: `sales${operator?.num}_id`,
          label: operator?.label,
          action: (row) => {
            return row[`sales${operator?.num}_id`] > 0 ? <div style={{ textAlign: 'center' }}>{`${row[`sales${operator?.num}_nickname`]}\n(${row[`sales${operator?.num}_user_name`]})`}</div> : `---`
          }
        },
        {
          id: `sales${operator?.num}_amount`,
          label: `${operator?.label} 수수료`,
          action: (row) => {
            return row[`sales${operator?.num}_amount`] > 0 ? commarNumber(row[`sales${operator?.num}_amount`]) : "---"
          }
        },
        {
          id: `sales${operator?.num}_fee`,
          label: `${operator?.label} 수수료율`,
          action: (row) => {
            return row[`sales${operator?.num}_id`] > 0 ? row[`sales${operator?.num}_fee`] : "---"
          }
        },
      ]
    }).flat(),
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
    is_sales_man: true,
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
            add_button_text={user?.level >= 40 ? '결제내역추가' : ''}
            width={'150%'}
            head_columns={defaultHeadColumns}
          />
        </Card>
      </Stack>
    </>
  )
}
DepositList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DepositList
