import { Autocomplete, Avatar, Button, Card, CardContent, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";
import { bankCodeList, operatorLevelList, virtualAccountStatusList, virtualAccountUserTypeList } from "src/utils/format";
import { useSettingsContext } from "src/components/settings";
import { commarNumber, onlyNumberText } from "src/utils/function";
import GaugeBar from "src/components/elements/GaugeBar";

const VirtualAccountList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();

  const defaultColumns = [
    {
      id: 'user_name',
      label: '가맹점',
      action: (row, is_excel) => {
        if (is_excel) {
          return `${row[`nickname`]} (${row['user_name']})`
        }
        let text = row['user_name'] ? `${row[`nickname`]}\n(${row['user_name']})` : "---";
        return <div style={{ whiteSpace: 'pre', cursor: `${user?.level >= 40 ? 'pointer' : ''}` }} onClick={() => {
          if (user?.level >= 40) {
            setDialogObj({
              connectMcht: true,
              virtual_account_id: row?.id,
            })
          }
        }}>{text}</div>
      }
    },
    {
      id: 'virtual_bank_code',
      label: '가상계좌은행',
      action: (row, is_excel) => {
        return _.find(bankCodeList(), { value: row['virtual_bank_code'] })?.label ?? "---"
      }
    },
    {
      id: 'virtual_acct_num',
      label: '가상계좌번호',
      action: (row, is_excel) => {
        if (row?.status == 0) {
          return row['virtual_acct_num'] ?? "---"
        } else {
          return "---";
        }
      }
    },
    {
      id: 'virtual_acct_name',
      label: '가상계좌명',
      action: (row, is_excel) => {
        return row['virtual_acct_name'] ?? "---"
      }
    },
    {
      id: 'guid',
      label: 'USER GUID',
      action: (row, is_excel) => {
        return row['guid'] ?? "---"
      }
    },
    {
      id: 'status',
      label: '상태',
      action: (row, is_excel) => {
        if (is_excel) {
          return _.find(virtualAccountStatusList, { value: row?.status })?.label
        }
        if (user?.level >= 40 && themeDnsData?.deposit_process_type == 1) {
          return <Select
            size='small'
            value={row?.status}
            disabled={!(user?.level >= 40)}
            onChange={async (e) => {
              let result = await apiManager(`virtual-accounts/change-status`, 'update', {
                id: row?.id,
                status: e.target.value
              });
              if (result) {
                onChangePage(searchObj)
              }
            }}
          >
            {virtualAccountStatusList.map(el => {
              return <MenuItem value={el?.value}>{el?.label}</MenuItem>
            })}
          </Select>
        } else {
          return <Chip variant="soft" label={_.find(virtualAccountStatusList, { value: row?.status })?.label} color={_.find(virtualAccountStatusList, { value: row?.status })?.color} />
        }
      }
    },
    {
      id: 'deposit_link',
      label: '가상계좌주소',
      action: (row, is_excel) => {
        let link = 'https://' + themeDnsData?.dns + `/virtual-account/result/?ci=${row?.ci}`;
        if (is_excel) {
          return link
        }
        if (row?.status == 0) {
          return <div style={{
            cursor: 'pointer',
            color: 'blue',
          }}
            onClick={() => {
              window.open(`/virtual-account/result/?ci=${row?.ci}`)
            }}
          >
            {link}
          </div>
        } else {
          return '---';
        }
      }
    },
    ...(themeDnsData?.deposit_corp_type == 7 ? [

      {
        id: 'deposit_create',
        label: '입금데이터 추가',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Button variant="outlined" size="small"
            onClick={() => {
              setDialogObj({
                addDeposit: true,
                virtual_account_id: row?.id,
              })
            }}
          >추가</Button>
        }
      },
      {
        id: 'deposit_history',
        label: '입금내역',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Button variant="outlined" size="small"
            sx={{ width: '84px' }}
            onClick={() => {
              router.push(`/manager/deposit/list?virtual_account_id=${row?.id}`)
            }}
          >입금내역</Button>
        }
      },
    ] : []),
    ...(themeDnsData?.deposit_process_type == 1 ? [
      {
        id: 'deposit_limit',
        label: '입금잔여',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <GaugeBar
            current={row?.daily_deposit_amount ?? 0}
            total={8000000}
          />
        }
      },
    ] : []),
    ...(themeDnsData?.setting_obj?.is_use_virtual_user_name == 1 ? [
      {
        id: 'virtual_user_name',
        label: '유저아이디',
        action: (row, is_excel) => {
          return <div style={{ cursor: 'pointer' }} onClick={() => {
            setDialogObj({
              changeVirtualUserName: true,
              virtual_user_name: '',
              virtual_account_id: row?.id,
            })
          }}>{row['virtual_user_name'] ?? "---"}</div>
        }
      },
    ] : []),
    {
      id: 'deposit_bank_code',
      label: '입금은행정보',
      action: (row, is_excel) => {
        if (is_excel) {
          return `${_.find(bankCodeList(), { value: row['deposit_bank_code'] })?.label ?? "---"} ${row['deposit_acct_num']} ${row['deposit_acct_name']} ${row['birth']} ${row['phone_num']}`
        }
        return <Col>
          <div>{_.find(bankCodeList(), { value: row['deposit_bank_code'] })?.label ?? "---"}</div>
          <div>{row['deposit_acct_num']} {row['deposit_acct_name']}</div>
          <div>{row['birth']} {row['phone_num']}</div>
        </Col>
      }
    },
    ...((user?.level >= 40 && themeDnsData?.deposit_corp_type == 1) ? [
      {
        id: 'status',
        label: '상태확인',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Col style={{ alignItems: 'center', rowGap: '0.5rem' }}>
            <Button variant="outlined" size="small" sx={{ width: '100px' }}
              onClick={() => {
                getStatus(row?.id)
              }}
            >상태확인</Button>
          </Col>
        }
      },
      {
        id: 'balance',
        label: '잔액확인',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Col style={{ alignItems: 'center', rowGap: '0.5rem' }}>
            <Button variant="outlined" size="small" sx={{ width: '100px' }}
              onClick={() => {
                getBalance(row?.id)
              }}
            >잔액확인</Button>
            <Button variant="contained" size="small" sx={{ width: '100px' }}
              onClick={() => {
                moveToMother(row?.id)
              }}
            >모계좌이동</Button>
          </Col>
        }
      },
    ] : []),
    {
      id: 'user_type',
      label: '사용자구분',
      action: (row, is_excel) => {
        let text = `${_.find(virtualAccountUserTypeList, { value: row['user_type'] })?.label ?? "---"}`;
        return text
      }
    },
    {
      id: 'created_at',
      label: '생성일',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      }
    },
    /*
    {
          id: 'edit',
          label: '이어서 생성',
          action: (row, is_excel) => {
            if (is_excel) {
              return `---`
            }
            return (row['status'] == 5 || row['is_delete'] == 1) ? <>
              <IconButton>
                <Icon icon='material-symbols:edit-outline' onClick={() => {
                  router.push(`edit/${row?.id}`)
                }} />
              </IconButton>
            </> : "---"
          }
        },
    */
    ...(user?.level >= 10 ? [
      {
        id: 'delete',
        label: '삭제',
        action: (row, is_excel) => {
          if (is_excel) {
            return `---`
          }
          return (
            <>
              <IconButton onClick={() => {
                setModal({
                  func: () => { deleteItem(row?.id) },
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
  const router = useRouter();

  const [data, setData] = useState({});
  const [operUserList, setOperUserList] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
    s_dt: '',
    e_dt: '',
    search: '',
    is_sales_man: true,
  })
  const [dialogObj, setDialogObj] = useState({
    changePassword: false,
    changeVirtualUserName: false,
  })
  const [changePasswordObj, setChangePasswordObj] = useState({
    id: '',
    user_pw: ''
  })
  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {

    if (user?.level >= 40) {
      getAllOperUser();
    }
    onChangePage({ ...searchObj, page: 1, });
  }
  const getAllOperUser = async () => {
    let data = await apiManager('users', 'list', {
      level: 10,
    });
    setOperUserList(data?.content ?? []);
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
    let data_ = await apiManager('virtual-accounts', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deleteItem = async (id) => {
    setPageLoading(true);
    toast.error('삭제처리가 완료될때까지 기다려주세요....');
    let data = await apiManager('virtual-accounts', 'delete', { id });
    setPageLoading(false);
    if (data) {

      toast.success('삭제처리가 완료되었습니다.');
      onChangePage();
    }
  }
  const deleteItemByMcht = async (id) => {
    if (!(searchObj?.mcht_id > 0)) {
      toast.error('가맹점 선택을 해주세요.');
      return;
    }
    setPageLoading(true);
    toast.error('삭제처리가 완료될때까지 기다려주세요....');
    let data = await apiManager('virtual-accounts/mcht', 'delete', { id: searchObj?.mcht_id });
    setPageLoading(false);
    if (data) {
      toast.success('삭제처리가 완료되었습니다.');
      onChangePage();
    }
  }
  const getBalance = async (id) => {
    let result = await apiManager('virtual-accounts/balance', 'get', {
      id: id,
    })
    toast.success(`${commarNumber(result?.amount)}원`)
  }
  const getStatus = async (id) => {
    let result = await apiManager('virtual-accounts/status', 'get', {
      id: id,
    })
    if (result?.status == 0) {
      toast.success(`정상상태`)
    } else {
      toast.error(`해지상태`)
    }
  }
  const moveToMother = async (id) => {
    let result = await apiManager('virtual-accounts/mother', 'create', {
      id: id,
    })
    if (result) {
      toast.success(`성공적으로 이동 되었습니다.`);
    }
  }
  const onChangeVirtualUserName = async () => {
    let result = undefined
    result = await apiManager('virtual-accounts/change-virtual-user-name', 'create', dialogObj);
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      setDialogObj({});
      onChangePage(searchObj);
    }
  }
  const connectMcht = async () => {
    let result = undefined
    result = await apiManager('virtual-accounts/connect-mcht', 'create', dialogObj);
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      setDialogObj({});
      onChangePage(searchObj);
    }
  }
  const addDepositItem = async () => {
    if (!window.confirm(`${commarNumber(dialogObj?.amount)}원을 입금 신청하겠습니까?`)) {
      return;
    }
    let result = undefined
    result = await apiManager('virtual-accounts/request-deposit', 'create', dialogObj);
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      setDialogObj({});
      onChangePage(searchObj);
    }
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
        open={dialogObj.addDeposit}
        onClose={() => {
          setDialogObj({})
        }}
      >
        <DialogTitle>{`입금데이터 추가`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            입금예정금액을 입력 후 확인을 눌러주세요.
          </DialogContentText>
          <Row style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            {[1, 3, 5, 10, 30, 50, 100, 200].map(num => (
              <>
                <Button variant="outlined" onClick={() => {
                  setDialogObj({
                    ...dialogObj,
                    amount: (dialogObj?.amount ?? 0) + num * 10000
                  })
                }}>{commarNumber(num * 10000)}원</Button>
              </>
            ))}
            <Button variant="outlined" onClick={() => {
              setDialogObj({
                ...dialogObj,
                amount: 0
              })
            }}>초기화</Button>
          </Row>
          <TextField
            autoFocus
            fullWidth
            value={dialogObj.amount}
            margin="dense"
            label="입금액"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                amount: onlyNumberText(e.target.value)
              })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={addDepositItem}>
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
        open={dialogObj.changeVirtualUserName}
        onClose={() => {
          setDialogObj({})
        }}
      >
        <DialogTitle>{`유저아이디 변경`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            유저아이디를 입력 후 확인을 눌러주세요.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={dialogObj.virtual_user_name}
            margin="dense"
            label="유저아이디"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                virtual_user_name: e.target.value
              })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onChangeVirtualUserName}>
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
        open={dialogObj.connectMcht}
        onClose={() => {
          setDialogObj({})
        }}
      >
        <DialogTitle>{`가맹점 매칭`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            가맹점 선택 후 확인을 눌러주세요.
          </DialogContentText>
          <Autocomplete
            fullWidth
            autoComplete='new-password'
            options={operUserList}
            style={{
              whiteSpace: 'pre'
            }}
            getOptionLabel={(option) => `${option?.user_name} (${option?.nickname})`}
            value={dialogObj?.mcht_id}
            onChange={(e, value) => {
              setDialogObj({
                ...dialogObj,
                mcht_id: value?.id
              })
            }}
            renderInput={(params) => (
              <TextField {...params} label="가맹점선택" placeholder="가맹점선택" autoComplete='new-password' />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => {
            setModal({
              func: () => { connectMcht() },
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
          <Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
            {user?.level >= 40 &&
              <>
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
              </>}
            <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
              <InputLabel>상태</InputLabel>
              <Select label='상태' value={searchObj[`status`]}
                onChange={(e) => {
                  onChangePage({ ...searchObj, [`status`]: e.target.value, page: 1, })
                }}>
                <MenuItem value={null}>상태 전체</MenuItem>
                {virtualAccountStatusList.map(status => {
                  return <MenuItem value={status?.value}>{status.label}</MenuItem>
                })}
              </Select>
            </FormControl>
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
            {user?.level >= 40 &&
              <>
                <Button variant="outlined" sx={{}} onClick={() => {
                  setModal({
                    func: () => { deleteItemByMcht() },
                    icon: 'material-symbols:delete-outline',
                    title: '가상계좌 일괄삭제 하시겠습니까?'
                  })
                }}>가맹점 하부 가상계좌 삭제</Button>
              </>}
          </Row>

          <ManagerTable
            data={data}
            columns={defaultColumns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={''}
            head_columns={[]}
            table={'virtual-accounts'}
            column_table={`virtual_accounts`}
            excel_name={'가상계좌'}
            between_content={<Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
              <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                <Typography variant="body2">조회건수</Typography>
                <Typography variant="subtitle2">{commarNumber(data?.total)}</Typography>
              </Row>
            </Row>}
          />
        </Card>
      </Stack>
    </>
  )
}
VirtualAccountList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default VirtualAccountList
