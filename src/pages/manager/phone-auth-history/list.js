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
import { commarNumber, returnMoment } from "src/utils/function";

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
      id: 'acct_num',
      label: '계좌번호',
      action: (row, is_excel) => {
        return row['acct_num'] ?? "---"
      }
    },
    {
      id: 'type',
      label: '타입',
      action: (row, is_excel) => {
        return row?.auth_type == 0 ? '휴대폰' : '계좌'
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

  const [data, setData] = useState({});
  const [operUserList, setOperUserList] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
    s_dt: returnMoment().substring(0, 10),
    e_dt: returnMoment().substring(0, 10),
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
PhoneAuthHistoryList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PhoneAuthHistoryList
