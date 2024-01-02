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
      count: 2 + (themeDnsData?.operator_list.length ?? 0) * 3
    },
  ]
  const defaultColumns = [
    {
      id: 'trx_id',
      label: '거래번호',
      action: (row, is_excel) => {
        return row['trx_id'] ?? "---"
      }
    },
    {
      id: 'mcht_nickname',
      label: '가맹점',
      action: (row, is_excel) => {
        return `${row[`mcht_nickname`]}\n(${row['mcht_user_name']})`
      }
    },
    {
      id: 'deposit_bank_code',
      label: '입금은행',
      action: (row, is_excel) => {
        return _.find(bankCodeList(), { value: row['deposit_bank_code'] })?.label
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
      id: 'user_name',
      label: '상태',
      action: (row, is_excel) => {
        return row['user_name'] ?? "---"
      }
    },
    {
      id: 'amount_ago',
      label: '입금예정금액',
      action: (row, is_excel) => {
        return commarNumber(row['amount'])
      },
      sx: (row) => {
        return {
          color: 'green'
        }
      },
    },
    {
      id: 'amount',
      label: '실제입금금액',
      action: (row, is_excel) => {
        return commarNumber(row['amount'])
      },
      sx: (row) => {
        return {
          color: 'blue'
        }
      },
    },
    {
      id: 'mcht_amount',
      label: '가맹점 정산금액',
      action: (row, is_excel) => {
        return commarNumber(row['mcht_amount'])
      },
      sx: (row) => {
        return {
          color: '#a52a2a'
        }
      },
      sx: (row) => {
        return {
          color: 'red'
        }
      },
    },
    {
      id: 'deposit_fee',
      label: '입금수수료',
      action: (row, is_excel) => {
        return commarNumber(row['deposit_fee'])
      }
    },
    {
      id: 'mcht_fee',
      label: '가맹점 수수료율',
      action: (row, is_excel) => {
        return row['mcht_fee'] + '%'
      }
    },
    {
      id: 'head_office_fee',
      label: '본사 수수료율',
      action: (row, is_excel) => {
        return row['head_office_fee'] + '%'
      }
    },
    {
      id: 'head_office_amount',
      label: '본사 수수료',
      action: (row, is_excel) => {
        return row['head_office_amount']
      },
      sx: (row) => {
        return {
          color: '#a52a2a'
        }
      },
    },
    ...(themeDnsData?.operator_list ?? []).map(operator => {
      return [
        {
          id: `sales${operator?.num}_id`,
          label: operator?.label,
          action: (row, is_excel) => {
            return row[`sales${operator?.num}_id`] > 0 ? <div style={{ textAlign: 'center' }}>{`${row[`sales${operator?.num}_nickname`]}\n(${row[`sales${operator?.num}_user_name`]})`}</div> : `---`
          }
        },
        {
          id: `sales${operator?.num}_amount`,
          label: `${operator?.label} 수수료`,
          action: (row, is_excel) => {
            return row[`sales${operator?.num}_amount`] > 0 ? commarNumber(row[`sales${operator?.num}_amount`]) : "---"
          },
          sx: (row) => {
            return {
              color: '#a52a2a'
            }
          },
        },
        {
          id: `sales${operator?.num}_fee`,
          label: `${operator?.label} 수수료율`,
          action: (row, is_excel) => {
            return row[`sales${operator?.num}_id`] > 0 ? row[`sales${operator?.num}_fee`] : "---"
          }
        },
      ]
    }).flat(),
    {
      id: 'created_at',
      label: '생성일',
      action: (row, is_excel) => {
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
            //add_button_text={user?.level >= 40 ? '결제내역추가' : ''}
            width={'150%'}
            head_columns={defaultHeadColumns}
            table={'deposits'}
            excel_name={'출금'}
          />
        </Card>
      </Stack>
    </>
  )
}
DepositList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DepositList
