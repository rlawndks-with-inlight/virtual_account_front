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
import { commarNumber } from "src/utils/function";

const PhoneAuthHistoryList = () => {
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
      id: 'phone_num',
      label: '휴대폰번호',
      action: (row, is_excel) => {
        return row['phone_num'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '이름',
      action: (row, is_excel) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'amount',
      label: '발생비용',
      action: (row, is_excel) => {
        return commarNumber(row['amount'])
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
    let cols = defaultColumns;
    setColumns(cols)
    getAllOperUser();
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
    let data_ = await apiManager('phone-auth-histories', 'list', obj);
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
          </Row>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'가상계좌 발급'}
            head_columns={[]}
            table={'virtual-accounts'}
            column_table={`virtual_accounts`}
            excel_name={'가상계좌'}
            between_content={<Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
              <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                <Typography variant="body2">조회건수</Typography>
                <Typography variant="subtitle2">{commarNumber(data?.total)}</Typography>
              </Row>
              <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                <Typography variant="body2">총발생비용</Typography>
                <Typography variant="subtitle2">{commarNumber(data?.chart?.amount)}원</Typography>
              </Row>
            </Row>}
          />
        </Card>
      </Stack>
    </>
  )
}
PhoneAuthHistoryList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PhoneAuthHistoryList
