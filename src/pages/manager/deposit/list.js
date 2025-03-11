import { Avatar, Button, Card, CardContent, Checkbox, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager, apiUtil } from "src/utils/api-manager";
import { commarNumber, getFirstDateByMonth, getNumberByPercent, getUserFee, getUserLevelByNumber, onlyNumberText, returnMoment } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { useSettingsContext } from "src/components/settings";
import { bankCodeList, depositStatusList, operatorLevelList } from "src/utils/format";
import _ from "lodash";
//import { socket } from "src/data/data";

const DepositList = () => {
  const { setModal } = useModal()
  const router = useRouter();
  const { user } = useAuthContext();
  const { themeDnsData, themeMode } = useSettingsContext();
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
          let result = await apiManager(`deposits/check-deposit`, 'update', {
            id: row?.id,
            value: e.target.checked ? 1 : 0,
          });
        }} />
      },
      sx: (row) => {
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'trade_at',
      label: '거래시간',
      action: (row, is_excel) => {
        if (row?.trans_date) {
          return `${row?.trans_date} ${row?.trans_time}`
        } else {
          return "---"
        }
      },
      sx: (row) => {
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'created_at',
      label: '생성일',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      },
      sx: (row) => {
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
          return {
            color: 'red'
          }
        }
      },
    },
    ...(themeDnsData?.deposit_type == 'virtual_account' ? [
      {
        id: 'deposit_bank_code',
        label: '입금은행정보',
        action: (row, is_excel) => {
          let bank_list = bankCodeList();
          if (row?.is_type_withdraw_acct == 1) {
            bank_list = bankCodeList('withdraw');
          }
          if (is_excel) {
            return `${_.find(bank_list, { value: row['deposit_bank_code'] || row['virtual_deposit_bank_code'] })?.label ?? "---"} ${(row['deposit_detail']) ?? ""} ${row['deposit_acct_num'] || row['virtual_deposit_acct_num']} ${row['deposit_acct_name'] || row['virtual_deposit_acct_name']}`
          }
          return <Col>
            <div>{_.find(bank_list, { value: row['deposit_bank_code'] || row['virtual_deposit_bank_code'] })?.label ?? "---"}</div>
            <div>{row['deposit_detail'] ?? ""}</div>
            <div>{row['deposit_acct_num'] || row['virtual_deposit_acct_num']} {row['deposit_acct_name'] || row['virtual_deposit_acct_name']}</div>
          </Col>
        },
        sx: (row) => {
          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
            return {
              color: 'red'
            }
          }
        },
      },
    ] : []),
    ...(themeDnsData?.deposit_type == 'gift_card' ? [
      {
        id: 'gift_card_member',
        label: '입금회원정보',
        action: (row, is_excel) => {
          if (is_excel) {
            return `${row['member_guid']} ${row['member_phone_num']} ${row['member_name']}`
          }
          return <Col>
            <div>{row['member_guid'] ?? ""}</div>
            <div>{row['member_phone_num'] ?? ""}</div>
            <div>{row['member_name'] ?? ""}</div>
          </Col>
        },
        sx: (row) => {
          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
            return {
              color: 'red'
            }
          }
        },
      },
    ] : []),
    {
      id: 'status',
      label: '상태',
      action: (row, is_excel) => {
        let status = _.find(depositStatusList, { value: row?.deposit_status });
        if (is_excel) {
          return status?.label
        }
        return <Chip variant="soft" label={status?.label} color={status?.color} />
      }
    },
    ...(themeDnsData?.deposit_process_type == 1 ? [
      {
        id: 'status',
        label: '결제상태',
        action: (row, is_excel) => {
          if (is_excel) {
            return row?.is_pay_confirm == 1 ? '완료' : '대기중'
          }
          return <Chip variant="soft" label={row?.is_pay_confirm == 1 ? '완료' : '대기중'} color={row?.is_pay_confirm == 1 ? 'success' : 'warning'} />
        }
      },
    ] : []),
    ...(themeDnsData?.is_use_corp_account == 1 ? [
      {
        id: 'corp_acct_num',
        label: '법인통장번호',
        action: (row, is_excel) => {
          return row['corp_acct_num'] ?? "---"
        },
        sx: (row) => {
          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
            return {
              color: 'red'
            }
          }
        },
      },
    ] : []),
    ...(themeDnsData?.withdraw_type == 0 && themeDnsData?.deposit_type == 'virtual_account' ? [
      {
        id: 'virtual_acct_num',
        label: '가상계좌번호',
        action: (row, is_excel) => {
          return row['virtual_acct_num'] ?? "---"
        },
        sx: (row) => {

          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
            return {
              color: 'red'
            }
          }
        },
      },
    ] : []),
    ...(themeDnsData?.withdraw_type == 0 && themeDnsData?.deposit_type == 'gift_card' ? [
      {
        id: 'gift_card_code',
        label: '상품권 번호',
        action: (row, is_excel) => {
          return row['gift_card_code'] ?? "---"
        },
        sx: (row) => {

          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
            return {
              color: 'red'
            }
          }
        },
      },
    ] : []),
    ...(themeDnsData?.setting_obj?.is_use_virtual_user_name == 1 ? [
      {
        id: 'virtual_user_name',
        label: '유저아이디',
        action: (row, is_excel) => {
          return row['virtual_user_name'] ?? "---"
        }
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
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
          return {
            color: 'red'
          }
        }
        return {
          color: themeMode == 'dark' ? '#81c147' : 'green'
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
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
          return {
            color: 'red'
          }
        }
        return {
          color: themeMode == 'dark' ? '#0080ff' : 'blue'
        }
      },
    },
    ...((themeDnsData?.is_use_corp_account == 1 && user?.level >= 40) ? [
      {
        id: 'corp_account_balance',
        label: '법인통장잔액',
        action: (row, is_excel) => {
          return commarNumber(row['corp_account_balance'])
        },
        sx: (row) => {
          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
            return {
              color: 'red'
            }
          }
        },
      },
    ] : []),
    ...(([2, 5].includes(themeDnsData?.withdraw_corp_type) && user?.level >= 40) ? [
      {
        id: 'virtual_acct_balance',
        label: '가상계좌잔액',
        action: (row, is_excel) => {
          return commarNumber(row['virtual_acct_balance'])
        },
        sx: (row) => {
          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
          return {
            color: 'red'
          }
        }
        return {
          color: themeMode == 'dark' ? '#f29886' : '#a52a2a'
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
        if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
            return {
              color: 'red'
            }
          }
        },
      },
      {
        id: 'mcht_fee',
        label: '가맹점 요율 금액',
        action: (row, is_excel) => {
          return row[`mcht_fee`] > 0 ? commarNumber(getNumberByPercent(row['amount'], row['mcht_fee'])) : "---";
        },
        sx: (row) => {
          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
            if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
            if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
            if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
              return {
                color: 'red'
              }
            }
            return {
              color: themeMode == 'dark' ? '#f29886' : '#a52a2a'
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
                if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
                  if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
                  if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
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
                return row[`sales${operator?.num}_amount`] == 0 ? "---" : commarNumber(row[`sales${operator?.num}_amount`]);
              },
              sx: (row) => {
                if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
                  return {
                    color: 'red'
                  }
                }
                return {
                  color: themeMode == 'dark' ? '#f29886' : '#a52a2a'
                }
              },
            },
          ]
        } else {
          return []
        }

      }).flat(),
    ] : []),

    ...(themeDnsData?.deposit_corp_type == 7 ? [
      {
        id: 'cancel_deposit',
        label: '입금취소처리',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          if (row?.is_cancel == 1) {
            return '취소건'
          } else {
            let button_item = <Button
              variant="contained"
              size="small"
              sx={{ width: '100px' }}
              startIcon={<Icon icon={'material-symbols:cancel-outline'} />}
              onClick={() => {
                if (themeDnsData?.deposit_corp_type == 7) {
                  onCancelDepositByVirtualAccount(row?.id)
                } else {
                  onCancelDeposit(row?.id)
                }
              }}
            >취소처리</Button>;
            if (themeDnsData?.deposit_corp_type == 7) {
              if (row?.deposit_status != 0 && !(row?.is_cancel == 1 || row?.is_delete == 1)) {
                return button_item;
              }
            } else {
              return "---";
            }

          }
        },
        sx: (row) => {
          if (row?.deposit_status == 10 || row?.is_cancel == 1 || row?.is_delete == 1) {
            return {
              color: 'red'
            }
          }
        },
      },
    ] : []),
  ]
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [operUserList, setOperUserList] = useState([]);
  const [corpAccountList, setCorpAccountList] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [dialogObj, setDialogObj] = useState({
    changeNote: false,
  })
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
    s_dt: returnMoment().substring(0, 10),
    e_dt: returnMoment().substring(0, 10),
    search: '',
  })

  useEffect(() => {
    pageSetting();
  }, [])
  useEffect(() => {
    /*
    socket.on(`message_${themeDnsData?.id}`, (msg) => {
      let { method, data, brand_id, title } = msg;
      if (brand_id == themeDnsData?.id && (user?.level >= 40 || (user?.id == data?.user_id))) {
        let method_list = [`deposit`, 'settle_request']
        if (method == 'deposit' && themeDnsData?.setting_obj?.is_reload_when_deposit == 1) {
          onChangePage(searchObj);
        }
      }
    });
    */

  }, [])
  const pageSetting = () => {

    getAllOperUser();
    if (themeDnsData?.is_use_corp_account == 1) {
      getCorpAccounts();
    }

    onChangePage({ ...searchObj, page: 1, virtual_account_id: (router.query?.virtual_account_id ?? null) });

  }

  const getAllOperUser = async () => {
    let data = await apiManager('users', 'list', {
      level_list: [10, ...operatorLevelList.map(itm => { return itm.value })],
    });
    setOperUserList(data?.content ?? []);
  }
  const getCorpAccounts = async () => {
    let data = await apiManager('corp-accounts', 'list', {
      page: 1,
    });
    setCorpAccountList(data?.content ?? []);
  }
  const onChangePage = async (obj_) => {
    let obj = obj_;
    if (obj) {
      setSearchObj(obj);
    } else {
      obj = { ...searchObj };
    }
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('deposits', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const onChagneNote = async () => {
    let result = await apiManager('deposits/change-note', 'create', dialogObj);
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      setDialogObj({});
      onChangePage(searchObj);
    }
  }
  const onAddNotiDeposit = async () => {
    setPageLoading(true);
    let result = await apiManager('deposits/add-noti', 'create', dialogObj);
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      setDialogObj({});
      onChangePage(searchObj);
    }
    setPageLoading(false);
  }
  const onCancelDeposit = async (id) => {
    if (!window.confirm('입금취소처리 하시겠습니까?')) {
      return;
    }
    setPageLoading(true);
    let result = await apiManager('deposits/cancel', 'create', {
      id
    });
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      setDialogObj({});
      onChangePage(searchObj);
    }
    setPageLoading(false);
  }
  const onCancelDepositByVirtualAccount = async (id) => {
    if (!window.confirm('입금취소처리 하시겠습니까?')) {
      return;
    }
    setPageLoading(true);
    let result = await apiManager('virtual-accounts/cancel-deposit', 'create', {
      id
    });
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      onChangePage(searchObj);
    }
    setPageLoading(false);
  }
  return (
    <>
      <Dialog open={pageLoading}
        PaperProps={{
          style: {
            background: 'transparent',
            overflow: 'hidden'
          }
        }}
      >
        <CircularProgress />
      </Dialog>
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
      <Dialog
        open={dialogObj.addNotiDeposit}
        onClose={() => {
          setDialogObj({})
        }}
      >
        <DialogTitle>{`노티 누락건 추가`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            아래 내용을 입력 후 확인을 눌러주세요.
          </DialogContentText>
          <TextField
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
          <TextField
            fullWidth
            value={dialogObj.guid}
            margin="dense"
            label="guid"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                guid: e.target.value
              })
            }}
          />
          <TextField
            fullWidth
            value={dialogObj.amount}
            margin="dense"
            label="금액"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                amount: onlyNumberText(e.target.value)
              })
            }}
          />
          {themeDnsData?.deposit_corp_type == 6 &&
            <>
              <TextField
                fullWidth
                value={dialogObj.date}
                margin="dense"
                type="date"
                label="날짜"
                onChange={(e) => {
                  setDialogObj({
                    ...dialogObj,
                    date: e.target.value
                  })
                }}
              />
              <TextField
                fullWidth
                value={dialogObj.time}
                margin="dense"
                type="time"
                label="시간"
                onChange={(e) => {
                  setDialogObj({
                    ...dialogObj,
                    time: e.target.value
                  })
                }}
              />
            </>}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => {
            setModal({
              func: () => { onAddNotiDeposit() },
              icon: 'material-symbols:edit-outline',
              title: '저장 하시겠습니까?'
            })
          }}>
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
                {themeDnsData?.is_use_corp_account == 1 &&
                  <>
                    <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                      <InputLabel>법인통장 선택</InputLabel>
                      <Select label={'법인통장 선택'} value={searchObj[`corp_account_id`]}
                        onChange={(e) => {
                          onChangePage({ ...searchObj, [`corp_account_id`]: e.target.value, page: 1, })
                        }}>
                        <MenuItem value={null}>법인통장 전체</MenuItem>
                        <MenuItem value={-1}>법인통장 제외</MenuItem>
                        {corpAccountList.map(corp => {
                          return <MenuItem value={corp?.id}>{`(${_.find(bankCodeList(), { value: corp?.bank_code })?.label})${corp?.acct_num}`}</MenuItem>
                        })}
                      </Select>
                    </FormControl>
                  </>}
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
                <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                  <InputLabel>입금상태</InputLabel>
                  <Select label='입금상태' value={searchObj[`deposit_status`]}
                    onChange={(e) => {
                      onChangePage({ ...searchObj, [`deposit_status`]: e.target.value })
                    }}>
                    <MenuItem value={null}>상태 전체</MenuItem>
                    {depositStatusList.map(status => {
                      return <MenuItem value={status.value}>{`${status.label}`}</MenuItem>
                    })}
                  </Select>
                </FormControl>
                {themeDnsData?.deposit_process_type == 1 &&
                  <>
                    <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                      <InputLabel>결제상태</InputLabel>
                      <Select label='결제상태' value={searchObj[`is_pay_confirm`]}
                        onChange={(e) => {
                          onChangePage({ ...searchObj, [`is_pay_confirm`]: e.target.value })
                        }}>
                        <MenuItem value={null}>상태 전체</MenuItem>
                        <MenuItem value={1}>완료</MenuItem>
                        <MenuItem value={0}>대기중</MenuItem>

                      </Select>
                    </FormControl>
                  </>}
                <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                  <InputLabel>삭제여부</InputLabel>
                  <Select label='삭제여부' value={searchObj[`is_delete`]}
                    onChange={(e) => {
                      onChangePage({ ...searchObj, [`is_delete`]: e.target.value })
                    }}>
                    <MenuItem value={0}>삭제안됨</MenuItem>
                    <MenuItem value={1}>삭제됨</MenuItem>
                  </Select>
                </FormControl>
                {((user?.level >= 40 && !(themeDnsData?.parent_id > 0)) || user?.level >= 45) && [1, 3, 6].includes(themeDnsData?.deposit_corp_type) &&
                  <>
                    <Button variant="outlined" onClick={() => {
                      setDialogObj({
                        addNotiDeposit: true,
                      })
                    }}>노티 누락건 추가</Button>
                  </>}
              </Row>
            </>}
          <ManagerTable
            data={data}
            columns={defaultColumns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={themeDnsData?.is_can_add_deposit == 1 ? '결제내역추가' : ''}
            head_columns={[]}
            table={'deposits'}
            column_table={'deposits'}
            excel_name={'입금'}
            middle_line_content={<>
              <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                <InputLabel>취소상태</InputLabel>
                <Select label='취소상태' value={searchObj[`is_cancel`]}
                  onChange={(e) => {
                    onChangePage({ ...searchObj, [`is_cancel`]: e.target.value, page: 1, })
                  }}>
                  <MenuItem value={null}>상태 전체</MenuItem>
                  <MenuItem value={1}>취소됨</MenuItem>
                  <MenuItem value={0}>취소안됨</MenuItem>
                </Select>
              </FormControl>
            </>}
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
                  {user?.level == 10 &&
                    <>
                      <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                        <Typography variant="body2">총 차감 수수료</Typography>
                        <Typography variant="subtitle2">{commarNumber((data?.chart?.amount ?? 0) - (data?.chart?.mcht_amount ?? 0))}원</Typography>
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
