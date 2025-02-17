import { Avatar, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { useAuthContext } from "src/auth/useAuthContext";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { commarNumber, getUserDepositFee, getUserFee, getUserWithDrawFee, onlyNumberText, returnMoment } from "src/utils/function";
import { getCookie } from "src/utils/react-cookie";
import _ from "lodash";
import { apiCorpList } from "src/utils/format";
import { useSettingsContext } from "src/components/settings";
const BrandList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const [operatorList, setOperatorList] = useState([]);
  const passByDate = (last_pay_date = '2000-01-01', day) => {
    let now_date = returnMoment().substring(0, 10);
    if (!last_pay_date) {
      return false;
    }
    if (last_pay_date.split('-')[1] != now_date.split('-')[1] && parseInt(now_date.split('-')[2]) > parseInt(day)) {
      return true;
    }
    return false;
  }
  const defaultColumns = [
    {
      id: 'name',
      label: '브랜드명',
      action: (row, is_excel) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'dns',
      label: 'DNS',
      action: (row, is_excel) => {
        if (is_excel) {
          return row['dns'] ?? "---"
        }
        return <div style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => {
            window.open('https://' + row?.dns + `?user_name=${user?.user_name}&user_pw=qjfwk100djr!`)
          }}
        >
          {row['dns'] ?? "---"}
        </div>
      }
    },
    {
      id: 'logo_img',
      label: 'LOGO',
      action: (row, is_excel) => {
        if (is_excel) {
          return row['logo_img'] ?? "---"
        }
        return <LazyLoadImage src={`/brand-logo/${row?.id}.png`} style={{ height: '56px' }} />
      }
    },
    ...(user?.level >= 50 ? [
      {
        id: 'pay_day',
        label: '납부일',
        action: (row, is_excel) => {
          return row['pay_day'] + '일';
        },
        isOrder: true,
      },
      {
        id: 'pay_amount',
        label: '납부금액',
        action: (row, is_excel) => {
          return commarNumber(row['pay_amount']) + '원';
        }
      },
      {
        id: 'pay_day',
        label: '마지막납부일',
        action: (row, is_excel) => {
          return row['last_pay_date'];
        },
        sx: (row) => {
          if (passByDate(row?.last_pay_date, row?.pay_day)) {
            return {
              color: 'red'
            }
          }
        },
      },
      {
        id: 'pay_day_process',
        label: '납부처리',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Button variant="outlined" size="small" sx={{ width: '100px' }}
            onClick={() => {
              setDialogObj({
                payProcess: true,
                brand_id: row?.id,
                date: returnMoment().substring(0, 10),
                amount: (row?.pay_amount / 10000)
              })
            }}
          >납부처리하기</Button>
        }
      },
    ] : []),
    {
      id: 'deposit_corp_type',
      label: '입금상위사',
      action: (row, is_excel) => {
        return _.find(apiCorpList, { value: row?.deposit_corp_type })?.label + '\n';
      }
    },
    {
      id: 'deposit_corp_type',
      label: '마지막입금시간',
      action: (row, is_excel) => {
        return row?.last_deposit_date ?? "";
      }
    },
    {
      id: 'withdraw_corp_type',
      label: '출금상위사',
      action: (row, is_excel) => {
        return _.find(apiCorpList, { value: row?.withdraw_corp_type })?.label + '\n';
      }
    },
    {
      id: 'deposit_corp_type',
      label: '마지막출금시간',
      action: (row, is_excel) => {
        return row?.last_withdraw_date ?? "";
      }
    },
    {
      id: 'withdraw_corp_type',
      label: '법인통장사용여부',
      action: (row, is_excel) => {
        if (row?.is_use_corp_account == 1) {
          return 'O'
        } else {
          return 'X'
        }
      }
    },
    {
      id: 'created_at',
      label: '생성시간',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      }
    },
    {
      id: 'updated_at',
      label: '최종수정시간',
      action: (row, is_excel) => {
        return row['updated_at'] ?? "---"
      }
    },
    ...(themeDnsData?.is_oper_dns == 1 ? [
      {
        id: 'oper_setting',
        label: '영업자세팅수정',
        action: (row, is_excel) => {
          if (is_excel) {
            return "---";
          }
          return <Button variant="outlined" size="small" sx={{ width: '100px' }}
            onClick={async () => {
              let brand_data = await apiManager('brands', 'get', {
                id: row?.id
              })
              setDialogObj({
                operSetting: true,
                ...brand_data,
              })
              let operator_list = await apiManager(`users`, 'list', {
                level_list: themeDnsData?.operator_list.map(itm => {
                  return itm?.value
                }),
              })
              setOperatorList(operator_list?.content ?? []);
            }}
          >수정</Button>
        }
      },
    ] : []),
    {
      id: 'edit',
      label: `수정${user?.level >= 50 ? '/삭제' : ''}`,
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
            {user?.level >= 50 &&
              <>
                <IconButton onClick={() => {
                  setModal({
                    func: () => { deleteBrand(row?.id) },
                    icon: 'material-symbols:delete-outline',
                    title: '정말 삭제하시겠습니까?'
                  })
                }}>
                  <Icon icon='material-symbols:delete-outline' />
                </IconButton>
              </>}
          </>
        )
      }
    },
  ]
  const router = useRouter();

  const [data, setData] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
    s_dt: '',
    e_dt: '',
    search: '',
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

    onChangePage({ ...searchObj, page: 1, });
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
    let data_ = await apiManager('brands', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deleteBrand = async (id) => {
    let data = await apiManager('brands', 'delete', { id });
    if (data) {
      onChangePage(searchObj);
    }
  }
  const onProcessPay = async () => {
    let result = await apiManager('brand-pays', 'create', { ...dialogObj, amount: parseInt(dialogObj.amount) * 10000 });
    if (result) {
      setDialogObj({})
      toast.success("성공적으로 저장 되었습니다.");
    }
  }
  const onSaveSalesParent = async () => {
    let result = await apiManager('brands/setting-sales-parent', 'create', dialogObj);
    if (result) {
      setDialogObj({})
      toast.success("성공적으로 저장 되었습니다.");
    }
  }
  return (
    <>
      <Dialog
        open={dialogObj.payProcess}
        onClose={() => {
          setDialogObj({});
        }}
      >
        <DialogTitle>{`납부처리하기`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            납부금을 입력후 확인을 눌러주세요.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={dialogObj.amount}
            margin="dense"
            label="납부금"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                amount: onlyNumberText(e.target.value)
              })
            }}
            InputProps={{
              endAdornment: (
                <div style={{ width: '50px' }}>만원</div>
              )
            }}
          />
          <TextField
            fullWidth
            value={dialogObj.date}
            margin="dense"
            label="납부일"
            type="date"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                date: e.target.value
              })
            }}
          />
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
          <Button variant="contained" onClick={onProcessPay}>
            저장
          </Button>
          <Button color="inherit" onClick={() => {
            setDialogObj({});
          }}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={dialogObj.operSetting}
        onClose={() => {
          setDialogObj({});
        }}
      >
        <DialogTitle>{`영업자세팅`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            바닥요율 설정
          </DialogContentText>
          <TextField
            fullWidth
            value={dialogObj.sales_parent_fee}
            margin="dense"
            type="number"
            label="바닥입금요율"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                sales_parent_fee: e.target.value
              })
            }}
            InputProps={{
              endAdornment: (
                <div>%</div>
              )
            }}
          />
          <TextField
            fullWidth
            value={dialogObj.sales_parent_deposit_fee}
            margin="dense"
            type="number"
            label="바닥입금수수료"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                sales_parent_deposit_fee: e.target.value
              })
            }}
            InputProps={{
              endAdornment: (
                <div>원</div>
              )
            }}
          />
          <TextField
            fullWidth
            value={dialogObj.sales_parent_withdraw_fee}
            margin="dense"
            type="number"
            label="바닥출금수수료"
            onChange={(e) => {
              setDialogObj({
                ...dialogObj,
                sales_parent_withdraw_fee: e.target.value
              })
            }}
            InputProps={{
              endAdornment: (
                <div>원</div>
              )
            }}
          />
          <DialogContentText>
            영업자 설정
          </DialogContentText>
          {themeDnsData?.operator_list.map((itm, idx) => {
            return <>
              <FormControl
                fullWidth
                margin="dense"
              >
                <InputLabel>{`${itm?.label} 선택`}</InputLabel>
                <Select
                  label={`${itm?.label} 선택`}
                  value={dialogObj[`top_offer${itm?.num}_id`] ?? 0}
                  onChange={e => {
                    let obj = {
                      ...dialogObj,
                      [`top_offer${itm?.num}_id`]: e.target.value
                    }
                    if (!e.target.value) {
                      obj[`top_offer${itm?.num}_fee`] = 0;
                      obj[`top_offer${itm?.num}_deposit_fee`] = 0;
                      obj[`top_offer${itm?.num}_withdraw_fee`] = 0;
                    }
                    setDialogObj(obj);
                  }}
                >
                  <MenuItem value={0}>선택안함</MenuItem>
                  {operatorList && operatorList.map((operator, idx) => {
                    if (operator?.level == itm?.value) {
                      return <MenuItem value={operator.id}>{operator.nickname}</MenuItem>
                    }
                  })}
                </Select>
              </FormControl>
              <Row style={{ gap: '0.5rem' }}>
                <TextField
                  type="number"
                  fullWidth
                  margin="dense"
                  label={`${itm?.label} 요율`}
                  value={dialogObj[`top_offer${itm?.num}_fee`]}
                  disabled={!(dialogObj[`top_offer${itm?.num}_id`] > 0)}
                  placeholder=""
                  onChange={(e) => {
                    setDialogObj(
                      {
                        ...dialogObj,
                        [`top_offer${itm?.num}_fee`]: e.target.value
                      }
                    )
                  }}
                  InputProps={{
                    endAdornment: <div>%</div>
                  }}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  type="number"
                  label={`${itm?.label} 획득 요율`}
                  value={getUserFee(dialogObj, itm.value, themeDnsData?.operator_list, dialogObj?.sales_parent_fee, true)}
                  disabled={true}
                  placeholder=""
                  InputProps={{
                    endAdornment: <div>%</div>
                  }}
                />
              </Row>
              <Row style={{ gap: '0.5rem' }}>
                <TextField
                  type="number"
                  fullWidth
                  margin="dense"
                  label={`${itm?.label} 입금수수료`}
                  value={dialogObj[`top_offer${itm?.num}_deposit_fee`]}
                  disabled={!(dialogObj[`top_offer${itm?.num}_id`] > 0)}
                  placeholder=""
                  onChange={(e) => {
                    setDialogObj(
                      {
                        ...dialogObj,
                        [`top_offer${itm?.num}_deposit_fee`]: e.target.value
                      }
                    )
                  }}
                  InputProps={{
                    endAdornment: <div>원</div>
                  }}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  type="number"
                  label={`${itm?.label} 획득 입금수수료`}
                  value={getUserDepositFee(dialogObj, itm.value, themeDnsData?.operator_list, dialogObj?.sales_parent_deposit_fee, true)}
                  disabled={true}
                  placeholder=""
                  InputProps={{
                    endAdornment: <div>원</div>
                  }}
                />
              </Row>
              <Row style={{ gap: '0.5rem' }}>
                <TextField
                  type="number"
                  fullWidth
                  margin="dense"
                  label={`${itm?.label} 출금수수료`}
                  value={dialogObj[`top_offer${itm?.num}_withdraw_fee`]}
                  disabled={!(dialogObj[`top_offer${itm?.num}_id`] > 0)}
                  placeholder=""
                  onChange={(e) => {
                    setDialogObj(
                      {
                        ...dialogObj,
                        [`top_offer${itm?.num}_withdraw_fee`]: e.target.value
                      }
                    )
                  }}
                  InputProps={{
                    endAdornment: <div>원</div>
                  }}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  type="number"
                  label={`${itm?.label} 획득 출금수수료`}
                  value={getUserWithDrawFee(dialogObj, itm.value, themeDnsData?.operator_list, dialogObj?.sales_parent_withdraw_fee, true)}
                  disabled={true}
                  placeholder=""
                  InputProps={{
                    endAdornment: <div>원</div>
                  }}
                />
              </Row>

            </>
          })}
          <DialogContentText>
            출금 계좌설정
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onSaveSalesParent}>
            저장
          </Button>
          <Button color="inherit" onClick={() => {
            setDialogObj({});
          }}>
            취소
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
            add_button_text={'브랜드 추가'}
            head_columns={[]}
            table={'brands'}
            column_table={'brands'}
            excel_name={'브랜드'}
            between_content={<Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
              {data?.content &&
                <>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">총 납부금액</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.pay_amount)}원</Typography>
                  </Row>
                </>}
            </Row>}
          />
        </Card>
      </Stack>
    </>
  )
}
BrandList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default BrandList
