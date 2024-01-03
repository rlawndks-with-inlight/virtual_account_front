import { Avatar, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
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
import { bankCodeList, operatorLevelList, payTypeList, withdrawStatusList } from "src/utils/format";
import _ from "lodash";
import { useSettingsContext } from "src/components/settings";
const WithdrawList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
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
        let status = _.find(withdrawStatusList, { value: row?.withdraw_status });
        if (is_excel) {
          return status?.label
        }
        return <Chip variant="soft" label={status?.label} color={status?.color} />
      }
    },
    {
      id: 'pay_type',
      label: '출금구분',
      action: (row, is_excel) => {
        let pay_type = _.find(payTypeList, { value: row?.pay_type });
        return <Chip variant="soft" label={pay_type.label} color={pay_type.color} />
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
  const [operUserList, setOperUserList] = useState([]);
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
          <Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
            {(themeDnsData?.operator_list ?? []).map(operator => {
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
            })}
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
          </Row>
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
