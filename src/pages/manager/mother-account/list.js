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
import { commarNumber, getUserLevelByNumber, onlyNumberText } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { payTypeList } from "src/utils/format";
import _ from "lodash";
import { useSettingsContext } from "src/components/settings";

const MotherAccountList = () => {
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
      action: (row, is_excel) => {
        let text = row['user_name'] ? `${row[`nickname`]}\n(${row['user_name']})` : "---";
        return text;
      }
    },
    {
      id: 'pay_type',
      label: '거래구분',
      action: (row, is_excel) => {
        let pay_type = _.find(payTypeList, { value: row['pay_type'] });
        if (is_excel) {
          return pay_type;
        }
        return <Chip variant="soft" label={pay_type?.label} color={pay_type?.color} />
      }
    },
    {
      id: 'amount',
      label: '금액',
      action: (row, is_excel) => {
        let amount = 0;
        if (row['pay_type'] == 0) {
          amount = row['amount'];
        } else if (row['pay_type'] == 5) {
          amount = row['amount'] + row['withdraw_fee'];
        } else if (row['pay_type'] == 10) {
          amount = row['amount'];
        } else if (row['pay_type'] == 12) {
          amount = row['amount'];
        } else if (row['pay_type'] == 15) {
          amount = row['amount'];
        } else if (row['pay_type'] == 20) {
          amount = row['amount'] + row['withdraw_fee'];
        }
        return (amount > 0 ? '+' : '') + commarNumber(amount)
      },
      sx: (row) => {
        let amount = 0;
        if (row['pay_type'] == 0) {
          amount = row['amount'];
        } else if (row['pay_type'] == 5) {
          amount = row['amount'] + row['withdraw_fee'];
        } else if (row['pay_type'] == 10) {
          amount = row['amount'];
        } else if (row['pay_type'] == 12) {
          amount = row['amount'];
        } else if (row['pay_type'] == 15) {
          amount = row['amount'];
        } else if (row['pay_type'] == 20) {
          amount = row['amount'] + row['withdraw_fee'];
        }
        return {
          color: `${amount > 0 ? 'blue' : 'red'}`
        }
      },
    },
    ...((themeDnsData?.withdraw_corp_type == 2 && user?.level >= 40) ? [
      {
        id: 'virtual_acct_balance',
        label: '모계좌잔액',
        action: (row, is_excel) => {
          return commarNumber(row['virtual_acct_balance'])
        }
      },
    ] : []),
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
  const [changeMotherDepositObj, setChangeMotherDepositObj] = useState({
    amount: 0,
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

  const onChangeMotherDeposit = async () => {
    setChangeMotherDepositObj({})
    let result = await apiManager(`brands/change-deposit`, 'create', changeMotherDepositObj)
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      onChangePage(searchObj);
    }
  }
  return (
    <>
      <Dialog
        open={changeMotherDepositObj.open}
        onClose={() => {
          setChangeMotherDepositObj({})
        }}
      >
        <DialogTitle>{`모계좌 차감`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            차감할 금액을 입력해 주세요.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={changeMotherDepositObj.amount}
            margin="dense"
            label="금액"
            type="number"
            onChange={(e) => {
              setChangeMotherDepositObj({
                ...changeMotherDepositObj,
                amount: '-' + onlyNumberText(e.target.value)
              })
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            value={changeMotherDepositObj.note}
            margin="dense"
            label="메모"
            onChange={(e) => {
              setChangeMotherDepositObj({
                ...changeMotherDepositObj,
                note: e.target.value
              })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => onChangeMotherDeposit()}>
            차감하기
          </Button>
        </DialogActions>
      </Dialog>
      <Stack spacing={3}>
        <Card>
          <Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
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
            {user?.level >= 50 &&
              <>
                <Button variant="outlined" onClick={() => {
                  setChangeMotherDepositObj({
                    open: true,
                    pay_type: 12,
                  })
                }}>모계좌차감</Button>
              </>}
          </Row>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={''}
            head_columns={[]}
            table={'deposits'}
            column_table={'mother_accounts'}
            excel_name={'모계좌'}
          />
        </Card>
      </Stack>
    </>
  )
}
MotherAccountList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default MotherAccountList
