import { Avatar, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Stack, TextField, Typography } from "@mui/material";
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
import { commarNumber, onlyNumberText, returnMoment } from "src/utils/function";
import { getCookie } from "src/utils/react-cookie";
const BrandList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
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
            let token = getCookie('token');
            console.log(token)
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
        return <LazyLoadImage src={row['logo_img']} style={{ height: '56px' }} />
      }
    },
    {
      id: 'favicon_img',
      label: 'FAVICON',
      action: (row, is_excel) => {
        if (is_excel) {
          return row['favicon_img'] ?? "---"
        }
        return <LazyLoadImage src={row['favicon_img']} style={{ height: '56px' }} />
      }
    },
    ...(user?.level >= 50 ? [
      {
        id: 'pay_day',
        label: '납부일',
        action: (row, is_excel) => {
          return row['pay_day'] + '일';
        }
      },
      {
        id: 'pay_amount',
        label: '납부금액',
        action: (row, is_excel) => {
          return commarNumber(row['pay_amount']) + '원';
        }
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
  const [columns, setColumns] = useState([]);
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
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, page: 1, });
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('brands', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
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
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
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
