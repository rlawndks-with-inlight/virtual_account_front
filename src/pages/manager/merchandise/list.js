import { Avatar, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { commarNumber, getUserFee, getUserLevelByNumber, getUserStatusByNum } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { bankCodeList, operatorLevelList } from "src/utils/format";
import { useSettingsContext } from "src/components/settings";
import _ from "lodash";
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
      id: 'user_name',
      label: '유저아이디',
      action: (row, is_excel) => {
        return row['user_name'] ?? "---"
      }
    },
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
    {
      id: 'mid',
      label: 'MID',
      action: (row, is_excel) => {
        return row['mid'] ?? "---"
      }
    },
    {
      id: 'nickname',
      label: '닉네임',
      action: (row, is_excel) => {
        return row['nickname'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '이름',
      action: (row, is_excel) => {
        return row['name'] ?? "---"
      }
    },
    ...(themeDnsData?.withdraw_type == 0 ? [
      {
        id: 'name',
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
              window.open(link)
            }}
          >
            {link}
          </div>
        }
      },

      {
        id: 'virtual_bank_code',
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
      id: 'virtual_bank_code',
      label: '정산계좌정보',
      action: (row, is_excel) => {
        if (themeDnsData?.withdraw_type == 0) {
          if (is_excel) {
            return `${_.find(bankCodeList(), { value: row['settle_bank_code'] })?.label ?? "---"} ${row['settle_acct_num']} ${row['settle_acct_name']}`
          }
          return <Col>
            <div>{_.find(bankCodeList(), { value: row['settle_bank_code'] })?.label ?? "---"}</div>
            <div>{row['settle_acct_num']} {row['settle_acct_name']}</div>
          </Col>
        } else if (themeDnsData?.withdraw_type == 1) {
          if (is_excel) {
            return `${_.find(bankCodeList(), { value: row['withdraw_bank_code'] })?.label ?? "---"} ${row['withdraw_acct_num']} ${row['withdraw_acct_name']}`
          }
          return <Col>
            <div>{_.find(bankCodeList(), { value: row['withdraw_bank_code'] })?.label ?? "---"}</div>
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
      id: 'phone_num',
      label: '전화번호',
      action: (row, is_excel) => {
        return row['phone_num'] ?? "---"
      }
    },
    ...(user?.level >= 40 ? [
      {
        id: 'mcht_fee',
        label: '가맹점 요율',
        action: (row, is_excel) => {
          return row['mcht_fee'] + '%'
        }
      },
    ] : []),
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
          id: `sales${operator?.num}_fee`,
          label: `${operator?.label} 요율`,
          action: (row, is_excel) => {
            return row[`sales${operator?.num}_id`] > 0 ? row[`sales${operator?.num}_fee`] + '%' : "---"
          }
        },
        {
          id: `sales${operator?.num}_fee`,
          label: `${operator?.label} 획득 요율`,
          action: (row, is_excel) => {
            return row[`sales${operator?.num}_id`] > 0 ? parseFloat(getUserFee(row, operator?.value, themeDnsData?.operator_list, themeDnsData?.deposit_head_office_fee)) + '%' : "---"
          }
        },
      ]
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
  ]
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
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
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('users', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
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
        <DialogTitle>{`정산금 관리자 수정`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            수정할 금액을 입력해 주세요.
          </DialogContentText>
          <TextField
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
            autoFocus
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
            적립하기
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
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'가맹점 추가'}
            head_columns={[]}
            table={'users'}
            excel_name={'가맹점'}
          />
        </Card>
      </Stack>
    </>
  )
}
UserList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default UserList
