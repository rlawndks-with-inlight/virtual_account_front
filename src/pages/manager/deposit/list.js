import { Avatar, Button, Card, CardContent, Checkbox, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager, apiUtil } from "src/utils/api-manager";
import { commarNumber, getUserFee, getUserLevelByNumber } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { useSettingsContext } from "src/components/settings";
import { bankCodeList, operatorLevelList } from "src/utils/format";
import _ from "lodash";
import { socket } from "src/data/data";
const DepositList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const defaultHeadColumns = [
    {
      title: '기본정보',
      count: user?.level >= 40 ? 9 : 8,
    },
  ]
  const defaultColumns = [
    {
      id: 'check',
      label: '확인체크',
      action: (row, is_excel) => {

        return <Checkbox defaultChecked={row?.is_check_user == 1} onChange={async (e) => {
          let result = await apiUtil(`deposits/is_check_user`, 'update', {
            id: row?.id,
            value: e.target.checked ? 1 : 0,
          })
        }} />
      },
      sx: (row) => {
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'note',
      label: '비고',
      action: (row, is_excel) => {
        let text = row?.note ?? "---";
        if (row?.deposit_status == 10) {
          text = "오입금 주의";
        }
        return text;
      },
      sx: (row) => {
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
      },
    },
    ...(user?.level >= 40 ? [
      {
        id: 'eidt_note',
        label: '비고수정',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Button variant="outlined" size="small" sx={{ width: '100px' }}
            onClick={() => {
              setDialogObj({ changeNote: true, deposit_id: row?.id })
            }}
          >비고수정</Button>;
        },
      },
    ] : []),
    {
      id: 'trx_id',
      label: '거래번호',
      action: (row, is_excel) => {
        return row['trx_id'] ?? "---"
      },
      sx: (row) => {
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'mcht_nickname',
      label: '가맹점',
      action: (row, is_excel) => {
        if (!row?.mcht_user_name) {
          return "---";
        }
        return `${row[`mcht_nickname`]}\n(${row['mcht_user_name']})`
      },
      sx: (row) => {
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'deposit_bank_code',
      label: '입금은행정보',
      action: (row, is_excel) => {
        let bank_list = bankCodeList();
        if (row?.is_type_withdraw_acct == 1) {
          bank_list = bankCodeList('withdraw');
        }
        if (is_excel) {
          return `${_.find(bank_list, { value: row['deposit_bank_code'] })?.label ?? "---"} ${row['deposit_acct_num']} ${row['deposit_acct_name']}`
        }
        return <Col>
          <div>{_.find(bank_list, { value: row['deposit_bank_code'] })?.label ?? "---"}</div>
          <div>{row['deposit_acct_num']} {row['deposit_acct_name']}</div>
        </Col>
      },
      sx: (row) => {
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
      },
    },
    ...(themeDnsData?.is_use_corp_account == 1 ? [
      {
        id: 'corp_acct_num',
        label: '법인통장번호',
        action: (row, is_excel) => {
          return row['corp_acct_num'] ?? "---"
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
    ...(themeDnsData?.withdraw_type == 0 ? [
      {
        id: 'virtual_acct_num',
        label: '가상계좌번호',
        action: (row, is_excel) => {
          return row['virtual_acct_num'] ?? "---"
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
    // {
    //   id: 'user_name',
    //   label: '상태',
    //   action: (row, is_excel) => {
    //     return row['user_name'] ?? "---"
    //   }
    // },
    {
      id: 'expect_amount',
      label: '입금예정금액',
      action: (row, is_excel) => {
        return commarNumber(row['expect_amount'])
      },
      sx: (row) => {
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
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
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
        return {
          color: 'blue'
        }
      },
    },
    ...(themeDnsData?.is_use_corp_account == 1 ? [
      {
        id: 'corp_account_balance',
        label: '법인통장잔액',
        action: (row, is_excel) => {
          return commarNumber(row['corp_account_balance'])
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
    {
      id: 'mcht_amount',
      label: '가맹점 정산금액',
      action: (row, is_excel) => {
        return commarNumber(row['mcht_amount'])
      },
      sx: (row) => {
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
        return {
          color: '#a52a2a'
        }
      },
    },
    {
      id: 'deposit_fee',
      label: '입금수수료',
      action: (row, is_excel) => {
        return commarNumber(row['deposit_fee'])
      },
      sx: (row) => {
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
      },
    },
    ...(themeDnsData?.is_use_fee_operator == 1 ? [
      {
        id: 'mcht_fee',
        label: '가맹점 요율',
        action: (row, is_excel) => {
          return row['mcht_fee'] + '%'
        },
        sx: (row) => {
          if (row?.deposit_status == 10) {
            return {
              color: 'red'
            }
          }
        },
      },
      /*
      {
        id: 'mcht_fee',
        label: '가맹점 획득 요율',
        action: (row, is_excel) => {
          return parseFloat(getUserFee(row, 10, themeDnsData?.operator_list, themeDnsData?.head_office_fee)) + '%'
        }
      },
      */
      ...(user?.level >= 40 ? [
        {
          id: 'head_office_fee',
          label: '본사 요율',
          action: (row, is_excel) => {
            return row['head_office_fee'] + '%'
          },
          sx: (row) => {
            if (row?.deposit_status == 10) {
              return {
                color: 'red'
              }
            }
          },
        },
        {
          id: `head_office_get_fee`,
          label: `본사 획득 요율`,
          action: (row, is_excel) => {
            return row[`head_office_fee`] > 0 ? parseFloat(getUserFee(row, 40, themeDnsData?.operator_list, themeDnsData?.head_office_fee)) + '%' : "---"
          },
          sx: (row) => {
            if (row?.deposit_status == 10) {
              return {
                color: 'red'
              }
            }
          },
        },
        {
          id: 'head_office_amount',
          label: '본사 수수료',
          action: (row, is_excel) => {
            return commarNumber(row['head_office_amount'])
          },
          sx: (row) => {
            if (row?.deposit_status == 10) {
              return {
                color: 'red'
              }
            }
            return {
              color: '#a52a2a'
            }
          },
        },
      ] : []),
      ...(themeDnsData?.operator_list ?? []).map(operator => {
        if (user?.level >= operator?.value) {
          let label = operator?.label;
          if (user?.level > 10 && user?.level < 40) {
            label = (operator?.label ?? "").includes('대리점') ? '대리점' : operator?.label;
          }
          return [
            {
              id: `sales${operator?.num}_id`,
              label: label,
              action: (row, is_excel) => {
                return row[`sales${operator?.num}_id`] > 0 ? <div style={{ textAlign: 'center' }}>{`${row[`sales${operator?.num}_nickname`]}\n(${row[`sales${operator?.num}_user_name`]})`}</div> : `---`
              },
              sx: (row) => {
                if (row?.deposit_status == 10) {
                  return {
                    color: 'red'
                  }
                }
              },
            },
            ...(user?.level >= 40 ? [
              {
                id: `sales${operator?.num}_fee`,
                label: `${label} 요율`,
                action: (row, is_excel) => {
                  return row[`sales${operator?.num}_id`] > 0 ? row[`sales${operator?.num}_fee`] + '%' : "---"
                },
                sx: (row) => {
                  if (row?.deposit_status == 10) {
                    return {
                      color: 'red'
                    }
                  }
                },
              },
              {
                id: `sales${operator?.num}_get_fee`,
                label: `${label} 획득 요율`,
                action: (row, is_excel) => {
                  return row[`sales${operator?.num}_id`] > 0 ? parseFloat(getUserFee(row, operator?.value, themeDnsData?.operator_list, themeDnsData?.head_office_fee)) + '%' : "---"
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
            {
              id: `sales${operator?.num}_amount`,
              label: `${label} 수수료`,
              action: (row, is_excel) => {
                return row[`sales${operator?.num}_amount`] > 0 ? commarNumber(row[`sales${operator?.num}_amount`]) : "---"
              },
              sx: (row) => {
                if (row?.deposit_status == 10) {
                  return {
                    color: 'red'
                  }
                }
                return {
                  color: '#a52a2a'
                }
              },
            },
          ]
        } else {
          return []
        }

      }).flat(),
    ] : []),
    {
      id: 'created_at',
      label: '생성일',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      },
      sx: (row) => {
        if (row?.deposit_status == 10) {
          return {
            color: 'red'
          }
        }
      },
    },
  ]
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [operUserList, setOperUserList] = useState([]);
  const [dialogObj, setDialogObj] = useState({
    changeNote: false,
  })
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
  })

  useEffect(() => {
    pageSetting();
  }, [])
  useEffect(() => {
    socket.on('message', (msg) => {
      let { method, data, brand_id, title } = msg;
      if (brand_id == themeDnsData?.id && (user?.level >= 40 || (user?.id == data?.user_id))) {
        let method_list = [`deposit`, 'settle_request']
        if (method == 'deposit' && themeDnsData?.setting_obj?.is_reload_when_deposit == 1) {
          onChangePage(searchObj);
        }
      }
    });
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
    let data_ = await apiManager('deposits', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const onChagneNote = async () => {
    let result = await apiManager('deposits/change-note', 'create', dialogObj);
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      setDialogObj({});
      onChangePage(searchObj);
    }
  }
  return (
    <>
      <Dialog
        open={dialogObj.changeNote}
        onClose={() => {
          setDialogObj({})
        }}
      >
        <DialogTitle>{`비고 수정`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            비고내용을 입력 후 확인을 눌러주세요.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={dialogObj.note}
            margin="dense"
            label="메모"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                note: e.target.value
              })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onChagneNote}>
            확인
          </Button>
          <Button color="inherit" onClick={() => {
            setDialogObj({})
          }}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
      <Stack spacing={3}>
        <Card>
          {user?.level >= 40 &&
            <>
              <Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
                {(themeDnsData?.operator_list ?? []).map(operator => {
                  return <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                    <InputLabel>{operator?.label}</InputLabel>
                    <Select label={operator?.label} value={searchObj[`sales${operator?.num}_id`]}
                      onChange={(e) => {
                        onChangePage({ ...searchObj, [`sales${operator?.num}_id`]: e.target.value, page: 1, })
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
                      onChangePage({ ...searchObj, [`mcht_id`]: e.target.value, page: 1, })
                    }}>
                    <MenuItem value={null}>가맹점 전체</MenuItem>
                    {operUserList.filter(el => el?.level == 10).map(oper => {
                      return <MenuItem value={oper?.id}>{`${oper?.nickname}(${oper?.user_name})`}</MenuItem>
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
            add_button_text={themeDnsData?.is_use_corp_account == 1 ? '결제내역추가' : ''}
            head_columns={[]}
            table={'deposits'}
            column_table={'deposits'}
            excel_name={'출금'}
            between_content={<Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
              {data?.content &&
                <>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">조회건수</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.total)}</Typography>
                  </Row>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">입금예정금액</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.expect_amount)}원</Typography>
                  </Row>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">실제입금금액</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.amount)}원</Typography>
                  </Row>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">가맹점정산금액</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.mcht_amount)}원</Typography>
                  </Row>
                  {user?.level >= 40 &&
                    <>
                      <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                        <Typography variant="body2">본사수수료</Typography>
                        <Typography variant="subtitle2">{commarNumber(data?.chart?.head_office_amount)}원</Typography>
                      </Row>
                    </>}
                  {themeDnsData?.operator_list.map(oper => {
                    if (user?.level >= oper?.value) {
                      return <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                        <Typography variant="body2">{oper?.label}수수료</Typography>
                        <Typography variant="subtitle2">{commarNumber(data?.chart[`sales${oper?.num}_amount`])}원</Typography>
                      </Row>
                    }

                  })}
                  {user?.level >= 40 &&
                    <>
                      <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                        <Typography variant="body2">총 영업자 수수료</Typography>
                        <Typography variant="subtitle2">{commarNumber(_.sum(themeDnsData?.operator_list.map(oper => {
                          return data?.chart[`sales${oper?.num}_amount`]
                        })))}원</Typography>
                      </Row>
                    </>}
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">입금수수료</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.deposit_fee)}원</Typography>
                  </Row>
                </>}
            </Row>}
          />
        </Card>
      </Stack>
    </>
  )
}
DepositList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DepositList
