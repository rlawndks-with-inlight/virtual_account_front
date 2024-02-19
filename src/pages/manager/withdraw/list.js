import { Avatar, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager, apiServer, apiUtil } from "src/utils/api-manager";
import { commarNumber, getUserLevelByNumber } from "src/utils/function";
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
        if (is_excel) {
          return row['trx_id'] ?? "---"
        }
        if (user?.level >= 50) {
          return <div style={{ cursor: 'pointer' }} onClick={() => {
            setDialogObj({
              changeTrxId: true,
              trx_id: '',
              id: row?.id,
            })
          }}>{row['trx_id'] ?? "---"}</div>
        } else {
          return row['trx_id'] ?? "---"
        }
      }
    },
    {
      id: 'level',
      label: '유저레벨',
      action: (row, is_excel) => {
        let level = row['level'];
        for (var i = 0; i < themeDnsData?.operator_list.length; i++) {
          let {
            value,
            label,
            num
          } = themeDnsData?.operator_list[i];
          if (row[`sales${num}_level`]) {
            level = row[`sales${num}_level`];
          }
        }
        return getUserLevelByNumber(level)
      },
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
        return _.find(bankCodeList('withdraw'), { value: row['settle_bank_code'] })?.label ?? "---"
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
        if (user?.level >= 50) {

          return <Select
            size='small'
            defaultValue={row?.withdraw_status}
            disabled={!(user?.level >= 40)}
            onChange={async (e) => {
              let result = await apiUtil(`deposits/withdraw_status`, 'update', {
                id: row?.id,
                value: e.target.value
              });
            }}
          >
            {withdrawStatusList.map((itm) => {
              return <MenuItem value={itm.value}><Chip variant="soft" label={itm?.label} color={itm?.color} /></MenuItem>
            })}
          </Select>
        } else {
          return <Chip variant="soft" label={status?.label} color={status?.color} />
        }
      }
    },
    {
      id: 'pay_type',
      label: '출금구분',
      action: (row, is_excel) => {
        let pay_type = _.find(payTypeList, { value: row?.pay_type });
        if (is_excel) {
          return pay_type?.label
        }
        return <Chip variant="soft" label={pay_type.label} color={pay_type.color} />
      }
    },
    {
      id: 'expect_amount',
      label: '이체예정금',
      action: (row, is_excel) => {
        if (row?.withdraw_status == 0) {
          return commarNumber(row['expect_amount'] * (-1) - row['withdraw_fee'])
        } else {
          return 0;
        }
      }
    },
    {
      id: 'amount',
      label: '이체금',
      action: (row, is_excel) => {
        if (row?.withdraw_status == 0) {
          return commarNumber(row['amount'] * (-1) - row['withdraw_fee'])
        } else {
          return 0;
        }
      }
    },
    {
      id: 'withdraw_fee',
      label: '이체 수수료',
      action: (row, is_excel) => {
        return commarNumber(row['withdraw_fee'] ?? "---")
      }
    },
    {
      id: 'minus_amount',
      label: '차감 보유정산금',
      action: (row, is_excel) => {
        return commarNumber(row['expect_amount'] * (-1))
      }
    },
    ...((themeDnsData?.withdraw_corp_type == 2 && user?.level >= 40) ? [
      {
        id: 'virtual_acct_balance',
        label: '가상계좌잔액',
        action: (row, is_excel) => {
          return commarNumber(row['virtual_acct_balance'])
        },
        sx: (row) => {
          if (row?.deposit_status == 10) {
            return {
              color: 'red'
            }
          }
        },
      },
    ] : []),
    ...(user?.level >= 40 ? [
      {
        id: 'withdraw_status_edit',
        label: '출금상태관리',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          if (row?.is_withdraw_hold == 1) {
            return <Col style={{ rowGap: '0.5rem' }}>
              <Button variant="outlined" size="small" sx={{ width: '100px' }}
                onClick={() => {
                  setModal({
                    func: () => { onConfirmWithdraw(row?.id) },
                    icon: 'bx:money-withdraw',
                    title: '출금을 허용 하시겠습니까?'
                  })
                }}
              >출금허용</Button>
              <Button variant="contained" size="small" sx={{ width: '100px' }}
                onClick={() => {
                  setModal({
                    func: () => { onRefuseWithdraw(row?.id) },
                    icon: 'bx:money-withdraw',
                    title: '출금을 반려 하시겠습니까?'
                  })
                }}
              >출금반려</Button>
            </Col>
          } else {
            return "---";
          }
        }
      },
      ...(themeDnsData?.withdraw_corp_type == 2 ? [
        {
          id: 'minus_amount',
          label: '출금체크',
          action: (row, is_excel) => {
            if (is_excel) {
              return "---";
            }
            return <Col style={{ rowGap: '0.5rem' }}>
              <Button variant="outlined" size="small" sx={{ width: '100px' }}
                onClick={() => {
                  onProcessWithdraw({
                    mid: row?.mid,
                    tid: row?.trx_id,
                  })
                }}
              >출금여부확인</Button>
            </Col>
          }
        },
      ] : []),
      {
        id: 'withdraw_fail',
        label: '출금 실패처리',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          if (row?.is_move_mother == 1 && row?.withdraw_status == 5) {
            return <Button variant="outlined" size="small" sx={{ width: '100px' }}
              onClick={() => {
                setModal({
                  func: () => { onFailWithdraw(row?.id) },
                  icon: 'bx:money-withdraw',
                  title: '출금을 실패처리 하시겠습니까?'
                })
              }}
            >출금허용</Button>
          } else {
            return "---";
          }
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
  const onConfirmWithdraw = async (id) => {
    let result = undefined
    result = await apiManager('withdraws/confirm', 'create', {
      id
    });
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      onChangePage(searchObj)
    }
  }
  const onRefuseWithdraw = async (id) => {
    let result = undefined
    result = await apiManager('withdraws/refuse', 'create', {
      id
    });
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      onChangePage(searchObj)
    }
  }
  const onFailWithdraw = async (id) => {
    let result = undefined
    result = await apiManager('withdraws/fail', 'create', {
      id
    });
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      onChangePage(searchObj)
    }
  }
  const onProcessWithdraw = async (data = {}) => {
    let { mid, tid } = data;
    let result = await apiServer(`${process.env.API_URL}/api/withdraw/v${themeDnsData?.setting_obj?.api_withdraw_version}/withdraw/check`, 'create', {
      api_key: themeDnsData?.api_key,
      mid,
      tid,
    });
    if (result) {
      onChangePage(searchObj);
    }
  }
  const onChangeTrxId = async () => {
    let result = undefined
    result = await apiManager('withdraws/trx-id', 'update', dialogObj);
    setDialogObj({});
    onChangePage(searchObj);
  }
  return (
    <>
      <Stack spacing={3}>
        <Dialog
          open={dialogObj.changeTrxId}
          onClose={() => {
            setDialogObj({})
          }}
        >
          <DialogTitle>{`거래번호 변경`}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              거래번호를 입력 후 확인을 눌러주세요.
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              value={dialogObj.trx_id}
              margin="dense"
              label="거래번호"
              onChange={(e) => {
                setDialogObj({
                  ...dialogObj,
                  trx_id: e.target.value
                })
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={onChangeTrxId}>
              변경
            </Button>
            <Button color="inherit" onClick={() => {
              setDialogObj({})
            }}>
              취소
            </Button>
          </DialogActions>
        </Dialog>
        <Card>
          <Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
            {user?.level >= 40 &&
              <>

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
              </>}
            <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
              <InputLabel>출금상태</InputLabel>
              <Select label='출금상태' value={searchObj[`withdraw_status`]}
                onChange={(e) => {
                  onChangePage({ ...searchObj, [`withdraw_status`]: e.target.value })
                }}>
                <MenuItem value={null}>상태 전체</MenuItem>
                {withdrawStatusList.map(status => {
                  return <MenuItem value={status.value}>{`${status.label}`}</MenuItem>
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
            column_table={`withdraws`}
            excel_name={'출금'}
            between_content={<Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
              {data?.content &&
                <>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">조회건수</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.total)}</Typography>
                  </Row>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">출금예정금액</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.expect_amount + data?.chart?.withdraw_fee)}원</Typography>
                  </Row>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">실제출금금액</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.amount + data?.chart?.withdraw_fee)}원</Typography>
                  </Row>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">출금수수료</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.withdraw_fee)}원</Typography>
                  </Row>
                </>}
            </Row>}
          />
        </Card>
      </Stack>
    </>
  )
}
WithdrawList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default WithdrawList
