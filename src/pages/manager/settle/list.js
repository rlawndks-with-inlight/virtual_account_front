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
import { commarNumber, getUserLevelByNumber } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { bankCodeList, operatorLevelList, payTypeList, withdrawStatusList } from "src/utils/format";
import _ from "lodash";
import { useSettingsContext } from "src/components/settings";
const SettleList = () => {
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
      id: 'pay_type',
      label: '보유정산금 구분',
      action: (row, is_excel) => {
        let pay_type = _.find(payTypeList, { value: row?.pay_type });
        if (is_excel) {
          return pay_type?.label
        }
        return <Chip variant="soft" label={pay_type?.label} color={pay_type?.color} />
      }
    },
    {
      id: 'ago_amount',
      label: '기존 보유정산금',
      action: (row, is_excel) => {
        let amount = row['new_amount'] - row['user_amount'];
        return commarNumber(amount)
      }
    },
    {
      id: 'amount',
      label: '발생 보유정산금',
      action: (row, is_excel) => {
        let amount = row['user_amount'];
        return (amount > 0 ? '+' : '') + commarNumber(amount)
      },
      sx: (row) => {
        let amount = row['user_amount'];
        return {
          color: `${amount > 0 ? 'blue' : 'red'}`
        }
      },
    },
    {
      id: 'new_amount',
      label: '이후 보유정산금',
      action: (row, is_excel) => {
        let amount = row['new_amount'];
        return commarNumber(amount)
      },
    },
    {
      id: 'note',
      label: '메모',
      action: (row, is_excel) => {
        return row['note']
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
    level: 10,
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
    let data_ = await apiManager('settles', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  return (
    <>
      <Stack spacing={3}>

        <Card>
          {user?.level >= 40 &&
            <>
              <Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
                <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                  <InputLabel>유저레벨구분</InputLabel>
                  <Select label='유저레벨구분' value={searchObj[`level`]}
                    onChange={(e) => {
                      onChangePage({
                        ...searchObj,
                        [`level`]: e.target.value,

                      })
                    }}>
                    <MenuItem value={10}>가맹점</MenuItem>
                    {themeDnsData?.operator_list.map(oper => {
                      return <MenuItem value={oper?.value}>{`${oper?.label}`}</MenuItem>
                    })}
                  </Select>
                </FormControl>
                {(themeDnsData?.operator_list ?? []).map(operator => {
                  if (searchObj.level == operator.value) {
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
                  }
                })}
                {searchObj.level == 10 &&
                  <>
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
                  </>}
                <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                  <InputLabel>거래구분</InputLabel>
                  <Select label='거래구분' value={searchObj[`pay_type`]}
                    onChange={(e) => {
                      onChangePage({ ...searchObj, [`pay_type`]: e.target.value })
                    }}>
                    <MenuItem value={null}>거래구분 전체</MenuItem>
                    {payTypeList.map((type) => {
                      let not_use_type = [25, 30,]
                      if (!not_use_type.includes(type.value)) {
                        return <MenuItem value={type.value}>{type.label}</MenuItem>
                      }
                    })}
                  </Select>
                </FormControl>
              </Row>
            </>}
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            head_columns={[]}
            table={'settles'}
            excel_name={'보유정산금'}
          />
        </Card>
      </Stack>
    </>
  )
}
SettleList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default SettleList
