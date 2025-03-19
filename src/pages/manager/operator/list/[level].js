import { Avatar, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { commarNumber, getReturnUri, getUserLevelByNumber } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { bankCodeList } from "src/utils/format";
import _ from "lodash";
import { useSettingsContext } from "src/components/settings";
import navConfig from "src/layouts/manager/nav/config-navigation";
const OperatorList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const [data, setData] = useState({});
  const defaultColumns = [
    {
      id: 'profile_img',
      label: '유저프로필',
      action: (row, is_excel) => {
        if (is_excel) {
          return row['profile_img'];
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
          router.push(`/manager/operator/edit/${row?.id}`)
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
    ...(themeDnsData?.is_oper_dns != 1 ? [
      {
        id: 'update_user_deposit',
        label: '정산금 수정',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Button variant="outlined" size="small" sx={{ width: '100px' }}
            onClick={() => {
              setDialogObj({ changeUserDeposit: true })
              setChangeUserDepositObj({
                amount: '',
                user_id: row?.id,
              })
            }}
          >정산금 수정</Button>
        }
      },
      ...(themeDnsData?.withdraw_type == 0 ? [
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
    ] : []),
    {
      id: 'settle_amount',
      label: themeDnsData?.is_oper_dns == 1 ? '정산금' : '보유정산금',
      action: (row, is_excel) => {
        return commarNumber(row['settle_amount'])
      },
      sx: (row) => {
        return {
          color: themeDnsData?.is_oper_dns == 1 ? 'green' : ''
        }
      },
    },
    ...(data?.children_brands ? data?.children_brands.map(el => {
      return {
        id: 'settle_amount',
        label: el?.name + (themeDnsData?.is_oper_dns == 1 ? ` 정산금` : ` 보유정산금`),
        action: (row, is_excel) => {
          return commarNumber(row[`settle_amount_${el?.id}`])
        }
      }
    }) : []),
    ...(themeDnsData?.is_oper_dns == 1 ? [
      {
        id: 'withdraw_amount',
        label: '출금액',
        action: (row, is_excel) => {
          return commarNumber(row['withdraw_amount'] * (-1))
        },
        sx: (row) => {
          return {
            color: 'red'
          }
        },
      },
      ...(data?.children_brands ? data?.children_brands.map(el => {
        return {
          id: `withdraw_amount_${el?.id}`,
          label: el?.name + ` 출금액`,
          action: (row, is_excel) => {
            return commarNumber(row[`withdraw_amount_${el?.id}`] * (-1))
          },
        }
      }) : []),
      {
        id: 'update_user_deposit',
        label: '수기지급/차감',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Button variant="outlined" size="small" sx={{ width: '120px' }}
            onClick={() => {
              setDialogObj({ changeUserDeposit: true })
              setChangeUserDepositObj({
                amount: '',
                user_id: row?.id,
              })
            }}
          >수기지급/차감</Button>
        }
      },
      {
        id: 'manager_plus_amount',
        label: '수기지급액',
        action: (row, is_excel) => {
          return commarNumber(row['manager_plus_amount'])
        }
      },
      {
        id: 'manager_minus_amount',
        label: '수기차감액',
        action: (row, is_excel) => {
          return commarNumber(row['manager_minus_amount'])
        }
      },
      {
        id: 'withdraw_amount',
        label: '출금/수기 차액',
        action: (row, is_excel) => {
          return commarNumber((row?.withdraw_amount ?? 0) * (-1) - row['manager_plus_amount'] - row['manager_minus_amount'])
        }
      },
    ] : []),
    ...(themeDnsData?.is_oper_dns != 1 ? [
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
    ] : []),
    {
      id: 'phone_num',
      label: '전화번호',
      action: (row, is_excel) => {
        return row['phone_num'] ?? "---"
      }
    },
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
          return "---"
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
    {
      id: 'edit_password',
      label: '비밀번호 변경',
      action: (row, is_excel) => {
        if (user?.level < row?.level) {
          return "---"
        }
        return (
          <>
            <IconButton onClick={() => {
              setDialogObj({ ...dialogObj, changePassword: true })
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
        return (
          <>
            <IconButton onClick={() => {
              router.push(`/manager/operator/edit/${row?.id}`)
            }}>
              <Icon icon='material-symbols:edit-outline' />
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
  ]
  const navList = navConfig();
  const router = useRouter();


  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
    s_dt: '',
    e_dt: '',
    search: '',
    level: router.query?.level
  })
  const [dialogObj, setDialogObj] = useState({
    changePassword: false,
  })
  const [changeUserDepositObj, setChangeUserDepositObj] = useState({
    amount: 0,
  })
  const [changePasswordObj, setChangePasswordObj] = useState({
    id: '',
    user_pw: ''
  })
  const didRun = useRef(false);
  useEffect(() => {
    pageSetting();
  }, [router.query]);
  const pageSetting = () => {

    onChangePage({ ...searchObj, page: 1, level: router.query?.level });
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
  const onChangeUserDeposit = async (pay_type) => {
    setDialogObj({})
    setChangeUserDepositObj({})
    let result = await apiManager(`users/change-deposit`, 'create', {
      amount: changeUserDepositObj.amount,
      pay_type,
      user_id: changeUserDepositObj?.user_id,
      note: changeUserDepositObj?.note
    })
    if (result) {

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
        <DialogTitle>{themeDnsData?.is_oper_dns == 1 ? `수기 지급/차감` : `정산금 관리자 수정`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {themeDnsData?.is_oper_dns == 1 ? `수기처리할 금액을 입력해 주세요.` : `수정할 금액을 입력해 주세요.`}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={changeUserDepositObj.amount}
            margin="dense"
            label="금액"
            type="number"
            onChange={(e) => {
              setChangeUserDepositObj({
                ...changeUserDepositObj,
                amount: e.target.value
              })
            }}
          />
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
          <Button variant="contained" onClick={() => onChangeUserDeposit(25)}>
            {themeDnsData?.is_oper_dns == 1 ? `지급하기` : `적립하기`}
          </Button>
          <Button variant="outlined" onClick={() => onChangeUserDeposit(30)}>
            차감하기
          </Button>
        </DialogActions>
      </Dialog>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={defaultColumns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={''}
            head_columns={[]}
            table={'users'}
            column_table={`operator_${router.query?.level}`}
            excel_name={getUserLevelByNumber(router.query?.level)}
          />
        </Card>
      </Stack>
    </>
  )
}
OperatorList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default OperatorList
