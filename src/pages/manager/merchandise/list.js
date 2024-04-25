import { Avatar, Button, Card, Checkbox, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager, apiUtil } from "src/utils/api-manager";
import { commarNumber, commarNumberInput, getReturnUri, getUserDepositFee, getUserFee, getUserStatusByNum, getUserWithDrawFee, onlyNumberText } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { bankCodeList, operatorLevelList, virtualAcctLinkStatusList } from "src/utils/format";
import { useSettingsContext } from "src/components/settings";
import _ from "lodash";
import navConfig from "src/layouts/manager/nav/config-navigation";
const UserList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const defaultColumns = [
    {
      id: 'profile_img',
      label: '유저프로필',
      action: (row, is_excel) => {
        if (is_excel) {
          return row['profile_img']
        }
        return <Avatar src={row['profile_img'] ?? "---"} />
      }
    },
    {
      id: 'nickname',
      label: '닉네임',
      action: (row, is_excel) => {
        if (is_excel) {
          return row['nickname']
        }
        return <div style={{ cursor: 'pointer' }} onClick={() => {
          router.push(`edit/${row?.id}`)
        }}>
          {row['nickname'] ?? "---"}
        </div>
      }
    },
    {
      id: 'name',
      label: '이름',
      action: (row, is_excel) => {
        return row['name'] ?? "---"
      }
    },
    ...(user?.level >= 40 ? [
      {
        id: 'update_user_deposit',
        label: '정산금 수정',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Col style={{ alignItems: 'center', rowGap: '0.5rem' }}>
            <Button variant="contained" size="small" sx={{ width: '100px' }}
              onClick={() => {
                setDialogObj({ changeUserDeposit: true })
                setChangeUserDepositObj({
                  amount: '',
                  user_id: row?.id,
                  pay_type: 25,
                  deposit_fee: themeDnsData?.setting_obj?.is_settle_user_deposit_operator == 1 ? row?.deposit_fee : 0,
                  is_use_deposit_fee: themeDnsData?.setting_obj?.is_settle_user_deposit_operator == 1 ? 1 : 0,
                })
              }}
            >정산금 지급</Button>
            <Button variant="outlined" size="small" sx={{ width: '100px' }}
              onClick={() => {
                setDialogObj({ changeUserDeposit: true })
                setChangeUserDepositObj({
                  amount: '',
                  user_id: row?.id,
                  pay_type: 30,
                })
              }}
            >정산금 차감</Button>
          </Col>
        }
      },
    ] : []),
    {
      id: 'mid',
      label: 'MID',
      action: (row, is_excel) => {
        return row['mid'] ?? "---"
      }
    },
    ...(themeDnsData?.withdraw_type == 0 ? [
      {
        id: 'virtual_acct_link',
        label: '가상계좌발급주소',
        action: (row, is_excel) => {
          let link = 'https://' + themeDnsData?.dns + `/virtual-account/${row?.mid}`;
          if (is_excel) {
            return link
          }
          return <div style={{
            cursor: 'pointer',
            color: 'blue',
          }}
            onClick={() => {
              window.open(`/virtual-account/${row?.mid}`)
            }}
          >
            {link}
          </div>
        }
      },
      ...(user?.level >= 40 ? [
        {
          id: 'virtual_bank',
          label: '발급주소 상태',
          action: (row, is_excel) => {

            if (is_excel) {
              return `---`
            }
            return <Select
              size='small'
              defaultValue={row?.virtual_acct_link_status}
              disabled={!(user?.level >= 40)}
              onChange={async (e) => {
                let result = await apiUtil(`users/virtual_acct_link_status`, 'update', {
                  id: row?.id,
                  value: e.target.value
                });
              }}
            >
              {virtualAcctLinkStatusList.map((itm) => {
                return <MenuItem value={itm.value}>{itm?.label}</MenuItem>
              })}
            </Select>
          }
        },
      ] : []),
      {
        id: 'virtual_bank',
        label: '가상계좌정보',
        action: (row, is_excel) => {

          if (is_excel) {
            return `${_.find(bankCodeList(), { value: row['virtual_bank_code'] })?.label ?? "---"} ${row['virtual_acct_num']} ${row['virtual_acct_name']}`
          }

          return <Col>
            <div>{_.find(bankCodeList(), { value: row['virtual_bank_code'] })?.label ?? "---"}</div>
            <div>{row['virtual_acct_num']} {row['virtual_acct_name']}</div>
          </Col>
        }
      },
    ] : []),
    {
      id: 'settle_bank',
      label: '정산계좌정보',
      action: (row, is_excel) => {
        if (themeDnsData?.withdraw_type == 0) {
          if (is_excel) {
            return `${_.find(bankCodeList('withdraw'), { value: row['settle_bank_code'] })?.label ?? "---"} ${row['settle_acct_num']} ${row['settle_acct_name']}`
          }
          return <Col>
            <div>{_.find(bankCodeList('withdraw'), { value: row['settle_bank_code'] })?.label ?? "---"}</div>
            <div>{row['settle_acct_num']} {row['settle_acct_name']}</div>
          </Col>
        } else if (themeDnsData?.withdraw_type == 1) {
          if (is_excel) {
            return `${_.find(bankCodeList('withdraw'), { value: row['withdraw_bank_code'] })?.label ?? "---"} ${row['withdraw_acct_num']} ${row['withdraw_acct_name']}`
          }
          return <Col>
            <div>{_.find(bankCodeList('withdraw'), { value: row['withdraw_bank_code'] })?.label ?? "---"}</div>
            <div>{row['withdraw_acct_num']} {row['withdraw_acct_name']}</div>
          </Col>
        }
      }
    },
    {
      id: 'settle_amount',
      label: '보유정산금',
      action: (row, is_excel) => {
        return commarNumber(row['settle_amount'])
      }
    },
    {
      id: 'deposit_amount',
      label: '입금액',
      action: (row, is_excel) => {
        return commarNumber(row['deposit_amount'])
      }
    },
    {
      id: 'withdraw_amount',
      label: '출금액',
      action: (row, is_excel) => {
        return commarNumber(row['withdraw_amount'] + row['withdraw_fee_amount'])
      }
    },
    {
      id: 'withdraw_fail_amount',
      label: '출금실패차감정산금',
      action: (row, is_excel) => {
        return commarNumber(row['withdraw_fail_amount'])
      }
    },
    {
      id: 'manager_plus_amount',
      label: '관리자지급액',
      action: (row, is_excel) => {
        return commarNumber(row['manager_plus_amount'])
      }
    },
    {
      id: 'manager_minus_amount',
      label: '관리자차감액',
      action: (row, is_excel) => {
        return commarNumber(row['manager_minus_amount'])
      }
    },
    {
      id: 'phone_num',
      label: '전화번호',
      action: (row, is_excel) => {
        return row['phone_num'] ?? "---"
      }
    },
    ...((user?.level >= 10 && themeDnsData?.is_use_fee_operator == 1) ? [
      {
        id: 'mcht_fee',
        label: '가맹점 요율',
        action: (row, is_excel) => {
          return row['mcht_fee'] + '%'
        }
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
            }
          },
          ...(themeDnsData?.is_use_fee_operator == 1 ? [
            {
              id: `sales${operator?.num}_fee_1`,
              label: `${label} 요율`,
              action: (row, is_excel) => {
                return row[`sales${operator?.num}_id`] > 0 ? row[`sales${operator?.num}_fee`] + '%' : "---"
              }
            },
            {
              id: `sales${operator?.num}_fee_2`,
              label: `${label} 획득 요율`,
              action: (row, is_excel) => {
                return row[`sales${operator?.num}_id`] > 0 ? parseFloat(getUserFee(row, operator?.value, themeDnsData?.operator_list, themeDnsData?.head_office_fee)) + '%' : "---"
              }
            },
          ] : []),
          ...(themeDnsData?.is_use_deposit_operator == 1 ? [
            {
              id: `sales${operator?.num}_deposit_fee_1`,
              label: `${label} 입금수수료`,
              action: (row, is_excel) => {
                return row[`sales${operator?.num}_id`] > 0 ? row[`sales${operator?.num}_deposit_fee`] : "---"
              }
            },
            {
              id: `sales${operator?.num}_deposit_fee_2`,
              label: `${label} 획득 입금수수료`,
              action: (row, is_excel) => {
                return row[`sales${operator?.num}_id`] > 0 ? parseFloat(getUserDepositFee(row, operator?.value, themeDnsData?.operator_list, themeDnsData?.deposit_head_office_fee)) : "---"
              }
            },
          ] : []),
          ...(themeDnsData?.is_use_withdraw_operator == 1 ? [
            {
              id: `sales${operator?.num}_withdraw_fee_1`,
              label: `${label} 출금수수료`,
              action: (row, is_excel) => {
                return row[`sales${operator?.num}_id`] > 0 ? row[`sales${operator?.num}_withdraw_fee`] : "---"
              }
            },
            {
              id: `sales${operator?.num}_withdraw_fee_2`,
              label: `${label} 획득 출금수수료`,
              action: (row, is_excel) => {
                return row[`sales${operator?.num}_id`] > 0 ? parseFloat(getUserWithDrawFee(row, operator?.value, themeDnsData?.operator_list, themeDnsData?.withdraw_head_office_fee)) : "---"
              }
            },
          ] : []),
        ]
      } else {
        return []
      }
    }).flat(),
    {
      id: 'created_at',
      label: '가입일',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      }
    },
    {
      id: 'last_login_time',
      label: '마지막로그인시간',
      action: (row, is_excel) => {
        return row['last_login_time'] ?? "---"
      }
    },
    {
      id: 'connected_ip',
      label: '접속아이피',
      action: (row, is_excel) => {
        return row['connected_ip'] ?? "---"
      }
    },
    {
      id: 'status',
      label: '유저상태',
      action: (row, is_excel) => {
        if (is_excel) {
          return getUserStatusByNum(row?.status)
        }
        return <Select
          size='small'
          value={row?.status}
          disabled={!(user?.level >= 40)}
          onChange={async (e) => {
            let result = await apiManager(`users/change-status`, 'update', {
              id: row?.id,
              status: e.target.value
            });
            if (result) {
              onChangePage(searchObj)
            }
          }}
        >
          <MenuItem value={'0'}>{'정상'}</MenuItem>
          <MenuItem value={'1'}>{'가입대기'}</MenuItem>
          <MenuItem value={'2'}>{'로그인금지'}</MenuItem>
        </Select>
      }
    },
    ...(user?.level >= 40 ? [
      {
        id: 'user_login',
        label: '해당 유저로 로그인',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Button variant="outlined" size="small" sx={{ width: '100px' }}
            onClick={() => {
              setModal({
                func: () => { onSignInAnotherUser(row?.id) },
                icon: 'material-symbols:lock-outline',
                title: '해당 유저로 로그인 하시겠습니까?'
              })
            }}
          >유저 로그인</Button>
        }
      },
    ] : []),
    ...(user?.level >= 40 ? [
      {
        id: 'edit_password',
        label: '비밀번호 변경',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---"
          }
          if (user?.level < row?.level) {
            return "---"
          }
          return (
            <>
              <IconButton onClick={() => {
                setDialogObj({ changePassword: true })
                setChangePasswordObj({
                  user_pw: '',
                  id: row?.id
                })
              }}>
                <Icon icon='material-symbols:lock-outline' />
              </IconButton>
            </>
          )
        }
      },
      {
        id: 'edit',
        label: '수정/삭제',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---"
          }
          return (
            <>
              <IconButton>
                <Icon icon='material-symbols:edit-outline' onClick={() => {
                  router.push(`edit/${row?.id}`)
                }} />
              </IconButton>
              <IconButton onClick={() => {
                setModal({
                  func: () => { deleteUser(row?.id) },
                  icon: 'material-symbols:delete-outline',
                  title: '정말 삭제하시겠습니까?'
                })
              }}>
                <Icon icon='material-symbols:delete-outline' />
              </IconButton>
            </>
          )
        }
      },
    ] : []),
  ]
  const navList = navConfig();
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
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
  const [changeUserDepositObj, setChangeUserDepositObj] = useState({
    amount: 0,
  })


  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, page: 1, level: 10, });
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
    let data_ = await apiManager('users', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deleteUser = async (id) => {
    let data = await apiManager('users', 'delete', { id });
    if (data) {
      onChangePage(searchObj);
    }
  }
  const onChangeUserPassword = async () => {
    let result = await apiManager(`users/change-pw`, 'update', changePasswordObj);
    if (result) {
      setDialogObj({
        ...dialogObj,
        changePassword: false
      })
      setChangePasswordObj({
        id: '',
        user_pw: ''
      })
      toast.success("성공적으로 변경 되었습니다.");
    }
  }
  const onChangeUserDeposit = async () => {
    setDialogObj({})
    let result = await apiManager(`users/change-deposit`, 'create', changeUserDepositObj)
    if (result) {
      setChangeUserDepositObj({})
      toast.success("성공적으로 저장 되었습니다.");
      onChangePage(searchObj);
    }
  }
  const onSignInAnotherUser = async (user_id) => {
    const result = await apiManager(`auth/sign-in-another-user`, 'create', {
      user_id,
    })
    if (result?.id) {
      window.location.href = getReturnUri(navList);
    }
  }
  return (
    <>
      <Dialog
        open={dialogObj.changePassword}
        onClose={() => {
          setDialogObj({
            ...dialogObj,
            changePassword: false
          })
        }}
      >
        <DialogTitle>{`비밀번호 변경`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            새 비밀번호를 입력 후 확인을 눌러주세요.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={changePasswordObj.user_pw}
            type="password"
            margin="dense"
            label="새 비밀번호"
            onChange={(e) => {
              setChangePasswordObj({
                ...changePasswordObj,
                user_pw: e.target.value
              })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onChangeUserPassword}>
            변경
          </Button>
          <Button color="inherit" onClick={() => {
            setDialogObj({
              ...dialogObj,
              changePassword: false
            })
          }}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={dialogObj.changeUserDeposit}
        onClose={() => {
          setDialogObj({
            ...dialogObj,
            changeUserDeposit: false
          })
        }}
      >
        <DialogTitle>{`정산금 관리자 ${changeUserDepositObj?.pay_type == 25 ? '지급' : '차감'}`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {changeUserDepositObj?.pay_type == 25 ? '지급' : '차감'}할 금액을 입력해 주세요.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={commarNumberInput(changeUserDepositObj?.amount)}
            margin="dense"
            label="금액"
            onChange={(e) => {
              setChangeUserDepositObj({
                ...changeUserDepositObj,
                amount: onlyNumberText(e.target.value)
              })
            }}
          />
          {(changeUserDepositObj?.pay_type == 25 && themeDnsData?.setting_obj?.is_settle_user_deposit_operator == 1) &&
            <>
              {changeUserDepositObj?.setting_obj?.is_settle_user_deposit_operator == 1 &&
                <>
                  <TextField
                    fullWidth
                    disabled={true}
                    value={changeUserDepositObj.deposit_fee}
                    margin="dense"
                    label="입금 수수료"
                    type="number"
                  />
                </>}
              <TextField
                fullWidth
                disabled={true}
                value={commarNumberInput(changeUserDepositObj.amount - (changeUserDepositObj?.is_use_deposit_fee == 1 ? changeUserDepositObj.deposit_fee : 0))}
                margin="dense"
                label="적립 예정 금액"
              />
            </>}
          <TextField
            fullWidth
            multiline
            rows={4}
            value={changeUserDepositObj.note}
            margin="dense"
            label="메모"
            onChange={(e) => {
              setChangeUserDepositObj({
                ...changeUserDepositObj,
                note: e.target.value
              })
            }}
          />
        </DialogContent>
        <DialogActions>
          {changeUserDepositObj?.pay_type == 25 &&
            <>
              {themeDnsData?.setting_obj?.is_settle_user_deposit_operator == 1 &&
                <>
                  <FormControlLabel
                    label={<Typography>입금 수수료 적용</Typography>}
                    control={<Checkbox checked={changeUserDepositObj?.is_use_deposit_fee} />}
                    onChange={(e) => {
                      setChangeUserDepositObj({
                        ...changeUserDepositObj,
                        is_use_deposit_fee: e.target.checked ? 1 : 0,
                      })
                    }}
                  />
                </>}
              <Button variant="contained" onClick={() => onChangeUserDeposit(25)}>
                지급하기
              </Button>
            </>}
          {changeUserDepositObj?.pay_type == 30 &&
            <>
              <Button variant="contained" onClick={() => onChangeUserDeposit(30)}>
                차감하기
              </Button>
            </>}
        </DialogActions>
      </Dialog>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={user?.level >= 40 ? '가맹점 추가' : ''}
            head_columns={[]}
            table={'users'}
            column_table={'merchandises'}
            excel_name={'가맹점'}
          />
        </Card>
      </Stack>
    </>
  )
}
UserList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default UserList
